/**
 * 游戏配置管理器
 * 负责管理所有游戏的配置、加载和渲染
 */

class GamesManager {
    constructor() {
        this.games = new Map();
        this.currentGame = null;
        this.loadedModules = new Map();
        
        // 默认游戏配置
        // 在 scripts/core/games.js 中修改默认游戏配置：
        this.defaultGames = [
            {
                id: 'magic-merge',
                name: '魔力合成',
                description: '合成相同等级的魔力水晶，获得桃汽水の祝福！',
                icon: '🧩',
                category: 'puzzle',
                difficulty: 'medium',
                pointsRatio: 1, // 积分比例 1:1
                status: 'ready',
                path: '../game-magic-merge/index.js',
                minPoints: 0,
                maxScore: 4096,
                // 使用已有的API接口
                apiEndpoints: {
                    submit: 'game/submit',  // 使用已有的游戏提交接口
                    addPoints: 'points/add' // 使用已有的积分添加接口
                }
            }
        ];
    }
    
    /**
     * 初始化游戏管理器
     */
    // 在 init 方法中添加性能优化
    async init(appContext) {
        this.context = appContext;
        
        // 预加载游戏资源
        this.preloadGameAssets();
        
        // 注册所有游戏
        this.registerDefaultGames();
        
        console.log('🎮 游戏管理器已初始化');
        return this;
    }
    
    // 添加预加载方法
    preloadGameAssets() {
        // 预加载游戏图标字体
        if (!document.querySelector('#game-font-preload')) {
            const link = document.createElement('link');
            link.id = 'game-font-preload';
            link.rel = 'preload';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            link.as = 'style';
            document.head.appendChild(link);
        }
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
            lastPlayed: null,
            highScore: 0,
            playCount: 0
        });
        
        console.log(`🎮 已注册游戏: ${gameConfig.name} (${gameConfig.id})`);
        return true;
    }
    
    /**
     * 获取所有游戏
     */
    getAllGames() {
        return Array.from(this.games.values());
    }
    
    /**
     * 根据分类获取游戏
     */
    getGamesByCategory(category) {
        return this.getAllGames().filter(game => game.category === category);
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
     * 保存游戏状态
     */
    saveGameState(gameId, state) {
        const key = `taoci_game_${gameId}`;
        try {
            const gameConfig = this.getGameConfig(gameId);
            const currentState = this.getGameState(gameId) || {};
            
            // 合并状态
            const newState = {
                ...currentState,
                ...state,
                gameId,
                updatedAt: new Date().toISOString()
            };
            
            // 更新高分
            if (state.score > currentState.highScore) {
                newState.highScore = state.score;
            }
            
            localStorage.setItem(key, JSON.stringify(newState));
            
            // 更新游戏配置中的统计数据
            if (this.games.has(gameId)) {
                const game = this.games.get(gameId);
                game.highScore = newState.highScore || 0;
                game.lastPlayed = newState.updatedAt;
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
            
            // 准备上下文
            const gameContext = {
                app: this.context.app,
                config: this.context.config,
                games: this,
                emit: this.context.emit,
                on: this.context.on,
                gameConfig
            };
            
            // 初始化游戏
            await gameInstance.init(gameContext);
            
            // 缓存模块
            this.loadedModules.set(gameId, gameInstance);
            this.currentGame = gameInstance;
            
            // 触发游戏加载事件
            this.context.emit('game:loaded', {
                gameId,
                gameName: gameConfig.name,
                timestamp: Date.now()
            });
            
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
    // 修改游戏卡片加载方式
    renderGameCardsHTML() {
        return new Promise((resolve) => {
            // 使用 requestAnimationFrame 避免阻塞主线程
            requestAnimationFrame(() => {
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
                
                resolve(html);
            });
        });
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
     * 绑定游戏卡片事件
     */
    bindGameCardEvents(container) {
        const playButtons = container.querySelectorAll('.play-btn');
        playButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const gameId = btn.dataset.gameId;
                await this.loadAndPlayGame(gameId);
            });
        });
    }
    
    /**
     * 加载并开始游戏
     */
    async loadAndPlayGame(gameId) {
        try {
            // 显示加载中
            this.context.app.showLoading('正在加载游戏...');
            
            // 加载游戏模块
            const gameModule = await this.loadGame(gameId);
            
            // 隐藏加载中（由游戏模块自行处理）
            setTimeout(() => {
                this.context.app.hideLoading();
            }, 500);
            
            return gameModule;
            
        } catch (error) {
            console.error('加载游戏失败:', error);
            this.context.app.showError(`游戏加载失败: ${error.message}`);
            this.context.app.hideLoading();
            return null;
        }
    }
    
    /**
     * 显示游戏页面
     */
    async renderGamesPage() {
        const container = document.getElementById('app-main');
        if (!container) return;
        
        container.innerHTML = `
            <section class="games-page">
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
        
        // 绑定游戏卡片事件
        this.bindGameCardEvents(container);
    }
    
    /**
     * 显示加载中
     */
    showLoading(message = '加载中...') {
        // 可以在这里添加自定义加载动画
        console.log(message);
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