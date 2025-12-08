/**
 * 桃汽水魔力补给站 - API客户端
 * 封装所有后端API通信，提供统一的调用接口
 * 支持离线模式、请求缓存、错误重试
 */

import configManager from '../core/config.js';
import { emitEvent, onEvent } from '../core/events.js';
import storage from './storage.js';
import device from './device.js';

class TaociApiClient {
    constructor() {
        this.baseUrl = '';
        this.token = '';
        this.userId = '';
        this.isOffline = false;
        this.pendingRequests = new Map();
        this.requestQueue = [];
        this.isProcessingQueue = false;
        
        this.init();
    }
    
    /**
     * 初始化API客户端
     */
    init() {
        // 从配置获取API基础地址
        this.updateBaseUrl();
        
        // 从本地存储恢复用户会话
        this.restoreSession();
        
        // 监听配置变化
        configManager.onChange('API.BASE_URL', (newUrl) => {
            this.baseUrl = newUrl;
        });
        
        // 监听网络状态变化
        this.setupNetworkListener();
        
        console.log('🍑 API客户端已初始化');
    }
    
    /**
     * 更新API基础地址
     */
    updateBaseUrl() {
        this.baseUrl = configManager.get('API.BASE_URL', '');
        
        // 如果是开发环境，自动检测本地服务器
        if (this.baseUrl === '' && window.location.hostname === 'localhost') {
            this.baseUrl = 'http://localhost:3000/api';
            console.log('🚀 开发模式，使用本地服务器:', this.baseUrl);
        }
    }
    
    /**
     * 从本地存储恢复会话
     */
    restoreSession() {
        const session = storage.get('taoci_session');
        if (session) {
            this.token = session.token || '';
            this.userId = session.userId || '';
            
            if (this.token && this.userId) {
                console.log('🔑 已恢复用户会话:', this.userId);
                emitEvent('session:restored', { userId: this.userId });
            }
        }
    }
    
    /**
     * 设置网络状态监听
     */
    setupNetworkListener() {
        // 监听在线/离线状态
        window.addEventListener('online', () => {
            this.isOffline = false;
            console.log('🌐 网络恢复在线');
            emitEvent('network:online');
            this.processPendingRequests();
        });
        
        window.addEventListener('offline', () => {
            this.isOffline = true;
            console.warn('📶 网络离线');
            emitEvent('network:offline');
        });
        
        // 初始状态
        this.isOffline = !navigator.onLine;
    }
    
    /**
     * 用户登录/注册
     * @param {string} username - 用户名（2-12字符）
     * @param {string} avatar - 头像emoji
     * @returns {Promise<Object>} 用户信息
     */
    async login(username, avatar = '🍑') {
        // 前端验证
        if (!username || username.length < 2 || username.length > 12) {
            throw new Error('用户名长度应为2-12个字符');
        }
        
        try {
            const response = await this.request('/user/login', {
                method: 'POST',
                body: { username, avatar }
            });
            
            // 保存会话信息
            this.token = response.token;
            this.userId = response.userId;
            
            const sessionData = {
                token: response.token,
                userId: response.userId,
                username: response.username,
                avatar: response.avatar,
                points: response.points,
                lastLogin: new Date().toISOString()
            };
            
            storage.set('taoci_session', sessionData);
            
            // 触发登录成功事件
            emitEvent('auth:login', sessionData);
            
            console.log('✅ 用户登录成功:', username);
            return response;
            
        } catch (error) {
            console.error('❌ 登录失败:', error);
            throw error;
        }
    }
    
    /**
     * 获取用户信息
     * @returns {Promise<Object>} 用户信息
     */
    async getUserInfo() {
        try {
            const response = await this.request('/user/info');
            
            // 更新本地存储的用户信息
            const session = storage.get('taoci_session') || {};
            Object.assign(session, response);
            storage.set('taoci_session', session);
            
            return response;
            
        } catch (error) {
            console.warn('获取用户信息失败，使用本地数据');
            
            // 从本地存储返回用户信息
            const session = storage.get('taoci_session');
            if (session) {
                return {
                    userId: session.userId,
                    username: session.username,
                    avatar: session.avatar,
                    points: session.points || 1000
                };
            }
            
            throw error;
        }
    }
    
    /**
     * 增加积分
     * @param {number} points - 要增加的积分
     * @param {string} reason - 增加原因
     * @param {string} game - 游戏类型（可选）
     * @returns {Promise<Object>} 积分更新结果
     */
    async addPoints(points, reason, game = '') {
        // 本地先更新，保证响应速度
        const session = storage.get('taoci_session');
        if (session) {
            session.points = (session.points || 1000) + points;
            storage.set('taoci_session', session);
            
            // 触发积分更新事件
            emitEvent('points:updated', {
                points: points,
                totalPoints: session.points,
                reason: reason
            });
        }
        
        try {
            const response = await this.request('/points/add', {
                method: 'POST',
                body: { points, reason, game }
            });
            
            return response;
            
        } catch (error) {
            console.warn('积分同步失败，使用本地数据');
            return {
                success: true,
                data: {
                    newPoints: session?.points || 1000,
                    dailyRemaining: 5000
                }
            };
        }
    }
    
    /**
     * 提交游戏分数
     * @param {string} game - 游戏类型（bubble/rune/energy）
     * @param {number} score - 游戏分数
     * @param {number} timeSpent - 游戏时长（秒）
     * @param {number} difficulty - 难度等级
     * @returns {Promise<Object>} 提交结果
     */
    async submitGameScore(game, score, timeSpent = 0, difficulty = 1) {
        // 计算获得的积分（本地规则，与后端一致）
        const pointsEarned = this.calculatePoints(game, score, difficulty);
        
        // 本地先更新积分
        await this.addPoints(pointsEarned, `${game}游戏得分`, game);
        
        try {
            const response = await this.request('/game/submit', {
                method: 'POST',
                body: { game, score, timeSpent, difficulty }
            });
            
            // 保存游戏记录到本地
            this.saveGameRecord(game, score, pointsEarned, difficulty);
            
            emitEvent('game:scoreSubmitted', {
                game,
                score,
                pointsEarned,
                difficulty
            });
            
            return response;
            
        } catch (error) {
            console.warn('分数提交失败，已保存到本地');
            
            // 离线模式下保存到待同步队列
            this.queueOfflineRequest({
                type: 'game_submit',
                data: { game, score, timeSpent, difficulty },
                timestamp: Date.now()
            });
            
            return {
                success: true,
                data: {
                    pointsEarned,
                    totalPoints: storage.get('taoci_session')?.points || 1000,
                    rank: 999,
                    bestScore: score
                }
            };
        }
    }
    
    /**
     * 计算游戏积分（本地规则）
     */
    calculatePoints(game, score, difficulty) {
        const config = configManager.get('GAMES') || {};
        const gameConfig = config[game.toUpperCase() + '_GAME'] || {};
        
        // 基础规则
        let points = Math.floor(score / 10);
        
        // 难度加成
        if (difficulty > 1) {
            points = Math.floor(points * (1 + (difficulty - 1) * 0.1));
        }
        
        // 每日上限检查
        const dailyLimit = configManager.get('POINTS.DAILY_LIMIT', 5000);
        const todayPoints = this.getTodayPoints();
        
        if (todayPoints + points > dailyLimit) {
            points = Math.max(0, dailyLimit - todayPoints);
        }
        
        return points;
    }
    
    /**
     * 获取排行榜
     * @param {string} type - 排行榜类型（daily/total）
     * @param {number} limit - 显示数量
     * @param {string} game - 游戏类型（可选）
     * @returns {Promise<Object>} 排行榜数据
     */
    async getRanking(type = 'total', limit = 10, game = null) {
        try {
            // 构建查询参数
            let url = `/ranking?type=${type}&limit=${limit}`;
            if (game) {
                url += `&game=${game}`;
            }
            
            const response = await this.request(url);
            return response;
            
        } catch (error) {
            console.warn('获取排行榜失败，返回模拟数据');
            
            // 返回模拟数据
            return {
                success: true,
                data: {
                    ranking: this.generateMockRanking(limit),
                    userRank: {
                        rank: Math.floor(Math.random() * 100) + 1,
                        points: storage.get('taoci_session')?.points || 1000
                    },
                    updatedAt: new Date().toISOString()
                }
            };
        }
    }
    
    /**
     * 获取留言列表
     * @param {number} page - 页码
     * @param {number} limit - 每页数量
     * @returns {Promise<Object>} 留言列表
     */
    async getMessages(page = 1, limit = 20) {
        try {
            const response = await this.request(`/messages?page=${page}&limit=${limit}`);
            return response;
            
        } catch (error) {
            console.warn('获取留言失败，返回本地缓存');
            
            // 从本地缓存获取或返回模拟数据
            const cachedMessages = storage.get('taoci_messages') || [];
            const mockMessages = this.generateMockMessages(limit);
            
            return {
                success: true,
                data: {
                    messages: cachedMessages.length > 0 ? cachedMessages : mockMessages,
                    total: Math.max(cachedMessages.length, mockMessages.length)
                }
            };
        }
    }
    
    /**
     * 发送留言
     * @param {string} content - 留言内容
     * @returns {Promise<Object>} 发送结果
     */
    async sendMessage(content) {
        // 前端验证
        if (!content || content.trim().length === 0) {
            throw new Error('留言内容不能为空');
        }
        
        if (content.length > 140) {
            throw new Error('留言内容不能超过140个字符');
        }
        
        // 本地先显示，提升响应速度
        const session = storage.get('taoci_session');
        const tempMessage = {
            id: 'temp_' + Date.now(),
            userId: session?.userId || 'guest',
            username: session?.username || '游客',
            avatar: session?.avatar || '👤',
            content: content,
            time: new Date().toISOString(),
            likes: 0,
            isLocal: true
        };
        
        // 触发新留言事件
        emitEvent('message:new', tempMessage);
        
        try {
            const response = await this.request('/messages', {
                method: 'POST',
                body: { content }
            });
            
            // 移除本地标记
            emitEvent('message:confirmed', {
                tempId: tempMessage.id,
                messageId: response.messageId
            });
            
            return response;
            
        } catch (error) {
            console.warn('留言发送失败，保存到本地');
            
            // 保存到本地缓存
            const messages = storage.get('taoci_messages') || [];
            messages.unshift(tempMessage);
            storage.set('taoci_messages', messages.slice(0, 100)); // 最多保存100条
            
            // 添加到待同步队列
            this.queueOfflineRequest({
                type: 'send_message',
                data: { content },
                timestamp: Date.now()
            });
            
            return {
                success: true,
                data: {
                    messageId: tempMessage.id,
                    content: content,
                    time: tempMessage.time
                }
            };
        }
    }
    
    /**
     * 抽奖
     * @returns {Promise<Object>} 抽奖结果
     */
    async spinLottery() {
        try {
            const response = await this.request('/lottery/spin', {
                method: 'POST'
            });
            
            // 更新本地积分
            if (response.data?.newPoints) {
                const session = storage.get('taoci_session');
                if (session) {
                    session.points = response.data.newPoints;
                    storage.set('taoci_session', session);
                    
                    emitEvent('points:updated', {
                        points: -response.data.pointsCost || -500,
                        totalPoints: session.points,
                        reason: '抽奖消耗'
                    });
                }
            }
            
            emitEvent('lottery:spun', response.data);
            return response;
            
        } catch (error) {
            console.warn('抽奖失败，使用本地模拟');
            
            // 本地模拟抽奖
            return this.mockLotterySpin();
        }
    }
    
    /**
     * 通用请求方法
     * @param {string} endpoint - API端点
     * @param {Object} options - 请求选项
     * @returns {Promise<Object>} 响应数据
     */
    async request(endpoint, options = {}) {
        // 检查离线模式
        if (this.isOffline && configManager.get('API.OFFLINE_MODE', true)) {
            return this.handleOfflineRequest(endpoint, options);
        }
        
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        // 添加认证token
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        // 添加设备信息
        headers['X-Device-Info'] = JSON.stringify({
            platform: device.platform,
            screen: device.screen,
            userAgent: navigator.userAgent
        });
        
        const config = {
            method: options.method || 'GET',
            headers,
            timeout: configManager.get('API.REQUEST.TIMEOUT', 10000),
            ...options
        };
        
        // 添加请求体
        if (options.body) {
            config.body = JSON.stringify(options.body);
        }
        
        // 创建请求ID用于追踪
        const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        try {
            // 添加超时控制
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('请求超时')), config.timeout);
            });
            
            // 发送请求
            const fetchPromise = fetch(url, config);
            const response = await Promise.race([fetchPromise, timeoutPromise]);
            
            // 检查响应状态
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // 检查API返回的成功状态
            if (!data.success) {
                throw new Error(data.error || 'API请求失败');
            }
            
            console.log(`✅ API请求成功: ${endpoint}`);
            return data.data;
            
        } catch (error) {
            console.error(`❌ API请求失败: ${endpoint}`, error);
            
            // 检查是否需要重试
            if (options.retryCount < (options.maxRetries || 3)) {
                console.log(`🔄 重试请求: ${endpoint} (${(options.retryCount || 0) + 1}/3)`);
                
                return this.request(endpoint, {
                    ...options,
                    retryCount: (options.retryCount || 0) + 1,
                    delay: (options.delay || 1000) * 2
                });
            }
            
            // 触发请求失败事件
            emitEvent('api:requestFailed', {
                endpoint,
                error: error.message,
                requestId
            });
            
            throw error;
        }
    }
    
    /**
     * 处理离线请求
     */
    async handleOfflineRequest(endpoint, options) {
        console.log(`📴 离线模式处理请求: ${endpoint}`);
        
        // 根据端点返回不同的模拟数据
        const mockHandlers = {
            '/user/info': () => this.getUserInfo(),
            '/ranking': () => ({
                ranking: this.generateMockRanking(10),
                userRank: { rank: 999, points: 1000 }
            }),
            '/messages': () => ({
                messages: this.generateMockMessages(20),
                total: 50
            })
        };
        
        if (mockHandlers[endpoint]) {
            return mockHandlers[endpoint]();
        }
        
        // 对于其他请求，添加到待处理队列
        return this.queueOfflineRequest({
            endpoint,
            options,
            timestamp: Date.now()
        });
    }
    
    /**
     * 添加请求到离线队列
     */
    async queueOfflineRequest(requestData) {
        const queue = storage.get('taoci_offline_queue') || [];
        queue.push(requestData);
        storage.set('taoci_offline_queue', queue.slice(-50)); // 最多保存50个
        
        emitEvent('api:requestQueued', requestData);
        
        return {
            success: true,
            queued: true,
            message: '请求已保存，网络恢复后自动同步'
        };
    }
    
    /**
     * 处理待同步请求
     */
    async processPendingRequests() {
        if (this.isProcessingQueue) return;
        
        this.isProcessingQueue = true;
        const queue = storage.get('taoci_offline_queue') || [];
        
        if (queue.length === 0) {
            this.isProcessingQueue = false;
            return;
        }
        
        console.log(`🔄 开始同步 ${queue.length} 个待处理请求`);
        
        for (let i = 0; i < queue.length; i++) {
            const request = queue[i];
            
            try {
                // 重新发送请求
                await this.request(request.endpoint, request.options);
                
                // 从队列中移除成功的请求
                queue.splice(i, 1);
                i--;
                
            } catch (error) {
                console.warn(`同步请求失败: ${request.endpoint}`, error);
                // 继续处理下一个请求
            }
        }
        
        storage.set('taoci_offline_queue', queue);
        this.isProcessingQueue = false;
        
        console.log(`✅ 请求同步完成，剩余 ${queue.length} 个待处理`);
    }
    
    /**
     * 生成模拟排行榜数据
     */
    generateMockRanking(limit) {
        const mockUsers = [
            { username: '桃汽水头号粉丝', avatar: '🍑', points: 8425 },
            { username: '气泡捕捉大师', avatar: '✨', points: 7892 },
            { username: '魔法阵研究员', avatar: '🌟', points: 6534 },
            { username: '次元旅行者', avatar: '🚀', points: 5921 },
            { username: '精灵契约者', avatar: '🌸', points: 4876 },
            { username: '魔力收集者', avatar: '⚡', points: 4231 },
            { username: '公主护卫队', avatar: '🛡️', points: 3854 },
            { username: '异世界访客', avatar: '🌌', points: 3210 },
            { username: '甜点爱好者', avatar: '🍰', points: 2987 },
            { username: '星光守护者', avatar: '⭐', points: 2563 }
        ];
        
        return mockUsers.slice(0, limit).map((user, index) => ({
            rank: index + 1,
            userId: `user_${1000 + index}`,
            username: user.username,
            avatar: user.avatar,
            points: user.points,
            location: ['上海', '北京', '广州', '深圳', '杭州'][index % 5]
        }));
    }
    
    /**
     * 生成模拟留言数据
     */
    generateMockMessages(limit) {
        const mockMessages = [
            { user: '桃汽水头号粉丝', avatar: '🍑', content: '公主殿下周年快乐！期待今晚的直播！', time: '10:30' },
            { user: '气泡捕捉大师', avatar: '✨', content: '已经攒了1000魔力了，我要抽大奖！', time: '11:15' },
            { user: '魔法阵研究员', avatar: '🌟', content: '记忆符文阵的游戏真好玩，已经玩了10遍了！', time: '12:45' },
            { user: '次元旅行者', avatar: '🚀', content: '从异世界赶来支持公主！希望网站能一直保留！', time: '14:20' },
            { user: '精灵契约者', avatar: '🌸', content: '桃汽水公主最可爱了！希望每年都有周年庆！', time: '15:30' }
        ];
        
        const now = new Date();
        return mockMessages.slice(0, limit).map((msg, index) => ({
            id: `msg_${1000 + index}`,
            userId: `user_${2000 + index}`,
            username: msg.user,
            avatar: msg.avatar,
            content: msg.content,
            time: new Date(now.getTime() - (index * 30 * 60 * 1000)).toISOString(),
            likes: Math.floor(Math.random() * 20)
        }));
    }
    
    /**
     * 模拟抽奖
     */
    mockLotterySpin() {
        const prizes = [
            { id: 'energy_boost', name: '能量补充', type: 'COMMON', color: '#FFE066', points: 500 },
            { id: 'magic_potion', name: '魔力药水', type: 'COMMON', color: '#98D8C8', description: '双倍积分1小时' },
            { id: 'lucky_coin', name: '幸运金币', type: 'COMMON', color: '#FFB7C5', description: '下次抽奖免费' },
            { id: 'thank_you', name: '精灵的感谢', type: 'CONSOLATION', color: '#CCCCCC' }
        ];
        
        // 简单的随机算法
        const random = Math.random();
        let prize;
        
        if (random < 0.7) {
            prize = prizes[0]; // 70%概率获得能量补充
        } else if (random < 0.9) {
            prize = prizes[1]; // 20%概率获得魔力药水
        } else if (random < 0.95) {
            prize = prizes[2]; // 5%概率获得幸运金币
        } else {
            prize = prizes[3]; // 5%概率获得感谢参与
        }
        
        // 更新本地积分
        const session = storage.get('taoci_session');
        const newPoints = (session?.points || 1000) - 500;
        
        if (session) {
            session.points = newPoints;
            storage.set('taoci_session', session);
        }
        
        return {
            success: true,
            data: {
                prize: prize,
                pointsCost: 500,
                newPoints: newPoints,
                remainingFreeSpins: 0
            }
        };
    }
    
    /**
     * 保存游戏记录到本地
     */
    saveGameRecord(game, score, pointsEarned, difficulty) {
        const records = storage.get('taoci_game_records') || [];
        
        records.unshift({
            id: `game_${Date.now()}`,
            game: game,
            score: score,
            pointsEarned: pointsEarned,
            difficulty: difficulty,
            timestamp: new Date().toISOString()
        });
        
        // 最多保存50条记录
        storage.set('taoci_game_records', records.slice(0, 50));
    }
    
    /**
     * 获取今日获得的积分
     */
    getTodayPoints() {
        const today = new Date().toDateString();
        const records = storage.get('taoci_game_records') || [];
        
        return records
            .filter(record => new Date(record.timestamp).toDateString() === today)
            .reduce((sum, record) => sum + (record.pointsEarned || 0), 0);
    }
    
    /**
     * 登出用户
     */
    logout() {
        this.token = '';
        this.userId = '';
        storage.remove('taoci_session');
        
        emitEvent('auth:logout');
        console.log('👋 用户已登出');
    }
    
    /**
     * 检查用户是否已登录
     */
    isLoggedIn() {
        return !!this.token && !!this.userId;
    }
    
    /**
     * 获取当前用户ID
     */
    getCurrentUserId() {
        return this.userId;
    }
    
    /**
     * 获取当前token
     */
    getToken() {
        return this.token;
    }
}

// 创建单例实例
const apiClient = new TaociApiClient();

// 导出实例
export default apiClient;

// 全局访问（可选）
window.TaociApi = apiClient;