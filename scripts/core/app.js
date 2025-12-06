/**
 * 桃汽水魔力补给站 - 应用主控制器
 * 负责应用初始化、模块管理和生命周期控制
 */

// 全局应用实例
class TaociApp {
    constructor() {
        this.name = '桃汽水的魔力补给站';
        this.version = '1.0.0';
        this.config = null;
        this.modules = new Map();
        this.isReady = false;
        this.currentPage = 'home';
        
        // 应用状态
        this.state = {
            user: null,
            points: 1000,
            isLoggedIn: false,
            isLoading: false,
            errors: []
        };
        
        // 绑定方法
        this.init = this.init.bind(this);
        this.render = this.render.bind(this);
        this.navigate = this.navigate.bind(this);
        this.showError = this.showError.bind(this);
        this.hideLoading = this.hideLoading.bind(this);
        
        // 创建全局事件系统
        this.events = this.createEventSystem();
        
        console.log(`🍑 ${this.name} v${this.version} 初始化...`);
    }
    
    /**
     * 初始化应用
     */
    async init() {
        try {
            console.log('1️⃣ 正在加载应用配置...');
            
            // 1. 加载配置
            await this.loadConfig();
            
            // 2. 初始化UI
            await this.initUI();
            
            // 3. 初始化用户系统
            await this.initUserSystem();
            
            // 4. 初始化事件监听
            this.initEventListeners();
            
            // 5. 渲染首页
            await this.renderHomePage();
            
            // 6. 启动倒计时
            this.startCountdown();
            
            // 7. 标记应用就绪
            this.isReady = true;
            this.events.emit('app:ready', { app: this });
            
            console.log('✅ 应用初始化完成！');
            
            // 延迟隐藏加载界面，确保所有内容已渲染
            setTimeout(() => {
                this.hideLoading();
            }, 500);
            
        } catch (error) {
            console.error('❌ 应用初始化失败:', error);
            this.showError('应用启动失败，请刷新页面重试', error);
        }
    }
    
    /**
     * 加载配置
     */
    async loadConfig() {
        // 这里可以加载远程配置，暂时使用内置配置
        this.config = {
            // 基础配置
            site: {
                name: '桃汽水的魔力补给站',
                title: '异世界精灵公主的周年庆典',
                version: '1.0.0'
            },
            
            // 时间配置
            time: {
                eventStart: '2024-12-25T19:00:00',
                eventEnd: '2024-12-31T23:59:59',
                countdownTarget: '2024-12-25T19:00:00'
            },
            
            // 功能开关
            features: {
                games: true,
                lottery: true,
                ranking: true,
                messages: true,
                countdown: true
            },
            
            // 积分系统
            points: {
                initial: 1000,
                lotteryCost: 500,
                dailyFreeSpins: 1
            },
            
            // API配置
            api: {
                baseUrl: 'https://api.example.com',
                offlineMode: true
            }
        };
        
        console.log('✅ 配置加载完成');
    }
    
    /**
     * 初始化UI框架
     */
    async initUI() {
        const container = document.getElementById('app-container');
        if (!container) {
            throw new Error('找不到应用容器');
        }
        
        // 设置基础HTML结构
        container.className = 'app-content';
        container.innerHTML = `
            <div class="decor decor-1" style="top: -20px; right: -30px;"></div>
            <div class="decor decor-2" style="bottom: 40px; left: -20px;"></div>
            <div class="decor decor-3" style="top: 100px; left: -10px;"></div>
            
            <div id="app-header"></div>
            <main id="app-main" class="container"></main>
            <footer id="app-footer" class="app-footer"></footer>
        `;
        
        console.log('✅ UI框架初始化完成');
    }
    
    /**
     * 初始化用户系统
     */
    async initUserSystem() {
        // 尝试从本地存储加载用户
        const savedUser = localStorage.getItem('taoci_user');
        if (savedUser) {
            try {
                this.state.user = JSON.parse(savedUser);
                this.state.isLoggedIn = true;
                console.log('✅ 用户数据已加载');
            } catch (error) {
                console.warn('用户数据加载失败:', error);
                this.createGuestUser();
            }
        } else {
            this.createGuestUser();
        }
        
        // 积分初始化
        this.state.points = this.state.user?.points || this.config.points.initial;
    }
    
    /**
     * 创建游客用户
     */
    createGuestUser() {
        const prefixes = ['桃色', '汽水', '精灵', '魔法', '梦幻', '星光'];
        const suffixes = ['契约者', '使者', '学徒', '骑士', '守护者', '旅人'];
        const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        
        this.state.user = {
            id: 'guest_' + Date.now(),
            username: randomPrefix + randomSuffix,
            avatar: '🍑',
            points: this.config.points.initial,
            isGuest: true,
            createdAt: new Date().toISOString()
        };
        
        // 保存到本地存储
        localStorage.setItem('taoci_user', JSON.stringify(this.state.user));
        
        console.log('✅ 游客用户创建成功:', this.state.user.username);
    }
    
    /**
     * 初始化事件监听
     */
    initEventListeners() {
        // 窗口大小变化
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // 页面可见性变化
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        
        // 全局点击事件（用于导航）
        document.addEventListener('click', this.handleGlobalClick.bind(this));
        
        console.log('✅ 事件监听器初始化完成');
    }
    
    /**
     * 渲染首页
     */
    async renderHomePage() {
        this.currentPage = 'home';
        
        // 渲染头部
        this.renderHeader();
        
        // 渲染主内容
        const main = document.getElementById('app-main');
        if (main) {
            main.innerHTML = await this.getHomePageHTML();
        }
        
        // 渲染页脚
        this.renderFooter();
        
        console.log('✅ 首页渲染完成');
    }
    
    /**
     * 渲染头部
     */
    renderHeader() {
        const header = document.getElementById('app-header');
        if (!header) return;
        
        const user = this.state.user;
        
        header.innerHTML = `
            <header class="app-header">
                <div class="container header-content">
                    <a href="#" class="logo" data-page="home">
                        <div class="logo-icon">🍑</div>
                        <div class="logo-text">${this.config.site.name}</div>
                    </a>
                    
                    <div class="user-info">
                        <div class="user-avatar">
                            ${user.avatar}
                        </div>
                        <div class="user-details">
                            <div class="username">${user.username}</div>
                            <div class="user-points">
                                <span>✨</span>
                                <span id="user-points">${this.state.points}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        `;
    }
    
    /**
     * 获取首页HTML
     */
    async getHomePageHTML() {
        return `
            <section class="hero-section">
                <div class="character-container">
                    <div class="character">
                        <img src="./assets/images/character/taoci-avatar.png" alt="桃汽水" class="character-image" 
                             onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2245%22 fill=%22%23FF8EAF%22/><text x=%2250%22 y=%2260%22 text-anchor=%22middle%22 font-size=%2220%22 fill=%22white%22>🍑</text></svg>'">
                    </div>
                </div>
                
                <div class="greeting-card">
                    <h2 class="greeting-title">欢迎来到我的魔力补给站！</h2>
                    <p class="greeting-text">
                        我是来自异世界的精灵公主桃汽水~ 周年庆活动马上就要开始啦，
                        快来一起收集魔力，参加有趣的游戏吧！
                    </p>
                </div>
                
                ${this.config.features.countdown ? this.getCountdownHTML() : ''}
                
                <div class="action-grid">
                    ${this.config.features.games ? `
                        <a href="#" class="action-card action-games" data-page="games">
                            <div class="action-icon icon-games">🎮</div>
                            <h3 class="action-title">魔力小游戏</h3>
                            <p class="action-description">玩游戏收集魔力值，小心有惊喜哦~</p>
                        </a>
                    ` : ''}
                    
                    ${this.config.features.lottery ? `
                        <a href="#" class="action-card action-lottery" data-page="lottery">
                            <div class="action-icon icon-lottery">🎁</div>
                            <h3 class="action-title">祈愿转盘</h3>
                            <p class="action-description">消耗魔力值抽奖，赢取限定奖励！</p>
                        </a>
                    ` : ''}
                    
                    ${this.config.features.ranking ? `
                        <a href="#" class="action-card action-rank" data-page="ranking">
                            <div class="action-icon icon-rank">🏆</div>
                            <h3 class="action-title">魔力排行榜</h3>
                            <p class="action-description">看看谁是收集魔力最多的契约者</p>
                        </a>
                    ` : ''}
                    
                    ${this.config.features.messages ? `
                        <a href="#" class="action-card action-message" data-page="messages">
                            <div class="action-icon icon-message">💬</div>
                            <h3 class="action-title">给我留言</h3>
                            <p class="action-description">写下想对我说的话，我会看到哦~</p>
                        </a>
                    ` : ''}
                </div>
                
                <div class="announcement-card">
                    <div class="announcement-header">
                        <h3><i class="fas fa-bullhorn"></i> 公主公告</h3>
                        <span class="live-badge">直播预告</span>
                    </div>
                    <div class="announcement-content">
                        <p>契约者们~周年庆将在 <strong>${this.formatDate(this.config.time.eventStart)}</strong> 开始！</p>
                        <p>记得准时来直播间哦！收集魔力最多的前十名有特别奖励！</p>
                    </div>
                </div>
            </section>
        `;
    }
    
    /**
     * 获取倒计时HTML
     */
    getCountdownHTML() {
        return `
            <div class="countdown-section">
                <div class="countdown-title">
                    <i class="fas fa-clock"></i> 周年庆倒计时
                </div>
                <div class="countdown-display" id="countdown-display">
                    <div class="countdown-item">
                        <div class="countdown-number">15</div>
                        <div class="countdown-label">天</div>
                    </div>
                    <div class="countdown-item">
                        <div class="countdown-number">08</div>
                        <div class="countdown-label">时</div>
                    </div>
                    <div class="countdown-item">
                        <div class="countdown-number">45</div>
                        <div class="countdown-label">分</div>
                    </div>
                    <div class="countdown-item">
                        <div class="countdown-number">33</div>
                        <div class="countdown-label">秒</div>
                    </div>
                </div>
                <div class="countdown-message" id="countdown-message"></div>
            </div>
        `;
    }
    
    /**
     * 渲染页脚
     */
    renderFooter() {
        const footer = document.getElementById('app-footer');
        if (!footer) return;
        
        footer.innerHTML = `
            <div class="container">
                <p>${this.config.site.name} © 2024 | 异世界精灵公主周年庆专属站点</p>
                <p style="margin-top: 8px; font-size: 12px; opacity: 0.7;">
                    版本 ${this.config.site.version} | 仅用于粉丝娱乐，非商业用途
                </p>
            </div>
        `;
    }
    
    /**
     * 启动倒计时
     */
    startCountdown() {
        const targetDate = new Date(this.config.time.countdownTarget);
        const now = new Date();
        const diff = targetDate.getTime() - now.getTime();
        
        if (diff <= 0) {
            this.updateCountdownDisplay(0, 0, 0, 0, '🎉 周年庆已经开始啦！');
            return;
        }
        
        // 立即更新一次
        this.updateCountdown();
        
        // 每秒更新一次
        this.countdownInterval = setInterval(() => {
            this.updateCountdown();
        }, 1000);
    }
    
    /**
     * 更新倒计时
     */
    updateCountdown() {
        const targetDate = new Date(this.config.time.countdownTarget);
        const now = new Date();
        const diff = targetDate.getTime() - now.getTime();
        
        if (diff <= 0) {
            clearInterval(this.countdownInterval);
            this.updateCountdownDisplay(0, 0, 0, 0, '🎉 周年庆已经开始啦！');
            return;
        }
        
        // 计算天数、小时、分钟、秒
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        // 更新显示
        this.updateCountdownDisplay(days, hours, minutes, seconds);
        
        // 更新消息
        this.updateCountdownMessage(days, hours, minutes, seconds);
    }
    
    /**
     * 更新倒计时显示
     */
    updateCountdownDisplay(days, hours, minutes, seconds, customMessage = null) {
        const display = document.getElementById('countdown-display');
        const message = document.getElementById('countdown-message');
        
        if (display) {
            const items = display.querySelectorAll('.countdown-item');
            if (items.length >= 4) {
                items[0].querySelector('.countdown-number').textContent = days.toString().padStart(2, '0');
                items[1].querySelector('.countdown-number').textContent = hours.toString().padStart(2, '0');
                items[2].querySelector('.countdown-number').textContent = minutes.toString().padStart(2, '0');
                items[3].querySelector('.countdown-number').textContent = seconds.toString().padStart(2, '0');
            }
        }
        
        if (message && customMessage) {
            message.textContent = customMessage;
        }
    }
    
    /**
     * 更新倒计时消息
     */
    updateCountdownMessage(days, hours, minutes, seconds) {
        const message = document.getElementById('countdown-message');
        if (!message) return;
        
        if (days > 0) {
            message.textContent = `距离桃汽水公主周年庆还有 ${days} 天`;
        } else if (hours > 0) {
            message.textContent = `距离周年庆还有 ${hours} 小时`;
        } else if (minutes > 0) {
            message.textContent = `最后 ${minutes} 分钟！`;
        } else {
            message.textContent = `最后 ${seconds} 秒！`;
        }
    }
    
    /**
     * 格式化日期
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    
    /**
     * 页面导航
     */
    async navigate(page) {
        if (this.state.isLoading) return;
        
        this.currentPage = page;
        this.state.isLoading = true;
        
        try {
            // 这里可以根据page加载不同的页面
            // 目前只实现首页
            if (page === 'home') {
                await this.renderHomePage();
            } else {
                // 其他页面暂时显示开发中
                await this.showComingSoon(page);
            }
        } catch (error) {
            console.error('页面导航失败:', error);
            this.showError('页面加载失败', error);
        } finally {
            this.state.isLoading = false;
        }
    }
    
    /**
     * 显示开发中页面
     */
    async showComingSoon(pageName) {
        const main = document.getElementById('app-main');
        if (!main) return;
        
        const pageTitles = {
            games: '魔力小游戏',
            lottery: '祈愿转盘',
            ranking: '魔力排行榜',
            messages: '给我留言'
        };
        
        const title = pageTitles[pageName] || '功能页面';
        
        main.innerHTML = `
            <section class="hero-section" style="min-height: 60vh;">
                <div class="greeting-card">
                    <h2 class="greeting-title">${title} 开发中</h2>
                    <p class="greeting-text">
                        精灵公主正在努力准备这个功能呢~
                        <br>
                        很快就能和大家见面啦！
                    </p>
                </div>
                
                <div style="margin-top: 40px;">
                    <button class="btn btn-primary" onclick="TaociApp.navigate('home')">
                        <i class="fas fa-home"></i> 返回首页
                    </button>
                </div>
                
                <div style="margin-top: 60px; opacity: 0.7;">
                    <div style="font-size: 80px; margin-bottom: 20px;">✨</div>
                    <p>敬请期待...</p>
                </div>
            </section>
        `;
    }
    
    /**
     * 渲染应用
     */
    render() {
        // 渲染逻辑已在各方法中实现
    }
    
    /**
     * 隐藏加载界面
     */
    hideLoading() {
        const loadingScreen = document.getElementById('app-loading');
        const appContent = document.querySelector('.app-content');
        
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                if (appContent) {
                    appContent.classList.add('loaded');
                }
            }, 500);
        }
    }
    
    /**
     * 显示错误
     */
    showError(message, error = null) {
        console.error(message, error);
        
        const container = document.getElementById('app-container');
        if (container) {
            container.innerHTML = `
                <div class="error-display">
                    <div class="error-icon">⚠️</div>
                    <div class="error-title">魔力补给站遇到了问题</div>
                    <div class="error-message">${message}</div>
                    <button class="retry-button" onclick="location.reload()">
                        <i class="fas fa-redo"></i> 重新加载
                    </button>
                </div>
            `;
        }
    }
    
    /**
     * 创建事件系统
     */
    createEventSystem() {
        const events = new Map();
        
        return {
            on(event, callback) {
                if (!events.has(event)) {
                    events.set(event, []);
                }
                events.get(event).push(callback);
            },
            
            off(event, callback) {
                if (events.has(event)) {
                    const callbacks = events.get(event);
                    const index = callbacks.indexOf(callback);
                    if (index > -1) {
                        callbacks.splice(index, 1);
                    }
                }
            },
            
            emit(event, data) {
                if (events.has(event)) {
                    events.get(event).forEach(callback => {
                        try {
                            callback(data);
                        } catch (error) {
                            console.error(`事件 ${event} 执行错误:`, error);
                        }
                    });
                }
            },
            
            once(event, callback) {
                const onceCallback = (data) => {
                    callback(data);
                    this.off(event, onceCallback);
                };
                this.on(event, onceCallback);
            }
        };
    }
    
    /**
     * 处理窗口大小变化
     */
    handleResize() {
        // 可以在这里添加响应式处理逻辑
        console.log('窗口大小变化:', window.innerWidth);
    }
    
    /**
     * 处理页面可见性变化
     */
    handleVisibilityChange() {
        if (document.hidden) {
            console.log('页面隐藏');
        } else {
            console.log('页面显示');
            // 页面重新显示时，更新倒计时
            if (this.countdownInterval) {
                this.updateCountdown();
            }
        }
    }
    
    /**
     * 处理全局点击事件
     */
    handleGlobalClick(event) {
        // 处理导航点击
        const target = event.target.closest('[data-page]');
        if (target && target.hasAttribute('data-page')) {
            event.preventDefault();
            const page = target.getAttribute('data-page');
            this.navigate(page);
        }
    }
    
    /**
     * 添加积分
     */
    addPoints(points) {
        if (!this.state.user) return;
        
        this.state.points += points;
        this.state.user.points = this.state.points;
        
        // 更新显示
        const pointsDisplay = document.getElementById('user-points');
        if (pointsDisplay) {
            pointsDisplay.textContent = this.state.points;
            pointsDisplay.classList.add('updated');
            setTimeout(() => {
                pointsDisplay.classList.remove('updated');
            }, 500);
        }
        
        // 保存到本地存储
        localStorage.setItem('taoci_user', JSON.stringify(this.state.user));
        
        // 触发事件
        this.events.emit('points:updated', {
            points: this.state.points,
            delta: points
        });
        
        console.log(`积分更新: +${points} = ${this.state.points}`);
    }
    
    /**
     * 更新用户信息
     */
    updateUserInfo(info) {
        if (!this.state.user) return;
        
        Object.assign(this.state.user, info);
        localStorage.setItem('taoci_user', JSON.stringify(this.state.user));
        
        // 重新渲染头部
        this.renderHeader();
        
        console.log('用户信息更新:', info);
    }
}

// 导出应用实例
export default TaociApp;