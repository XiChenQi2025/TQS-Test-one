/**
 * 桃汽水魔力补给站 - 主应用
 */
class TaociMagicApp {
    constructor() {
        this.modules = {};
        this.init();
    }
    
    async init() {
        console.log('🍑 桃汽水的魔力补给站启动中...');
        
        try {
            // 1. 初始化用户系统
            this.modules.user = new UserManager();
            
            // 2. 加载页面结构
            await this.loadLayout();
            
            // 3. 初始化倒计时
            if (CONFIG.FEATURES.COUNTDOWN) {
                await this.loadModule('countdown.js');
            }
            
            // 4. 初始化导航
            await this.loadModule('navigation.js');
            
            // 5. 加载首页
            await this.loadPage('home');
            
            // 6. 绑定全局事件
            this.bindEvents();
            
            console.log('🎉 应用启动完成！');
            console.log('👤 当前用户:', this.modules.user.getUsername());
            console.log('⭐ 当前积分:', this.modules.user.getPoints());
            
            // 触发应用就绪事件
            this.triggerEvent('appReady');
            
        } catch (error) {
            console.error('❌ 应用初始化失败:', error);
            this.showError('应用初始化失败，请刷新页面重试');
        }
    }
    
    async loadLayout() {
        // 加载导航栏
        const navbar = document.getElementById('navbar');
        if (navbar) {
            navbar.innerHTML = this.renderNavbar();
        }
        
        // 加载页脚
        const footer = document.getElementById('footer');
        if (footer) {
            footer.innerHTML = this.renderFooter();
        }
    }
    
    renderNavbar() {
        const user = this.modules.user ? this.modules.user.getUserInfo() : null;
        
        return `
            <div class="container">
                <div class="navbar-content">
                    <a href="#home" class="logo rainbow-text" data-page="home">
                        <i class="fas fa-crown"></i>
                        <span>${CONFIG.SITE.NAME}</span>
                    </a>
                    
                    <div class="nav-links">
                        <a href="#home" class="nav-link active" data-page="home">
                            <i class="fas fa-home"></i>
                            <span>魔力大厅</span>
                        </a>
                        
                        <a href="#games" class="nav-link" data-page="games">
                            <i class="fas fa-gamepad"></i>
                            <span>收集魔力</span>
                        </a>
                        
                        <a href="#lottery" class="nav-link" data-page="lottery">
                            <i class="fas fa-gift"></i>
                            <span>祈愿转盘</span>
                        </a>
                        
                        <a href="#ranking" class="nav-link" data-page="ranking">
                            <i class="fas fa-trophy"></i>
                            <span>魔力榜单</span>
                        </a>
                        
                        <a href="#messages" class="nav-link" data-page="messages">
                            <i class="fas fa-comments"></i>
                            <span>契约者留言</span>
                        </a>
                    </div>
                    
                    <div class="user-info">
                        <div class="user-avatar" style="background: ${CONFIG.COLORS.GRADIENTS.RAINBOW}">
                            ${user ? user.username.charAt(0) : '?'}
                        </div>
                        <div class="user-details">
                            <div class="username">${user ? user.username : '加载中...'}</div>
                            <div class="user-points">
                                <i class="fas fa-gem" style="color: ${CONFIG.COLORS.PINK.BRIGHT}"></i>
                                <span>${user ? user.points.toLocaleString() : '0'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderFooter() {
        const currentYear = new Date().getFullYear();
        
        return `
            <div class="container">
                <div class="footer-content">
                    <div class="footer-logo rainbow-text">
                        <i class="fas fa-crown"></i>
                        ${CONFIG.SITE.NAME}
                    </div>
                    
                    <div class="footer-links">
                        <a href="#home" data-page="home">首页</a>
                        <a href="#games" data-page="games">游戏</a>
                        <a href="#lottery" data-page="lottery">抽奖</a>
                        <a href="#ranking" data-page="ranking">排行榜</a>
                        <a href="#messages" data-page="messages">留言板</a>
                    </div>
                    
                    <div class="footer-info">
                        <p>${CONFIG.SITE.TITLE}</p>
                        <p>© ${currentYear} ${CONFIG.SITE.CHARACTER.NAME} 版权所有</p>
                        <p class="version">版本 ${CONFIG.SITE.VERSION}</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    async loadPage(pageId) {
        console.log(`📄 加载页面: ${pageId}`);
        
        const appElement = document.getElementById('app');
        if (!appElement) return;
        
        // 显示加载状态
        appElement.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner rainbow-bg"></div>
                <p class="loading-text rainbow-text">加载中...</p>
            </div>
        `;
        
        // 添加淡出效果
        appElement.classList.remove('active');
        setTimeout(() => {
            appElement.classList.add('active');
        }, 50);
        
        try {
            let pageContent = '';
            
            switch (pageId) {
                case 'home':
                    pageContent = await this.renderHomePage();
                    break;
                case 'games':
                    pageContent = await this.renderGamesPage();
                    break;
                case 'lottery':
                    pageContent = await this.renderLotteryPage();
                    break;
                case 'ranking':
                    pageContent = await this.renderRankingPage();
                    break;
                case 'messages':
                    pageContent = await this.renderMessagesPage();
                    break;
                default:
                    pageContent = await this.renderHomePage();
            }
            
            appElement.innerHTML = pageContent;
            
            // 初始化页面特定的功能
            await this.initPageFeatures(pageId);
            
            // 更新导航状态
            this.updateNavActive(pageId);
            
            // 触发页面加载事件
            this.triggerEvent('pageLoaded', { pageId: pageId });
            
        } catch (error) {
            console.error(`❌ 加载页面 ${pageId} 失败:`, error);
            appElement.innerHTML = `
                <div class="error-container">
                    <h2 class="rainbow-text">页面加载失败</h2>
                    <p>${error.message}</p>
                    <button class="btn-rainbow" onclick="location.reload()">刷新页面</button>
                </div>
            `;
        }
    }
    
    async renderHomePage() {
        const user = this.modules.user.getUserInfo();
        const eventDate = new Date(CONFIG.TIME.EVENT_START);
        const formattedDate = `${eventDate.getMonth() + 1}月${eventDate.getDate()}日 ${eventDate.getHours()}:${eventDate.getMinutes().toString().padStart(2, '0')}`;
        
        return `
            <div class="home-page">
                <div class="hero-section">
                    <h1 class="hero-title rainbow-text">${CONFIG.SITE.NAME}</h1>
                    <p class="hero-subtitle">${CONFIG.SITE.CHARACTER.DESCRIPTION}</p>
                    
                    <div class="character-display rainbow-border">
                        <div class="character-image">
                            <div class="character-head" style="background: ${CONFIG.COLORS.GRADIENTS.PINK}"></div>
                            <div class="character-crown" style="background: ${CONFIG.COLORS.RAINBOW[2]}"></div>
                            <div class="character-body" style="background: ${CONFIG.COLORS.GRADIENTS.PINK}"></div>
                        </div>
                        <p class="character-quote rainbow-text">"契约者们，快来帮我收集魔力吧！"</p>
                    </div>
                </div>
                
                <!-- 倒计时容器，countdown.js会填充内容 -->
                <div id="countdown-section"></div>
                
                <!-- 用户统计 -->
                <div class="user-stats rainbow-border">
                    <div class="stat-item">
                        <div class="stat-value rainbow-text">${user.points.toLocaleString()}</div>
                        <div class="stat-label">我的魔力值</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value rainbow-text">等级 ${user.level}</div>
                        <div class="stat-label">当前等级</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value rainbow-text">${formattedDate}</div>
                        <div class="stat-label">周年庆时间</div>
                    </div>
                </div>
                
                <!-- 功能入口 -->
                <div class="action-grid">
                    <a href="#games" class="action-card" data-page="games" style="border-top-color: ${CONFIG.COLORS.RAINBOW[0]}">
                        <div class="action-icon" style="color: ${CONFIG.COLORS.RAINBOW[0]}">
                            <i class="fas fa-gamepad"></i>
                        </div>
                        <h3>收集魔力</h3>
                        <p>通过小游戏收集魔力</p>
                    </a>
                    
                    <a href="#lottery" class="action-card" data-page="lottery" style="border-top-color: ${CONFIG.COLORS.RAINBOW[2]}">
                        <div class="action-icon" style="color: ${CONFIG.COLORS.RAINBOW[2]}">
                            <i class="fas fa-gift"></i>
                        </div>
                        <h3>祈愿转盘</h3>
                        <p>消耗魔力抽取礼物</p>
                    </a>
                    
                    <a href="#ranking" class="action-card" data-page="ranking" style="border-top-color: ${CONFIG.COLORS.RAINBOW[4]}">
                        <div class="action-icon" style="color: ${CONFIG.COLORS.RAINBOW[4]}">
                            <i class="fas fa-trophy"></i>
                        </div>
                        <h3>魔力榜单</h3>
                        <p>查看契约者排行榜</p>
                    </a>
                </div>
                
                <!-- 公告 -->
                <div class="announcement-card rainbow-border">
                    <div class="card-header">
                        <h3 class="rainbow-text"><i class="fas fa-bullhorn"></i> 公主公告</h3>
                        <span class="live-badge rainbow-bg">直播倒计时</span>
                    </div>
                    <div class="card-content">
                        <p>🎉 契约者们~欢迎来到我的魔力补给站！</p>
                        <p>🎮 周年庆直播将在 <strong>${formattedDate}</strong> 开始！</p>
                        <p>✨ 收集魔力最多的前十名有特别奖励！</p>
                        <p>🎁 直播期间有魔力双倍活动！</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    async initPageFeatures(pageId) {
        switch (pageId) {
            case 'games':
                await this.loadModule('game-manager.js');
                break;
            case 'lottery':
                await this.loadModule('lottery.js');
                break;
            case 'ranking':
                await this.loadModule('ranking.js');
                break;
            case 'messages':
                await this.loadModule('messages.js');
                break;
        }
    }
    
    updateNavActive(activePage) {
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.dataset.page === activePage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    async loadModule(modulePath) {
        // 动态加载JS模块
        return new Promise((resolve, reject) => {
            // 检查是否已加载
            if (this.modules[modulePath.replace('.js', '')]) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = modulePath;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`加载模块失败: ${modulePath}`));
            document.body.appendChild(script);
        });
    }
    
    bindEvents() {
        // 全局点击事件 - 页面导航
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-page]');
            if (link) {
                e.preventDefault();
                const pageId = link.dataset.page;
                this.loadPage(pageId);
                
                // 更新URL哈希
                window.location.hash = pageId;
            }
        });
        
        // 监听积分更新
        window.addEventListener('taoci:pointsUpdated', (e) => {
            console.log('💎 积分更新:', e.detail);
            this.updateUserDisplay();
        });
        
        // 处理URL哈希变化
        window.addEventListener('hashchange', () => {
            const pageId = window.location.hash.replace('#', '') || 'home';
            this.loadPage(pageId);
        });
    }
    
    updateUserDisplay() {
        const user = this.modules.user.getUserInfo();
        
        // 更新导航栏中的用户信息
        const pointsElements = document.querySelectorAll('.user-points span');
        pointsElements.forEach(el => {
            el.textContent = user.points.toLocaleString();
        });
        
        const usernameElements = document.querySelectorAll('.username');
        usernameElements.forEach(el => {
            el.textContent = user.username;
        });
    }
    
    triggerEvent(eventName, data) {
        const event = new CustomEvent(`taoci:${eventName}`, { detail: data });
        window.dispatchEvent(event);
    }
    
    showError(message) {
        const appElement = document.getElementById('app');
        if (appElement) {
            appElement.innerHTML = `
                <div class="error-container">
                    <h2 class="rainbow-text">发生错误</h2>
                    <p>${message}</p>
                    <button class="btn-rainbow" onclick="location.reload()">重新加载</button>
                </div>
            `;
        }
    }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TaociMagicApp();
});