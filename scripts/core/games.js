/**
 * 游戏配置管理器 - 重构版
 * 专注于游戏配置管理和页面渲染，避免复杂逻辑
 */

class GamesManager {
    constructor() {
        this.games = new Map();
        this.currentGame = null;
        this.loadedModules = new Map();
        
        // 默认游戏配置 - 简化版
        this.defaultGames = [
            {
                id: 'magic-merge',
                name: '魔力合成',
                description: '合成魔力水晶，获得桃汽水の祝福！',
                icon: '🧩',
                category: 'puzzle',
                difficulty: '中等',
                status: 'ready',
                path: './scripts/game-magic-merge/index.js',
                color: 'var(--color-primary)',
                backgroundColor: 'rgba(255, 110, 255, 0.1)'
            }
        ];
    }
    
    /**
     * 初始化游戏管理器 - 简化版
     */
    async init(appContext) {
        this.context = appContext;
        
        // 简单注册所有游戏
        this.registerDefaultGames();
        
        console.log('🎮 游戏管理器已初始化');
        return this;
    }
    
    /**
     * 注册默认游戏
     */
    registerDefaultGames() {
        this.defaultGames.forEach(game => {
            this.games.set(game.id, {
                ...game,
                highScore: this.loadHighScore(game.id),
                playCount: this.loadPlayCount(game.id),
                lastPlayed: null
            });
        });
    }
    
    /**
     * 获取所有游戏
     */
    getAllGames() {
        return Array.from(this.games.values());
    }
    
    /**
     * 获取游戏配置
     */
    getGameConfig(gameId) {
        return this.games.get(gameId);
    }
    
    /**
     * 加载最高分
     */
    loadHighScore(gameId) {
        try {
            const saved = localStorage.getItem(`taoci_game_${gameId}_high`);
            return saved ? parseInt(saved) : 0;
        } catch (error) {
            return 0;
        }
    }
    
    /**
     * 保存最高分
     */
    saveHighScore(gameId, score) {
        try {
            localStorage.setItem(`taoci_game_${gameId}_high`, score.toString());
            
            // 更新缓存
            const game = this.games.get(gameId);
            if (game) {
                game.highScore = score;
            }
        } catch (error) {
            console.error('保存最高分失败:', error);
        }
    }
    
    /**
     * 加载游玩次数
     */
    loadPlayCount(gameId) {
        try {
            const saved = localStorage.getItem(`taoci_game_${gameId}_count`);
            return saved ? parseInt(saved) : 0;
        } catch (error) {
            return 0;
        }
    }
    
    /**
     * 增加游玩次数
     */
    incrementPlayCount(gameId) {
        try {
            const current = this.loadPlayCount(gameId);
            const newCount = current + 1;
            localStorage.setItem(`taoci_game_${gameId}_count`, newCount.toString());
            
            // 更新缓存
            const game = this.games.get(gameId);
            if (game) {
                game.playCount = newCount;
                game.lastPlayed = new Date().toISOString();
            }
            
            return newCount;
        } catch (error) {
            console.error('更新游玩次数失败:', error);
            return 0;
        }
    }
    
    /**
     * 加载游戏模块
     */
    async loadGame(gameId) {
        const gameConfig = this.getGameConfig(gameId);
        if (!gameConfig) {
            throw new Error(`找不到游戏配置: ${gameId}`);
        }
        
        // 检查是否已加载
        if (this.loadedModules.has(gameId)) {
            console.log(`游戏模块 ${gameId} 已加载，直接使用`);
            return this.loadedModules.get(gameId);
        }
        
        try {
            // 动态加载游戏模块
            const module = await import(gameConfig.path);
            const GameModule = module.default;
            
            // 创建游戏实例
            const gameInstance = new GameModule();
            
            // 准备上下文
            const gameContext = {
                app: this.context.app,
                config: this.context.config,
                games: this,
                emit: this.context.emit,
                on: this.context.on
            };
            
            // 初始化游戏
            await gameInstance.init(gameContext);
            
            // 缓存模块
            this.loadedModules.set(gameId, gameInstance);
            this.currentGame = gameInstance;
            
            // 增加游玩次数
            this.incrementPlayCount(gameId);
            
            console.log(`🎮 游戏模块 ${gameId} 加载成功`);
            return gameInstance;
            
        } catch (error) {
            console.error(`加载游戏模块 ${gameId} 失败:`, error);
            throw error;
        }
    }
    
    /**
     * 卸载当前游戏
     */
    async unloadCurrentGame() {
        if (this.currentGame && this.currentGame.destroy) {
            try {
                await this.currentGame.destroy();
                console.log('🎮 当前游戏已卸载');
            } catch (error) {
                console.error('卸载游戏失败:', error);
            }
        }
        
        this.currentGame = null;
    }
    
    /**
     * 渲染游戏页面
     */
    async renderGamesPage() {
        const container = document.getElementById('app-main');
        if (!container) return;
        
        container.innerHTML = this.renderGamesLayout();
        this.bindGameEvents(container);
    }
    
    /**
     * 渲染游戏页面布局 - 简化版
     */
    renderGamesLayout() {
        const readyGames = this.getAllGames().filter(game => game.status === 'ready');
        const comingSoonGames = this.getAllGames().filter(game => game.status === 'coming-soon');
        
        return `
            <div class="games-page">
                <div class="page-header">
                    <h2>🎮 魔力小游戏</h2>
                    <p class="page-subtitle">选择游戏开始收集魔力，小心有惊喜哦~</p>
                </div>
                
                ${readyGames.length > 0 ? `
                    <div class="games-section">
                        <h3 class="section-title">✨ 已上线游戏</h3>
                        <div class="games-grid">
                            ${readyGames.map(game => this.renderGameCard(game)).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${comingSoonGames.length > 0 ? `
                    <div class="games-section">
                        <h3 class="section-title">⏳ 即将上线</h3>
                        <div class="games-grid">
                            ${comingSoonGames.map(game => this.renderGameCard(game)).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${readyGames.length === 0 && comingSoonGames.length === 0 ? `
                    <div class="no-games-message">
                        <div class="message-icon">🎮</div>
                        <h3>游戏开发中...</h3>
                        <p>精灵公主正在努力制作新游戏，请耐心等待~</p>
                    </div>
                ` : ''}
                
                <div class="page-footer">
                    <button class="btn btn-secondary" onclick="window.TaociApp.navigate('home')">
                        <i class="fas fa-arrow-left"></i> 返回首页
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * 渲染游戏卡片 - 简化版
     */
    renderGameCard(game) {
        const isReady = game.status === 'ready';
        const highScore = game.highScore || 0;
        const playCount = game.playCount || 0;
        
        return `
            <div class="game-card ${game.status}" 
                 style="border-color: ${game.color}; background: ${game.backgroundColor}">
                <div class="game-card-header">
                    <div class="game-icon" style="background: ${game.color}20">
                        ${game.icon}
                    </div>
                    ${!isReady ? '<span class="game-badge">即将上线</span>' : ''}
                </div>
                
                <div class="game-card-content">
                    <h4 class="game-title">${game.name}</h4>
                    <p class="game-description">${game.description}</p>
                    
                    ${isReady ? `
                        <div class="game-stats">
                            ${highScore > 0 ? `
                                <div class="game-stat">
                                    <span class="stat-label">最高分</span>
                                    <span class="stat-value">${highScore}</span>
                                </div>
                            ` : ''}
                            
                            ${playCount > 0 ? `
                                <div class="game-stat">
                                    <span class="stat-label">游玩次数</span>
                                    <span class="stat-value">${playCount}</span>
                                </div>
                            ` : ''}
                            
                            <div class="game-stat">
                                <span class="stat-label">难度</span>
                                <span class="stat-value">${game.difficulty}</span>
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="game-card-footer">
                    ${isReady ? `
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
     * 绑定游戏事件
     */
    bindGameEvents(container) {
        const playButtons = container.querySelectorAll('.play-btn');
        playButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const gameId = btn.dataset.gameId;
                await this.startGame(gameId);
            });
        });
    }
    
    /**
     * 开始游戏
     */
    async startGame(gameId) {
        try {
            // 显示简单加载提示
            this.showLoading('正在加载游戏...');
            
            // 加载游戏模块
            await this.loadGame(gameId);
            
            // 隐藏加载提示（游戏模块会处理自己的加载界面）
            setTimeout(() => {
                this.hideLoading();
            }, 500);
            
        } catch (error) {
            console.error('开始游戏失败:', error);
            this.hideLoading();
            this.showError('游戏加载失败，请稍后重试');
        }
    }
    
    /**
     * 显示加载提示
     */
    showLoading(message) {
        // 使用主应用的加载提示
        if (this.context.app && this.context.app.showLoading) {
            this.context.app.showLoading(message);
        } else {
            console.log(message);
        }
    }
    
    /**
     * 隐藏加载提示
     */
    hideLoading() {
        if (this.context.app && this.context.app.hideLoading) {
            this.context.app.hideLoading();
        }
    }
    
    /**
     * 显示错误
     */
    showError(message) {
        if (this.context.app && this.context.app.showError) {
            this.context.app.showError(message);
        } else {
            alert(message);
        }
    }
    
    /**
     * 清理资源
     */
    destroy() {
        // 卸载所有已加载的游戏模块
        this.loadedModules.forEach((module, gameId) => {
            if (module.destroy) {
                try {
                    module.destroy();
                    console.log(`🎮 游戏模块 ${gameId} 已卸载`);
                } catch (error) {
                    console.error(`卸载游戏模块 ${gameId} 失败:`, error);
                }
            }
        });
        
        this.loadedModules.clear();
        this.games.clear();
        this.currentGame = null;
        this.context = null;
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