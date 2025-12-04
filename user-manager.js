/**
 * 用户管理器
 * 处理用户注册、登录、积分管理等功能
 */
class UserManager {
    constructor() {
        this.currentUser = null;
        this.storageKey = CONFIG.STORAGE.PREFIX + 'user_data';
        this.init();
    }
    
    init() {
        // 尝试加载现有用户
        this.loadUser();
        
        // 如果没有用户，创建新用户
        if (!this.currentUser) {
            this.createUser();
        }
        
        // 监听页面关闭保存数据
        window.addEventListener('beforeunload', () => this.saveUser());
        
        // 定期自动保存
        setInterval(() => this.saveUser(), 30000);
        
        console.log('👤 用户系统初始化完成');
    }
    
    createUser() {
        // 生成随机用户名
        const prefixes = ['桃色', '汽水', '精灵', '魔法', '梦幻', '星光', '彩虹', '泡泡'];
        const suffixes = ['契约者', '使者', '学徒', '骑士', '守护者', '旅人', '粉丝', '伙伴'];
        
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        const username = prefix + suffix;
        
        // 创建用户对象
        this.currentUser = {
            id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            username: username,
            avatar: 'default',
            points: 1000, // 初始积分
            level: 1,
            gameHistory: [],
            lotteryHistory: [],
            messages: [],
            achievements: [],
            settings: {
                theme: 'rainbow',
                sound: true,
                notifications: true
            },
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };
        
        this.saveUser();
        console.log('🎉 创建新用户:', this.currentUser.username);
        
        return this.currentUser;
    }
    
    addPoints(amount, source = 'game') {
        if (!this.currentUser) return;
        
        const oldPoints = this.currentUser.points;
        this.currentUser.points += amount;
        
        // 记录游戏历史
        if (source === 'game') {
            this.currentUser.gameHistory.push({
                type: source,
                amount: amount,
                timestamp: new Date().toISOString()
            });
        }
        
        // 保存更新
        this.saveUser();
        
        // 触发事件
        this.triggerEvent('pointsUpdated', {
            oldPoints: oldPoints,
            newPoints: this.currentUser.points,
            delta: amount,
            source: source
        });
        
        // 更新等级
        this.updateLevel();
        
        return this.currentUser.points;
    }
    
    usePoints(amount) {
        if (!this.currentUser || this.currentUser.points < amount) {
            return false;
        }
        
        this.currentUser.points -= amount;
        this.saveUser();
        
        this.triggerEvent('pointsUsed', {
            amount: amount,
            remaining: this.currentUser.points
        });
        
        return true;
    }
    
    updateLevel() {
        if (!this.currentUser) return;
        
        // 简单的等级计算：每1000点升一级
        const newLevel = Math.floor(this.currentUser.points / 1000) + 1;
        
        if (newLevel > this.currentUser.level) {
            const oldLevel = this.currentUser.level;
            this.currentUser.level = newLevel;
            
            // 触发升级事件
            this.triggerEvent('levelUp', {
                oldLevel: oldLevel,
                newLevel: newLevel,
                totalPoints: this.currentUser.points
            });
            
            console.log(`🎮 升级！等级 ${oldLevel} → ${newLevel}`);
        }
    }
    
    saveUser() {
        if (!this.currentUser) return;
        
        try {
            const data = {
                user: this.currentUser,
                expires: Date.now() + (CONFIG.STORAGE.USER_DATA_EXPIRY * 24 * 60 * 60 * 1000)
            };
            
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            console.log('💾 用户数据已保存');
        } catch (error) {
            console.error('❌ 保存用户数据失败:', error);
        }
    }
    
    loadUser() {
        try {
            const dataStr = localStorage.getItem(this.storageKey);
            if (!dataStr) return null;
            
            const data = JSON.parse(dataStr);
            
            // 检查数据是否过期
            if (data.expires && data.expires < Date.now()) {
                localStorage.removeItem(this.storageKey);
                return null;
            }
            
            this.currentUser = data.user;
            this.currentUser.lastLogin = new Date().toISOString();
            
            console.log('👤 加载用户:', this.currentUser.username);
            return this.currentUser;
        } catch (error) {
            console.error('❌ 加载用户数据失败:', error);
            return null;
        }
    }
    
    triggerEvent(eventName, data) {
        const event = new CustomEvent(`taoci:${eventName}`, { detail: data });
        window.dispatchEvent(event);
    }
    
    // 获取用户信息
    getUserInfo() {
        return this.currentUser ? { ...this.currentUser } : null;
    }
    
    // 获取积分
    getPoints() {
        return this.currentUser ? this.currentUser.points : 0;
    }
    
    // 获取等级
    getLevel() {
        return this.currentUser ? this.currentUser.level : 1;
    }
    
    // 获取用户名
    getUsername() {
        return this.currentUser ? this.currentUser.username : '匿名契约者';
    }
    
    // 添加成就
    addAchievement(achievementId, name, description) {
        if (!this.currentUser) return;
        
        // 检查是否已有该成就
        const hasAchievement = this.currentUser.achievements.some(
            a => a.id === achievementId
        );
        
        if (!hasAchievement) {
            this.currentUser.achievements.push({
                id: achievementId,
                name: name,
                description: description,
                unlockedAt: new Date().toISOString()
            });
            
            this.saveUser();
            
            // 触发成就解锁事件
            this.triggerEvent('achievementUnlocked', {
                id: achievementId,
                name: name,
                description: description
            });
            
            console.log(`🏆 成就解锁: ${name}`);
            
            return true;
        }
        
        return false;
    }
}

// 创建全局实例
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserManager;
} else {
    window.UserManager = UserManager;
}
