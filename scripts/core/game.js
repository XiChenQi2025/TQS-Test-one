/**
 * 游戏管理器 - 简化版
 * 避免复杂的依赖和异步问题
 */

// 游戏配置
const GAME_CONFIGS = [
    {
        id: 'magic-merge',
        name: '魔力合成',
        description: '合成相同等级的魔力水晶，获得桃汽水の祝福！',
        icon: '🧩',
        category: 'puzzle',
        difficulty: 'medium',
        pointsRatio: 1,
        status: 'ready',
        path: './scripts/game-magic-merge/index.js',
        minPoints: 0,
        maxScore: 4096
    }
    // 可以在这里添加更多游戏
];

class GamesManager {
    constructor() {
        this.games = new Map();
        this.currentGame = null;
        this.appContext = null;
        
        console.log('🎮 游戏管理器初始化');
    }
    
    /**
     * 初始化游戏管理器
     */
    init(appContext) {
        this.appContext = appContext;
        
        // 注册所有游戏
        this.registerGames();
        
        console.log('✅ 游戏管理器已初始化');
        return this;
    }
    
    /**
     * 注册游戏
     */
    registerGames() {
        GAME_CONFIGS.forEach(config => {
            this.games.set(config.id, {
                ...config,
                createdAt: new Date().toISOString(),
                lastPlayed: null,
                highScore: 0,
                playCount: 0
            });
            console.log(`✅ 注册游戏: ${config.name}`);
        });
    }
    
    /**
     * 获取所有游戏
     */
    getAllGames() {
        return Array.from(this.games.values());
    }
    
    /**
     * 根据状态获取游戏
     */
    getGamesByStatus(status) {
        return this.getAllGames().filter(game => game.status === status);
    }
    
    /**
     * 获取游戏配置
     */
    getGameConfig(gameId) {
        return this.games.get(gameId);
    }
    
    /**
     * 获取游戏状态（用户相关）
     */
    getGameState(gameId) {
        const key = `taoci_game_${gameId}`;
        try {
            const saved = localStorage.getItem(key);
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.error('获取游戏状态失败:', error);
            return null;
        }
    }
    
    /**
     * 渲染游戏页面
     */
    async renderGamesPage() {
        console.log('🎮 开始渲染游戏页面');
        
        const container = document.getElementById('app-main');
        if (!container) {
            console.error('找不到主容器');
            return;
        }
        
        try {
            // 显示加载状态
            container.innerHTML = this.getLoadingHTML();
            
            // 获取游戏数据
            const html = await this.getGamesPageHTML();
            
            // 渲染页面
            container.innerHTML = html;
            
            // 绑定事件
            setTimeout(() => {
                this.bindGameCardEvents(container);
            }, 100);
            
            console.log('✅ 游戏页面渲染完成');
            
        } catch (error) {
            console.error('游戏页面渲染失败:', error);
            container.innerHTML = this.getErrorHTML();
        }
    }
    
    /**
     * 获取游戏页面HTML
     */
    async getGamesPageHTML() {
        return `
            <section class="games-page fade-in">
                <div class="page-header">
                    <h2 class="page-title">
                        <i class="fas fa-gamepad"></i> 魔力小游戏
                    </h2>
                    <p class="page-description">
                        游玩小游戏收集魔力值，小心有惊喜哦~
                    </p>
                </div>
                
                <div class="games-container">
                    ${this.getGameCardsHTML()}
                </div>
                
                <div class="page-footer">
                    <button class="btn btn-secondary" onclick="window.TaociApp.navigate('home')">
                        <i class="fas fa-arrow-left"></i> 返回首页
                    </button>
                </div>
            </section>
        `;
    }
    
    /**
     * 获取游戏卡片HTML
     */
    getGameCardsHTML() {
        const readyGames = this.getGamesByStatus('ready');
        const comingSoonGames = this.getGamesByStatus('coming-soon');
        
        let html = '';
        
        // 已上线的游戏
        if (readyGames.length > 0) {
            html += `
                <div class="games-section">
                    <h3 class="section-title">🎮 已上线游戏</h3>
                    <div class="game-grid">
                        ${readyGames.map(game => this.renderGameCard(game)).join('')}
                    </div>
                </div>
            `;
        }
        
        // 即将上线的游戏
        if (comingSoonGames.length > 0) {
            html += `
                <div class="games-section" style="margin-top: 40px;">
                    <h3 class="section-title">✨ 即将上线</h3>
                    <div class="game-grid">
                        ${comingSoonGames.map(game => this.renderGameCard(game)).join('')}
                    </div>
                </div>
            `;
        }
        
        // 如果没有游戏
        if (!readyGames.length && !comingSoonGames.length) {
            html = `
                <div class="no-games-message">
                    <div class="message-icon">🎮</div>
                    <h3>游戏开发中...</h3>
                    <p>精灵公主正在努力制作新游戏，请耐心等待~</p>
                </div>
            `;
        }
        
        return html;
    }
    
    /**
     * 渲染单个游戏卡片
     */
    renderGameCard(game) {
        const gameState = this.getGameState(game.id);
        const highScore = gameState?.highScore || 0;
        const playCount = gameState?.playCount || 0;
        
        return `
            <div class="game-card ${game.status}" data-game-id="${game.id}">
                <div class="game-card-header">
                    <div class="game-icon">${game.icon}</div>
                    ${game.status === 'coming-soon' ? '<span class="coming-soon-badge">即将上线</span>' : ''}
                    ${game.status === 'beta' ? '<span class="beta-badge">测试版</span>' : ''}
                </div>
                
                <div class="game-card-content">
                    <h4 class="game-title">${game.name}</h4>
                    <p class="game-description">${game.description}</p>
                    
                    ${game.status === 'ready' ? `
                        <div class="game-stats">
                            ${highScore > 0 ? `
                                <div class="stat-item">
                                    <span class="stat-label">最高分</span>
                                    <span class="stat-value">${highScore}</span>
                                </div>
                            ` : ''}
                            
                            ${playCount > 0 ? `
                                <div class="stat-item">
                                    <span class="stat-label">游玩次数</span>
                                    <span class="stat-value">${playCount}</span>
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="game-meta">
                            <span class="game-difficulty">难度: ${this.getDifficultyText(game.difficulty)}</span>
                            <span class="game-points">积分: 1:${game.pointsRatio}</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="game-card-footer">
                    ${game.status === 'ready' ? `
                        <button class="btn btn-rainbow play-btn" data-game-id="${game.id}">
                            <i class="fas fa-play"></i> 开始游戏
                        </button>
                    ` : `
                        <button class="btn btn-secondary" disabled>
                            <i class="fas fa-clock"></i> 敬请期待
                        </button>
                    `}
                </div>
            </div>
        `;
    }
    
    /**
     * 绑定游戏卡片事件
     */
    bindGameCardEvents(container) {
        const playButtons = container.querySelectorAll('.play-btn');
        playButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const gameId = btn.dataset.gameId;
                console.log(`🎮 点击开始游戏: ${gameId}`);
                
                this.loadAndPlayGame(gameId);
            });
        });
    }
    
    /**
     * 加载并开始游戏
     */
    async loadAndPlayGame(gameId) {
        const gameConfig = this.getGameConfig(gameId);
        if (!gameConfig) {
            console.error('找不到游戏配置:', gameId);
            return;
        }
        
        try {
            console.log(`🎮 加载游戏模块: ${gameConfig.path}`);
            
            // 显示加载状态
            if (this.appContext && this.appContext.app.showLoading) {
                this.appContext.app.showLoading('正在加载游戏...');
            }
            
            // 动态导入游戏模块
            const module = await import(gameConfig.path);
            const GameModule = module.default;
            
            // 创建游戏实例
            const gameInstance = new GameModule();
            
            // 准备上下文
            const gameContext = {
                app: this.appContext.app,
                config: this.appContext.config,
                games: this,
                emit: this.appContext.emit,
                on: this.appContext.on,
                gameConfig
            };
            
            // 初始化游戏
            await gameInstance.init(gameContext);
            
            // 隐藏加载状态
            if (this.appContext && this.appContext.app.hideLoading) {
                setTimeout(() => {
                    this.appContext.app.hideLoading();
                }, 500);
            }
            
            console.log(`✅ 游戏加载成功: ${gameId}`);
            
        } catch (error) {
            console.error(`❌ 游戏加载失败 ${gameId}:`, error);
            
            // 显示错误
            if (this.appContext && this.appContext.app.showError) {
                this.appContext.app.showError('游戏加载失败，请稍后重试');
            }
            
            // 隐藏加载状态
            if (this.appContext && this.appContext.app.hideLoading) {
                this.appContext.app.hideLoading();
            }
        }
    }
    
    /**
     * 获取难度文本
     */
    getDifficultyText(difficulty) {
        const map = {
            easy: '简单',
            medium: '中等',
            hard: '困难',
            expert: '专家'
        };
        return map[difficulty] || difficulty;
    }
    
    /**
     * 获取加载中HTML
     */
    getLoadingHTML() {
        return `
            <section class="games-page">
                <div class="page-header">
                    <h2 class="page-title">
                        <i class="fas fa-gamepad"></i> 魔力小游戏
                    </h2>
                </div>
                
                <div class="games-container">
                    <div class="game-grid">
                        ${Array(2).fill(0).map(() => `
                            <div class="game-card loading">
                                <div class="game-card-header">
                                    <div class="game-icon"></div>
                                </div>
                                <div class="game-card-content">
                                    <h4 class="game-title"></h4>
                                    <p class="game-description"></p>
                                    <div class="game-stats">
                                        <div class="stat-item">
                                            <span class="stat-label"></span>
                                            <span class="stat-value"></span>
                                        </div>
                                    </div>
                                </div>
                                <div class="game-card-footer">
                                    <button class="btn btn-secondary" disabled>
                                        加载中...
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </section>
        `;
    }
    
    /**
     * 获取错误HTML
     */
    getErrorHTML() {
        return `
            <section class="games-page">
                <div class="page-header">
                    <h2 class="page-title">
                        <i class="fas fa-gamepad"></i> 魔力小游戏
                    </h2>
                </div>
                
                <div class="games-container">
                    <div class="no-games-message">
                        <div class="message-icon">⚠️</div>
                        <h3>游戏加载失败</h3>
                        <p>请刷新页面或稍后重试</p>
                        <button class="btn btn-primary" onclick="location.reload()" style="margin-top: 20px;">
                            重新加载
                        </button>
                    </div>
                </div>
            </section>
        `;
    }
    
    /**
     * 清理资源
     */
    destroy() {
        if (this.currentGame && this.currentGame.destroy) {
            this.currentGame.destroy();
        }
        this.games.clear();
        this.currentGame = null;
        this.appContext = null;
    }
}

// 单例实例
let gamesManagerInstance = null;

export function getGamesManager() {
    if (!gamesManagerInstance) {
        gamesManagerInstance = new GamesManager();
    }
    return gamesManagerInstance;
}

export default GamesManager;