/**
 * 游戏管理器 - 简化重构版
 * 负责游戏列表管理和模块加载
 */

class GamesManager {
    constructor() {
        this.games = new Map();
        this.currentGame = null;
        this.loadedModules = new Map();
        
        // 使用主骨架的配置，简化游戏配置
        this.defaultGames = [
            {
                id: 'magic-merge',
                name: '魔力合成',
                description: '合成相同等级的魔力水晶，合成桃汽水の祝福！',
                icon: '🧩',
                status: 'ready',
                path: './scripts/game-magic-merge/index.js',
                version: '2.0.0'
            }
            // 可以在这里添加更多游戏
        ];
    }
    
    /**
     * 初始化游戏管理器
     */
    async init(appContext) {
        this.context = appContext;
        
        // 注册游戏
        this.registerDefaultGames();
        
        console.log('🎮 游戏管理器已初始化');
        return this;
    }
    
    /**
     * 注册默认游戏
     */
    registerDefaultGames() {
        this.defaultGames.forEach(game => {
            this.registerGame(game);
        });
    }
    
    /**
     * 注册新游戏
     */
    registerGame(gameConfig) {
        if (!gameConfig.id) {
            console.error('游戏配置必须包含id字段');
            return false;
        }
        
        this.games.set(gameConfig.id, {
            ...gameConfig,
            createdAt: new Date().toISOString(),
            playCount: 0
        });
        
        console.log(`🎮 已注册游戏: ${gameConfig.name}`);
        return true;
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
     * 获取游戏状态
     */
    getGameState(gameId) {
        const key = `taoci_game_${gameId}`;
        try {
            const saved = localStorage.getItem(key);
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            return null;
        }
    }
    
    /**
     * 保存游戏状态
     */
    saveGameState(gameId, state) {
        const key = `taoci_game_${gameId}`;
        try {
            const currentState = this.getGameState(gameId) || {};
            const newState = {
                ...currentState,
                ...state,
                gameId,
                updatedAt: new Date().toISOString()
            };
            
            localStorage.setItem(key, JSON.stringify(newState));
            
            // 更新游戏统计
            if (this.games.has(gameId)) {
                const game = this.games.get(gameId);
                game.playCount = (game.playCount || 0) + 1;
            }
            
            return newState;
        } catch (error) {
            console.error('保存游戏状态失败:', error);
            return null;
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
            
            // 准备简单的上下文
            const gameContext = {
                app: this.context?.app || window.TaociApp,
                emit: (event, data) => {
                    if (this.context?.emit) this.context.emit(event, data);
                    console.log(`游戏事件: ${event}`, data);
                },
                on: (event, callback) => {
                    if (this.context?.on) this.context.on(event, callback);
                },
                gameConfig
            };
            
            // 初始化游戏
            await gameInstance.init(gameContext);
            
            // 缓存模块
            this.loadedModules.set(gameId, gameInstance);
            this.currentGame = gameInstance;
            
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
        
        // 获取游戏列表
        const readyGames = this.getGamesByStatus('ready');
        const comingSoonGames = this.getGamesByStatus('coming-soon');
        
        // 构建页面HTML - 使用主骨架的样式类
        container.innerHTML = `
            <div class="games-page-container">
                <div class="page-header">
                    <h2 class="page-title">
                        <i class="fas fa-gamepad"></i> 魔力小游戏
                    </h2>
                    <p class="page-description">
                        游玩小游戏收集魔力值，小心有惊喜哦~
                    </p>
                </div>
                
                <div class="games-content">
                    ${this.getGamesListHTML(readyGames, '已上线游戏')}
                    
                    ${comingSoonGames.length > 0 ? this.getGamesListHTML(comingSoonGames, '即将上线') : ''}
                    
                    ${readyGames.length === 0 && comingSoonGames.length === 0 ? this.getNoGamesHTML() : ''}
                </div>
                
                <div class="page-footer">
                    <button class="btn btn-secondary" onclick="window.TaociApp.navigate('home')">
                        <i class="fas fa-arrow-left"></i> 返回首页
                    </button>
                </div>
            </div>
        `;
        
        // 绑定游戏卡片事件
        this.bindGameCardEvents(container);
    }
    
    /**
     * 获取游戏列表HTML
     */
    getGamesListHTML(games, sectionTitle) {
        if (games.length === 0) return '';
        
        return `
            <div class="games-section">
                <h3 class="section-title">${sectionTitle}</h3>
                <div class="games-grid">
                    ${games.map(game => this.renderGameCard(game)).join('')}
                </div>
            </div>
        `;
    }
    
    /**
     * 渲染游戏卡片
     */
    renderGameCard(game) {
        const gameState = this.getGameState(game.id);
        const isReady = game.status === 'ready';
        
        return `
            <div class="game-card ${game.status}" data-game-id="${game.id}">
                <div class="game-card-header">
                    <div class="game-icon">${game.icon}</div>
                    ${game.status === 'coming-soon' ? 
                        '<span class="status-badge coming-soon">即将上线</span>' : ''}
                    ${game.status === 'beta' ? 
                        '<span class="status-badge beta">测试版</span>' : ''}
                </div>
                
                <div class="game-card-body">
                    <h4 class="game-title">${game.name}</h4>
                    <p class="game-description">${game.description}</p>
                    
                    ${isReady && gameState?.playCount > 0 ? `
                        <div class="game-stats">
                            <span class="stat-item">
                                <i class="fas fa-play-circle"></i> ${gameState.playCount}次
                            </span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="game-card-footer">
                    ${isReady ? `
                        <button class="btn btn-rainbow play-game-btn" data-game-id="${game.id}">
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
     * 获取无游戏提示HTML
     */
    getNoGamesHTML() {
        return `
            <div class="no-games-message">
                <div class="message-icon">🎮</div>
                <h3>游戏正在准备中...</h3>
                <p>精灵公主正在努力制作新游戏，请耐心等待~</p>
            </div>
        `;
    }
    
    /**
     * 绑定游戏卡片事件
     */
    bindGameCardEvents(container) {
        const playButtons = container.querySelectorAll('.play-game-btn');
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
            console.log(`开始游戏: ${gameId}`);
            
            // 显示简单加载提示
            const container = document.getElementById('app-main');
            if (container) {
                container.innerHTML = `
                    <div class="game-loading-simple">
                        <div class="loading-spinner"></div>
                        <p>正在加载游戏...</p>
                    </div>
                `;
            }
            
            // 加载游戏模块
            const gameModule = await this.loadGame(gameId);
            
            // 游戏加载完成后，游戏模块会自己渲染
            return gameModule;
            
        } catch (error) {
            console.error('启动游戏失败:', error);
            
            // 显示错误信息并返回游戏列表
            const container = document.getElementById('app-main');
            if (container) {
                container.innerHTML = `
                    <div class="game-error">
                        <div class="error-icon">⚠️</div>
                        <h3>游戏加载失败</h3>
                        <p>${error.message || '请稍后重试'}</p>
                        <button class="btn btn-primary" onclick="window.TaociApp.navigate('games')">
                            <i class="fas fa-redo"></i> 返回游戏列表
                        </button>
                    </div>
                `;
            }
            
            return null;
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

// 创建单例实例
let gamesManagerInstance = null;

export function getGamesManager() {
    if (!gamesManagerInstance) {
        gamesManagerInstance = new GamesManager();
    }
    return gamesManagerInstance;
}

export default GamesManager;