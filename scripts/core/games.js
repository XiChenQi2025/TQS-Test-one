/**
 * 游戏管理器 - 重构版
 * 负责管理所有游戏的配置、加载和渲染
 * 适配新游戏模块设计规范
 */

class GamesManager {
    constructor() {
        this.games = new Map();
        this.currentGame = null;
        this.loadedModules = new Map();
        this.isLoading = false;
        this.loadingProgress = 0;
        
        // 默认游戏配置（适配新游戏模块）
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
                version: '2.0.0',
                minPoints: 0,
                maxScore: 4096,
                featured: true, // 是否推荐
                lastUpdated: '2025-01-15'
            },
            // 示例：即将上线的游戏
            {
                id: 'bubble-pop',
                name: '魔力泡泡',
                description: '点击消除相同颜色的魔力泡泡，考验反应速度！',
                icon: '🫧',
                category: 'arcade',
                difficulty: 'easy',
                pointsRatio: 0.8,
                status: 'coming-soon',
                path: './scripts/game-bubble-pop/index.js',
                version: '1.0.0',
                minPoints: 0,
                maxScore: 10000,
                featured: false,
                releaseDate: '2025-02-01'
            },
            {
                id: 'rune-match',
                name: '符文匹配',
                description: '记忆并匹配相同符文，解锁神秘魔法力量！',
                icon: '🔯',
                category: 'memory',
                difficulty: 'hard',
                pointsRatio: 1.2,
                status: 'coming-soon',
                path: './scripts/game-rune-match/index.js',
                version: '1.0.0',
                minPoints: 100,
                maxScore: 5000,
                featured: false,
                releaseDate: '2025-02-15'
            }
        ];
        
        // 游戏统计数据
        this.stats = {
            totalGames: 0,
            readyGames: 0,
            comingSoonGames: 0,
            totalPlayCount: 0,
            lastUpdated: null
        };
    }
    
    /**
     * 初始化游戏管理器
     */
    async init(appContext) {
        this.context = appContext;
        
        // 显示加载界面
        this.showLoading('初始化游戏管理器...');
        
        // 注册所有游戏
        await this.registerDefaultGames();
        
        // 更新统计信息
        this.updateStats();
        
        // 隐藏加载界面
        this.hideLoading();
        
        console.log('🎮 游戏管理器已初始化');
        return this;
    }
    
    /**
     * 注册默认游戏
     */
    async registerDefaultGames() {
        for (const gameConfig of this.defaultGames) {
            await this.registerGame(gameConfig);
        }
    }
    
    /**
     * 注册新游戏
     */
    async registerGame(gameConfig) {
        if (!gameConfig.id) {
            console.error('游戏配置必须包含id字段');
            return false;
        }
        
        // 加载游戏状态
        const gameState = this.loadGameState(gameConfig.id);
        
        this.games.set(gameConfig.id, {
            ...gameConfig,
            createdAt: new Date().toISOString(),
            lastPlayed: gameState?.lastPlayed || null,
            highScore: gameState?.highScore || 0,
            playCount: gameState?.playCount || 0,
            totalTime: gameState?.totalTime || 0,
            achievements: gameState?.achievements || []
        });
        
        console.log(`🎮 已注册游戏: ${gameConfig.name} (${gameConfig.id})`);
        return true;
    }
    
    /**
     * 显示加载界面
     */
    showLoading(message = '加载中...') {
        this.isLoading = true;
        this.loadingProgress = 0;
        
        // 创建或更新加载界面
        let loadingEl = document.getElementById('games-loading');
        if (!loadingEl) {
            loadingEl = document.createElement('div');
            loadingEl.id = 'games-loading';
            loadingEl.className = 'games-loading-overlay';
            loadingEl.innerHTML = `
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">${message}</div>
                    <div class="loading-progress-container">
                        <div class="loading-progress-bar" id="games-progress-bar"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(loadingEl);
        } else {
            const textEl = loadingEl.querySelector('.loading-text');
            if (textEl) textEl.textContent = message;
        }
        
        // 更新进度条
        this.updateLoadingProgress();
    }
    
    /**
     * 更新加载进度
     */
    updateLoadingProgress(progress) {
        if (progress !== undefined) {
            this.loadingProgress = Math.min(100, Math.max(0, progress));
        }
        
        const progressBar = document.getElementById('games-progress-bar');
        if (progressBar) {
            progressBar.style.width = `${this.loadingProgress}%`;
        }
        
        // 更新加载文本
        const loadingEl = document.getElementById('games-loading');
        if (loadingEl) {
            const messages = [
                '正在初始化游戏数据...',
                '加载游戏配置...',
                '准备游戏卡片...',
                '即将完成...'
            ];
            
            const index = Math.floor(this.loadingProgress / 25);
            const textEl = loadingEl.querySelector('.loading-text');
            if (textEl && messages[index]) {
                textEl.textContent = messages[index];
            }
        }
    }
    
    /**
     * 隐藏加载界面
     */
    hideLoading() {
        this.isLoading = false;
        const loadingEl = document.getElementById('games-loading');
        if (loadingEl) {
            loadingEl.style.opacity = '0';
            setTimeout(() => {
                if (loadingEl.parentNode) {
                    loadingEl.parentNode.removeChild(loadingEl);
                }
            }, 300);
        }
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
     * 更新统计信息
     */
    updateStats() {
        const allGames = this.getAllGames();
        
        this.stats = {
            totalGames: allGames.length,
            readyGames: this.getGamesByStatus('ready').length,
            comingSoonGames: this.getGamesByStatus('coming-soon').length,
            totalPlayCount: allGames.reduce((sum, game) => sum + (game.playCount || 0), 0),
            totalHighScore: allGames.reduce((sum, game) => sum + (game.highScore || 0), 0),
            lastUpdated: new Date().toISOString()
        };
        
        return this.stats;
    }
    
    /**
     * 加载游戏状态
     */
    loadGameState(gameId) {
        const key = `taoci_game_state_${gameId}`;
        try {
            const saved = localStorage.getItem(key);
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.error('加载游戏状态失败:', error);
            return null;
        }
    }
    
    /**
     * 保存游戏状态
     */
    saveGameState(gameId, state) {
        const key = `taoci_game_state_${gameId}`;
        try {
            const currentState = this.loadGameState(gameId) || {};
            const newState = {
                ...currentState,
                ...state,
                updatedAt: new Date().toISOString()
            };
            
            localStorage.setItem(key, JSON.stringify(newState));
            
            // 更新游戏配置中的统计数据
            const game = this.games.get(gameId);
            if (game) {
                if (state.highScore > game.highScore) {
                    game.highScore = state.highScore;
                }
                if (state.lastPlayed) {
                    game.lastPlayed = state.lastPlayed;
                }
                if (state.playCount) {
                    game.playCount = state.playCount;
                }
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
        
        // 显示加载进度
        this.showLoading(`正在加载${gameConfig.name}...`);
        
        try {
            // 更新加载进度
            this.updateLoadingProgress(20);
            
            // 动态加载游戏模块
            const module = await import(gameConfig.path);
            
            this.updateLoadingProgress(50);
            
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
            
            this.updateLoadingProgress(80);
            
            // 缓存模块
            this.loadedModules.set(gameId, gameInstance);
            this.currentGame = gameInstance;
            
            // 更新游戏状态
            this.saveGameState(gameId, {
                lastPlayed: new Date().toISOString(),
                playCount: (gameConfig.playCount || 0) + 1
            });
            
            // 触发游戏加载事件
            this.context.emit('game:loaded', {
                gameId,
                gameName: gameConfig.name,
                timestamp: Date.now()
            });
            
            this.updateLoadingProgress(100);
            
            console.log(`🎮 游戏模块 ${gameId} 加载成功`);
            return gameInstance;
            
        } catch (error) {
            console.error(`加载游戏模块 ${gameId} 失败:`, error);
            throw error;
        } finally {
            // 延迟隐藏加载界面，让用户看到加载完成
            setTimeout(() => {
                this.hideLoading();
            }, 500);
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
        
        // 显示加载中
        this.showLoading('加载游戏列表...');
        
        // 异步渲染页面
        setTimeout(async () => {
            try {
                const html = await this.generateGamesPageHTML();
                container.innerHTML = html;
                
                // 绑定事件
                this.bindGamesPageEvents();
                
                // 更新进度
                this.updateLoadingProgress(100);
                
            } catch (error) {
                console.error('渲染游戏页面失败:', error);
                container.innerHTML = this.renderErrorPage('加载游戏页面失败');
            } finally {
                setTimeout(() => {
                    this.hideLoading();
                }, 300);
            }
        }, 100);
    }
    
    /**
     * 生成游戏页面HTML
     */
    async generateGamesPageHTML() {
        const readyGames = this.getGamesByStatus('ready');
        const comingSoonGames = this.getGamesByStatus('coming-soon');
        const stats = this.updateStats();
        
        return `
            <section class="games-page">
                <div class="page-header">
                    <div class="page-title-section">
                        <h1 class="page-title">
                            <i class="fas fa-gamepad"></i> 魔力小游戏
                        </h1>
                        <p class="page-subtitle">
                            游玩小游戏收集魔力值，解锁更多有趣内容！
                        </p>
                    </div>
                    
                    <div class="page-stats">
                        <div class="stats-card">
                            <div class="stats-icon">🎮</div>
                            <div class="stats-content">
                                <div class="stats-value">${stats.totalGames}</div>
                                <div class="stats-label">总游戏数</div>
                            </div>
                        </div>
                        
                        <div class="stats-card">
                            <div class="stats-icon">🏆</div>
                            <div class="stats-content">
                                <div class="stats-value">${stats.readyGames}</div>
                                <div class="stats-label">可玩游戏</div>
                            </div>
                        </div>
                        
                        <div class="stats-card">
                            <div class="stats-icon">✨</div>
                            <div class="stats-content">
                                <div class="stats-value">${stats.totalPlayCount}</div>
                                <div class="stats-label">游玩次数</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="games-container">
                    ${this.renderGamesSection('已上线游戏', readyGames, 'ready')}
                    ${this.renderGamesSection('即将上线', comingSoonGames, 'coming-soon')}
                </div>
                
                <div class="page-footer">
                    <button class="btn btn-secondary back-home-btn">
                        <i class="fas fa-arrow-left"></i> 返回首页
                    </button>
                </div>
            </section>
        `;
    }
    
    /**
     * 渲染游戏分类区块
     */
    renderGamesSection(title, games, status) {
        if (games.length === 0) return '';
        
        return `
            <div class="games-section ${status}">
                <div class="section-header">
                    <h2 class="section-title">
                        ${title}
                        <span class="section-count">${games.length}</span>
                    </h2>
                    ${status === 'ready' ? `
                        <div class="section-tip">
                            <i class="fas fa-lightbulb"></i> 点击游戏卡片开始游玩
                        </div>
                    ` : ''}
                </div>
                
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
        const difficultyMap = {
            easy: { text: '简单', color: '#6eff7a' },
            medium: { text: '中等', color: '#ffcc00' },
            hard: { text: '困难', color: '#ff5e7d' },
            expert: { text: '专家', color: '#cc66ff' }
        };
        
        const difficulty = difficultyMap[game.difficulty] || { text: game.difficulty, color: '#5ed1ff' };
        
        return `
            <div class="game-card ${game.status}" data-game-id="${game.id}">
                <div class="card-header">
                    <div class="game-icon">${game.icon}</div>
                    
                    <div class="card-badges">
                        ${game.featured ? '<span class="badge featured">推荐</span>' : ''}
                        ${game.status === 'coming-soon' ? '<span class="badge coming-soon">即将上线</span>' : ''}
                        ${game.status === 'beta' ? '<span class="badge beta">测试版</span>' : ''}
                        
                        <div class="difficulty-badge" style="background: ${difficulty.color}20; color: ${difficulty.color};">
                            ${difficulty.text}
                        </div>
                    </div>
                </div>
                
                <div class="card-content">
                    <h3 class="game-title">${game.name}</h3>
                    <p class="game-description">${game.description}</p>
                    
                    ${game.status === 'ready' ? `
                        <div class="game-stats">
                            ${game.highScore > 0 ? `
                                <div class="stat">
                                    <span class="stat-label">最高分</span>
                                    <span class="stat-value">${game.highScore}</span>
                                </div>
                            ` : ''}
                            
                            ${game.playCount > 0 ? `
                                <div class="stat">
                                    <span class="stat-label">游玩次数</span>
                                    <span class="stat-value">${game.playCount}</span>
                                </div>
                            ` : ''}
                            
                            <div class="stat">
                                <span class="stat-label">积分比例</span>
                                <span class="stat-value">1:${game.pointsRatio}</span>
                            </div>
                        </div>
                        
                        <div class="game-meta">
                            <span class="game-category">${this.getCategoryName(game.category)}</span>
                            <span class="game-version">v${game.version}</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="card-footer">
                    ${game.status === 'ready' ? `
                        <button class="btn btn-rainbow play-btn" data-game-id="${game.id}">
                            <i class="fas fa-play"></i> 开始游戏
                        </button>
                    ` : game.status === 'coming-soon' ? `
                        <div class="coming-soon-info">
                            <i class="fas fa-calendar"></i>
                            <span>预计 ${game.releaseDate}</span>
                        </div>
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
     * 获取分类名称
     */
    getCategoryName(category) {
        const map = {
            puzzle: '解谜',
            arcade: '街机',
            memory: '记忆',
            strategy: '策略',
            action: '动作',
            adventure: '冒险'
        };
        return map[category] || category;
    }
    
    /**
     * 绑定游戏页面事件
     */
    bindGamesPageEvents() {
        // 返回首页按钮
        const backBtn = document.querySelector('.back-home-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                if (this.context.app && this.context.app.navigate) {
                    this.context.app.navigate('home');
                }
            });
        }
        
        // 游戏卡片点击事件
        const playButtons = document.querySelectorAll('.play-btn');
        playButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const gameId = btn.dataset.gameId;
                await this.loadAndPlayGame(gameId);
            });
        });
        
        // 游戏卡片悬停效果
        const gameCards = document.querySelectorAll('.game-card.ready');
        gameCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
    }
    
    /**
     * 加载并开始游戏
     */
    async loadAndPlayGame(gameId) {
        try {
            // 加载游戏模块
            const gameModule = await this.loadGame(gameId);
            
            return gameModule;
            
        } catch (error) {
            console.error('加载游戏失败:', error);
            this.showErrorMessage(`游戏加载失败: ${error.message}`);
            return null;
        }
    }
    
    /**
     * 显示错误消息
     */
    showErrorMessage(message) {
        const errorEl = document.createElement('div');
        errorEl.className = 'game-error-message';
        errorEl.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${message}</span>
            </div>
        `;
        
        errorEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 94, 125, 0.9);
            color: white;
            padding: 12px 20px;
            border-radius: 10px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(errorEl);
        
        setTimeout(() => {
            if (errorEl.parentNode) {
                errorEl.parentNode.removeChild(errorEl);
            }
        }, 3000);
    }
    
    /**
     * 渲染错误页面
     */
    renderErrorPage(message) {
        return `
            <section class="games-page">
                <div class="error-page">
                    <div class="error-icon">⚠️</div>
                    <h2 class="error-title">加载失败</h2>
                    <p class="error-message">${message}</p>
                    <button class="btn btn-primary" onclick="window.TaociApp.navigate('home')">
                        <i class="fas fa-home"></i> 返回首页
                    </button>
                </div>
            </section>
        `;
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
        
        // 移除加载界面
        this.hideLoading();
        
        console.log('🎮 游戏管理器已清理');
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