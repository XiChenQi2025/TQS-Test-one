import { config } from '../../../config/config.js';

/**
 * 用户管理类
 * 处理用户注册、登录、注销等操作
 * 使用本地存储保存用户状态
 */
class UserManager {
    constructor() {
        this.localStorage = new LocalStorage();
        this.currentUser = this.localStorage.getUser();
        this.#init();
    }

    #init() {
        // 初始化时更新用户状态
        if (this.currentUser) {
            this.#updateLastLogin();
        }
    }

    async register(userData) {
        try {
            // 验证输入
            if (!userData.username || !userData.password) {
                throw new Error('用户名和密码不能为空');
            }

            // 检查用户名是否已存在
            if (this.localStorage.getUserByUsername(userData.username)) {
                throw new Error('用户名已存在');
            }

            // 生成用户信息
            const newUser = {
                id: Date.now().toString(36),
                username: userData.username,
                password: this.#hashPassword(userData.password),
                nickname: userData.nickname || '桃色契约者',
                gender: userData.gender || 'female',
                ip: await this.#getUserIP(),
                points: Math.floor(Math.random() * 4001) + 1000,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            };

            // 保存用户数据
            this.localStorage.setUser(newUser);
            this.currentUser = newUser;
            
            return { success: true, user: newUser };
        } catch (error) {
            console.error('注册失败:', error);
            return { success: false, message: error.message };
        }
    }

    async login(username, password) {
        try {
            const user = this.localStorage.getUserByUsername(username);
            
            if (!user) return { success: false, message: '用户不存在' };
            if (user.password !== this.#hashPassword(password)) {
                return { success: false, message: '密码错误' };
            }

            // 更新登录时间
            user.lastLogin = new Date().toISOString();
            this.localStorage.setUser(user);
            this.currentUser = user;
            
            return { success: true, user };
        } catch (error) {
            console.error('登录失败:', error);
            return { success: false, message: '登录失败，请重试' };
        }
    }

    logout() {
        this.localStorage.removeUser();
        this.currentUser = null;
    }

    updateUser(updateData) {
        if (!this.currentUser) return false;
        
        const updatedUser = {
            ...this.currentUser,
            ...updateData,
            lastUpdated: new Date().toISOString()
        };

        this.localStorage.setUser(updatedUser);
        this.currentUser = updatedUser;
        return true;
    }

    updatePoints(change) {
        if (!this.currentUser) return 0;
        
        this.currentUser.points += change;
        this.localStorage.setUser(this.currentUser);
        return this.currentUser.points;
    }

    #hashPassword(password) {
        // 使用SHA-256哈希加盐（需引入CryptoJS）
        return CryptoJS.SHA256(password + config.system.security.salt).toString();
    }

    async #getUserIP() {
        // 模拟获取IP地址（实际应使用真实API）
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.warn('无法获取IP地址，使用默认值');
            return '203.0.113.1';
        }
    }

    #updateLastLogin() {
        if (this.currentUser) {
            this.currentUser.lastLogin = new Date().toISOString();
            this.localStorage.setUser(this.currentUser);
        }
    }
}

export default UserManager;
