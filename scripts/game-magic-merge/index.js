// 魔力合成游戏模块 - 重构版
export default class MagicMergeGame {
    constructor() {
        this.name = 'magic-merge';
        this.version = '2.0.0';
        
        // 游戏状态
        this.gameState = {
            score: 0,
            bestScore: 0,
            gameOver: false,
            won: false,
            isMobile: false,
            isPlaying: false,
            isLoading: true,
            loadingProgress: 0
        };
        
        // 等级数据
        this.levelData = this.createLevelData();
        
        // DOM元素引用
        this.container = null;
        this.gridContainer = null;
        this.gameContent = null;
        
        // 引擎和控制器
        this.engine = null;
        this.virtualControls = null;
        this.loadingManager = null;
        
        // 游戏开始时间（用于计算游戏时长）
        this.gameStartTime = null;
        
        // 绑定方法
        this.handleMove = this.handleMove.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
    }
    
    // 创建等级数据
    createLevelData() {
        return {
            0: { emoji: '', name: '空' },
            1: { emoji: '✨', name: '微弱魔力' },
            2: { emoji: '🌟', name: '初级魔力' },
            4: { emoji: '💫', name: '中级魔力' },
            8: { emoji: '🔮', name: '高级魔力' },
            16: { emoji: '🧙‍♀️', name: '魔法师魔力' },
            32: { emoji: '🧚', name: '精灵魔力' },
            64: { emoji: '👑', name: '公主魔力' },
            128: { emoji: '📜', name: '契约魔力' },
            256: { emoji: '🌌', name: '异界魔力' },
            512: { emoji: '👑✨', name: '至尊魔力' },
            1024: { emoji: '🏆', name: '传说魔力' },
            2048: { emoji: '🍑💖', name: '桃汽水の祝福' },
            4096: { emoji: '🌈🌟', name: '终极魔力' }
        };
    }
    
    // 初始化
    async init(context) {
        this.context = context;
        this.gameState.isMobile = this.detectMobile();
        
        // 创建加载管理器
        this.setupLoadingManager();
        
        // 分步加载
        await this.loadStepByStep();
        
        // 完成加载
        this.gameState.isLoading = false;
        this.loadingManager.complete();
        
        console.log(`🎮 ${this.name} 模块加载完成`);
        this.context.emit('game:magic-merge:loaded');
    }
    
    // 分步加载
    async loadStepByStep() {
        const steps = [
            { name: '创建容器', weight: 10 },
            { name: '加载样式', weight: 20 },
            { name: '初始化引擎', weight: 30 },
            { name: '初始化控制', weight: 20 },
            { name: '绑定事件', weight: 20 }
        ];
        
        let progress = 0;
        
        // 步骤1: 创建容器
        await this.createGameContainer();
        progress += steps[0].weight;
        this.loadingManager.update(progress);
        
        // 步骤2: 加载样式
        await this.loadStyles();
        progress += steps[1].weight;
        this.loadingManager.update(progress);
        
        // 步骤3: 初始化引擎
        await this.initGameEngine();
        progress += steps[2].weight;
        this.loadingManager.update(progress);
        
        // 步骤4: 初始化控制
        await this.initControls();
        progress += steps[3].weight;
        this.loadingManager.update(progress);
        
        // 步骤5: 绑定事件
        await this.bindEvents();
        progress += steps[4].weight;
        this.loadingManager.update(progress);
    }
    
    // 创建游戏容器
    async createGameContainer() {
        this.container = document.createElement('div');
        this.container.className = 'magic-merge-container';
        this.container.innerHTML = this.renderGameLayout();
        
        // 添加到页面
        const appContainer = document.getElementById('app-container');
        if (appContainer) {
            appContainer.innerHTML = '';
            appContainer.appendChild(this.container);
            
            // 添加返回按钮
            this.addBackButton();
        }
        
        // 获取关键元素引用
        this.gameContent = this.container.querySelector('.game-content');
        this.gridContainer = this.container.querySelector('#game-grid');
    }
    
    // 渲染游戏布局
    renderGameLayout() {
        return `
            <div class="game-loading" id="game-loading">
                <div class="loading-progress-container">
                    <div class="loading-progress-bar" id="loading-progress-bar"></div>
                    <div class="loading-progress-text" id="loading-progress-text">正在准备魔法阵...</div>
                </div>
            </div>
            
            <div class="game-header">
                <div class="game-title">
                    <h1><i class="fas fa-magic"></i> 桃汽水的魔力合成</h1>
                    <p class="game-subtitle">滑动合并魔力水晶，合成"桃汽水の祝福"！</p>
                </div>
                
                <div class="game-stats">
                    <div class="stat-card">
                        <div class="stat-label">当前魔力</div>
                        <div class="stat-value" id="current-score">0</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-label">最高魔力</div>
                        <div class="stat-value" id="best-score">0</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-label">目标</div>
                        <div class="stat-value">🍑💖 2048</div>
                    </div>
                </div>
            </div>
            
            <div class="game-controls">
                <button class="btn btn-rainbow" id="new-game-btn">
                    <i class="fas fa-redo"></i> 重新开始
                </button>
                <button class="btn btn-secondary" id="how-to-play-btn">
                    <i class="fas fa-question-circle"></i> 游戏说明
                </button>
                <button class="btn btn-secondary" id="toggle-info-btn">
                    <i class="fas fa-info-circle"></i> 展开介绍
                </button>
            </div>
            
            <div class="game-message" id="game-message"></div>
            
            <div class="game-content">
                <div class="game-grid-section">
                    <div class="grid-container">
                        <div class="grid-background">
                            <div class="game-grid" id="game-grid"></div>
                        </div>
                    </div>
                    
                    <div class="virtual-controls-container" id="virtual-controls">
                        <!-- 虚拟控制将在这里加载 -->
                    </div>
                </div>
                
                <div class="game-info-section" id="game-info-section">
                    <div class="collapsible-panel active" id="rules-panel">
                        <div class="panel-header">
                            <h3><i class="fas fa-book"></i> 游戏规则</h3>
                            <button class="panel-toggle">
                                <i class="fas fa-chevron-up"></i>
                            </button>
                        </div>
                        <div class="panel-content">
                            <div class="rules-content">
                                <div class="rule-item">
                                    <div class="rule-icon">🎮</div>
                                    <div class="rule-text">
                                        <strong>控制方式：</strong>
                                        <p>电脑：使用方向键或WASD键移动</p>
                                        <p>手机：使用虚拟按键或滑动屏幕</p>
                                    </div>
                                </div>
                                
                                <div class="rule-item">
                                    <div class="rule-icon">✨</div>
                                    <div class="rule-text">
                                        <strong>合成规则：</strong>
                                        <p>相同等级的魔力水晶碰撞时会合成更高等级</p>
                                        <p>1 → 2 → 4 → 8 → 16 → 32 → 64 → 128 → 256 → 512 → 1024 → 2048</p>
                                    </div>
                                </div>
                                
                                <div class="rule-item">
                                    <div class="rule-icon">🏆</div>
                                    <div class="rule-text">
                                        <strong>得分规则：</strong>
                                        <p>每合成一次，获得与合成后等级相等的积分</p>
                                        <p>例如：合成128级，获得128积分</p>
                                    </div>
                                </div>
                                
                                <div class="rule-item">
                                    <div class="rule-icon">🎯</div>
                                    <div class="rule-text">
                                        <strong>游戏目标：</strong>
                                        <p>合成 🍑💖 桃汽水の祝福 (2048级)</p>
                                        <p>当棋盘填满且无法移动时，游戏结束</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="collapsible-panel active" id="levels-panel">
                        <div class="panel-header">
                            <h3><i class="fas fa-star"></i> 魔力等级</h3>
                            <button class="panel-toggle">
                                <i class="fas fa-chevron-up"></i>
                            </button>
                        </div>
                        <div class="panel-content">
                            <div class="levels-grid" id="levels-grid">
                                <!-- 等级列表将在这里动态生成 -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // 加载样式
    async loadStyles() {
        // 动态加载游戏样式
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = './scripts/game-magic-merge/game-styles.css';
        document.head.appendChild(link);
        
        // 等待样式加载完成
        return new Promise((resolve) => {
            link.onload = resolve;
            link.onerror = resolve; // 即使加载失败也继续
        });
    }
    
    // 初始化游戏引擎
    async initGameEngine() {
        try {
            const module = await import('./game-engine.js');
            this.engine = new module.default();
            
            // 初始化引擎
            this.engine.init(this.levelData);
            
            // 创建网格
            if (this.gridContainer) {
                this.engine.createGrid(this.gridContainer);
            }
            
            // 绑定引擎事件
            this.bindEngineEvents();
            
            // 加载最佳成绩
            this.loadBestScore();
            
        } catch (error) {
            console.error('游戏引擎加载失败:', error);
            throw error;
        }
    }
    
    // 初始化控制
    async initControls() {
        // 绑定键盘控制
        this.bindKeyboardControls();
        
        // 绑定触摸控制
        this.bindTouchControls();
        
        // 如果是移动端，初始化虚拟控制
        if (this.gameState.isMobile) {
            await this.initVirtualControls();
        }
    }
    
    // 初始化虚拟控制
    async initVirtualControls() {
        try {
            const module = await import('./virtual-controls.js');
            this.virtualControls = new module.default();
            
            const container = document.getElementById('virtual-controls');
            if (container) {
                this.virtualControls.init(container, {
                    onMove: this.handleMove,
                    onShow: () => console.log('虚拟控制显示'),
                    onHide: () => console.log('虚拟控制隐藏')
                });
            }
        } catch (error) {
            console.error('虚拟控制加载失败:', error);
            // 创建简易虚拟控制作为备用
            this.createFallbackControls();
        }
    }
    
    // 创建备用虚拟控制
    createFallbackControls() {
        const container = document.getElementById('virtual-controls');
        if (!container) return;
        
        container.innerHTML = `
            <div class="simple-virtual-controls">
                <div class="controls-row">
                    <button class="control-btn up-btn" data-direction="up">↑</button>
                </div>
                <div class="controls-row">
                    <button class="control-btn left-btn" data-direction="left">←</button>
                    <div class="control-center"></div>
                    <button class="control-btn right-btn" data-direction="right">→</button>
                </div>
                <div class="controls-row">
                    <button class="control-btn down-btn" data-direction="down">↓</button>
                </div>
            </div>
        `;
        
        // 绑定按钮事件
        const buttons = container.querySelectorAll('.control-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const direction = btn.dataset.direction;
                if (direction) {
                    this.handleMove(direction);
                }
            });
        });
    }
    
    // 绑定事件
    async bindEvents() {
        // 新游戏按钮
        const newGameBtn = document.getElementById('new-game-btn');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => this.startNewGame());
        }
        
        // 游戏说明按钮
        const howToPlayBtn = document.getElementById('how-to-play-btn');
        if (howToPlayBtn) {
            howToPlayBtn.addEventListener('click', () => this.showHowToPlayModal());
        }
        
        // 切换介绍面板按钮
        const toggleInfoBtn = document.getElementById('toggle-info-btn');
        if (toggleInfoBtn) {
            toggleInfoBtn.addEventListener('click', () => this.toggleInfoPanels());
        }
        
        // 折叠面板切换
        const panelToggles = this.container.querySelectorAll('.panel-toggle');
        panelToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                const panel = e.target.closest('.collapsible-panel');
                if (panel) {
                    this.togglePanel(panel);
                }
            });
        });
        
        // 窗口大小变化
        window.addEventListener('resize', () => this.handleResize());
    }
    
    // 绑定键盘控制
    bindKeyboardControls() {
        document.addEventListener('keydown', this.handleKeyDown);
    }
    
    // 绑定触摸控制
    bindTouchControls() {
        if (!this.gridContainer) return;
        
        this.gridContainer.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        this.gridContainer.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    }
    
    // 绑定引擎事件
    bindEngineEvents() {
        if (!this.engine) return;
        
        this.engine.on('scoreUpdated', (data) => this.handleScoreUpdate(data));
        this.engine.on('gameOver', () => this.handleGameOver());
        this.engine.on('gameWon', () => this.handleGameWon());
        this.engine.on('tileMerged', (data) => this.handleTileMerged(data));
    }
    
    // 键盘事件处理
    handleKeyDown(e) {
        if (this.gameState.gameOver || !this.gameState.isPlaying) return;
        
        let direction = null;
        switch(e.key) {
            case 'ArrowUp': case 'w': case 'W': direction = 'up'; break;
            case 'ArrowDown': case 's': case 'S': direction = 'down'; break;
            case 'ArrowLeft': case 'a': case 'A': direction = 'left'; break;
            case 'ArrowRight': case 'd': case 'D': direction = 'right'; break;
        }
        
        if (direction) {
            e.preventDefault();
            this.handleMove(direction);
        }
    }
    
    // 触摸事件处理
    handleTouchStart(e) {
        this.touchStart = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
            time: Date.now()
        };
        e.preventDefault();
    }
    
    handleTouchEnd(e) {
        if (!this.touchStart || !this.gameState.isPlaying) return;
        
        const touch = e.changedTouches[0];
        const dx = touch.clientX - this.touchStart.x;
        const dy = touch.clientY - this.touchStart.y;
        const dt = Date.now() - this.touchStart.time;
        
        // 防止误触，时间太短或移动距离太小不算
        if (dt < 100) return;
        
        const minDistance = 30;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            // 水平滑动
            if (Math.abs(dx) > minDistance) {
                this.handleMove(dx > 0 ? 'right' : 'left');
            }
        } else {
            // 垂直滑动
            if (Math.abs(dy) > minDistance) {
                this.handleMove(dy > 0 ? 'down' : 'up');
            }
        }
        
        this.touchStart = null;
        e.preventDefault();
    }
    
    // 移动处理
    handleMove(direction) {
        if (!this.gameState.isPlaying || this.gameState.gameOver) return;
        
        if (this.engine) {
            const moved = this.engine.move(direction);
            if (moved) {
                this.updateUI();
            }
        }
    }
    
    // 分数更新处理
    handleScoreUpdate(data) {
        const oldScore = this.gameState.score;
        this.gameState.score = data.score;
        
        // 更新最佳成绩
        if (this.gameState.score > this.gameState.bestScore) {
            this.gameState.bestScore = this.gameState.score;
            this.saveBestScore();
        }
        
        // 更新积分显示
        this.updateScoreDisplay();
        
        // 计算获得的积分
        const pointsEarned = this.gameState.score - oldScore;
        if (pointsEarned > 0) {
            this.awardPoints(pointsEarned);
        }
    }
    
    // 游戏结束处理
    handleGameOver() {
        this.gameState.gameOver = true;
        this.gameState.isPlaying = false;
        
        this.showMessage('游戏结束！棋盘已满，无法继续移动。', 'error');
        
        // 保存游戏成绩
        this.saveGameResult();
    }
    
    // 游戏胜利处理
    handleGameWon() {
        this.gameState.won = true;
        this.gameState.isPlaying = false;
        
        this.showMessage('🎉 恭喜！你成功合成了"桃汽水の祝福"！', 'success');
        
        // 保存游戏成绩
        this.saveGameResult();
    }
    
    // 方块合并处理
    handleTileMerged(data) {
        // 可以在这里添加合并特效
        console.log(`合并: ${data.fromValue} → ${data.toValue}`);
    }
    
    // 开始新游戏
    startNewGame() {
        if (this.engine) {
            this.engine.newGame();
            this.gameState.score = 0;
            this.gameState.gameOver = false;
            this.gameState.won = false;
            this.gameState.isPlaying = true;
            this.gameStartTime = Date.now();
            
            this.updateUI();
            this.hideMessage();
            
            console.log('新游戏开始');
        }
    }
    
    // 更新UI
    updateUI() {
        this.updateScoreDisplay();
        this.updateGridDisplay();
        this.updateLevelsDisplay();
    }
    
    // 更新分数显示
    updateScoreDisplay() {
        const scoreEl = document.getElementById('current-score');
        const bestScoreEl = document.getElementById('best-score');
        
        if (scoreEl) scoreEl.textContent = this.gameState.score;
        if (bestScoreEl) bestScoreEl.textContent = this.gameState.bestScore;
    }
    
    // 更新网格显示
    updateGridDisplay() {
        if (this.engine) {
            this.engine.updateGridDisplay();
        }
    }
    
    // 更新等级显示
    updateLevelsDisplay() {
        const levelsGrid = document.getElementById('levels-grid');
        if (!levelsGrid) return;
        
        let html = '';
        for (let value = 1; value <= 4096; value *= 2) {
            const data = this.levelData[value];
            if (data) {
                const achieved = this.engine && this.engine.hasAchieved(value);
                html += `
                    <div class="level-item ${achieved ? 'achieved' : ''}">
                        <div class="level-emoji">${data.emoji}</div>
                        <div class="level-info">
                            <div class="level-name">${data.name}</div>
                            <div class="level-value">${value}</div>
                        </div>
                    </div>
                `;
            }
        }
        
        levelsGrid.innerHTML = html;
    }
    
    // 显示消息
    showMessage(message, type = 'info') {
        const messageEl = document.getElementById('game-message');
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.className = `game-message ${type}`;
            messageEl.style.display = 'block';
            
            // 自动隐藏
            if (type !== 'error') {
                setTimeout(() => {
                    this.hideMessage();
                }, 3000);
            }
        }
    }
    
    // 隐藏消息
    hideMessage() {
        const messageEl = document.getElementById('game-message');
        if (messageEl) {
            messageEl.style.display = 'none';
        }
    }
    
    // 加载最佳成绩
    loadBestScore() {
        try {
            const saved = localStorage.getItem('taoci_magic_merge_best_score');
            if (saved) {
                this.gameState.bestScore = parseInt(saved) || 0;
                this.updateScoreDisplay();
            }
        } catch (error) {
            console.error('加载最佳成绩失败:', error);
        }
    }
    
    // 保存最佳成绩
    saveBestScore() {
        try {
            localStorage.setItem('taoci_magic_merge_best_score', this.gameState.bestScore.toString());
        } catch (error) {
            console.error('保存最佳成绩失败:', error);
        }
    }
    
    // 保存游戏结果
    async saveGameResult() {
        if (!this.gameState.isPlaying) return;
        
        const gameTime = this.gameStartTime ? Math.floor((Date.now() - this.gameStartTime) / 1000) : 0;
        
        try {
            // 使用现有的API接口保存分数
            if (window.TaociApi && window.TaociApi.submitGameScore) {
                const result = await window.TaociApi.submitGameScore(
                    'magic-merge',
                    this.gameState.score,
                    gameTime,
                    1
                );
                
                if (result && result.success) {
                    console.log('游戏成绩已保存到服务器');
                }
            }
        } catch (error) {
            console.error('保存游戏成绩失败:', error);
        }
    }
    
    // 奖励积分
    async awardPoints(points) {
        if (points <= 0) return;
        
        try {
            if (window.TaociApi && window.TaociApi.addPoints) {
                const result = await window.TaociApi.addPoints(
                    points,
                    '魔力合成游戏',
                    'magic-merge'
                );
                
                if (result && result.success) {
                    this.showPointsNotification(points);
                }
            }
        } catch (error) {
            console.error('奖励积分失败:', error);
        }
    }
    
    // 显示积分通知
    showPointsNotification(points) {
        const notification = document.createElement('div');
        notification.className = 'points-notification';
        notification.innerHTML = `+${points} ✨`;
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #ff6eff, #cc00ff);
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            font-size: 24px;
            font-weight: bold;
            z-index: 1000;
            animation: floatUp 1s ease-out forwards;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 1000);
    }
    
    // 显示游戏说明弹窗
    showHowToPlayModal() {
        const modal = document.createElement('div');
        modal.className = 'how-to-play-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🎮 魔力合成游戏说明</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="instruction-section">
                        <h4>🎯 游戏目标</h4>
                        <p>合成 <strong>🍑💖 桃汽水の祝福 (2048级)</strong> 的水晶</p>
                    </div>
                    
                    <div class="instruction-section">
                        <h4>🎮 控制方式</h4>
                        <p><strong>电脑玩家：</strong> 使用方向键 ← ↑ → ↓ 或 WASD 键移动</p>
                        <p><strong>手机玩家：</strong> 使用虚拟按键或滑动屏幕控制</p>
                    </div>
                    
                    <div class="instruction-section">
                        <h4>✨ 合成规则</h4>
                        <p>1. 相同等级的水晶碰撞时会合成更高一级</p>
                        <p>2. 每次移动后，空白位置会随机出现1级或2级水晶</p>
                        <p>3. 游戏没有时间限制，可以慢慢思考</p>
                    </div>
                    
                    <div class="instruction-section">
                        <h4>🏆 得分规则</h4>
                        <p>合成的水晶等级 = 获得的积分</p>
                        <p>例如：合成128级水晶，获得128积分</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary start-playing-btn">开始游戏</button>
                </div>
            </div>
        `;
        
        // 添加到页面
        document.body.appendChild(modal);
        
        // 绑定事件
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        const startBtn = modal.querySelector('.start-playing-btn');
        startBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
            this.startNewGame();
        });
        
        // 点击遮罩层关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
    
    // 切换信息面板
    toggleInfoPanels() {
        const infoSection = document.getElementById('game-info-section');
        const toggleBtn = document.getElementById('toggle-info-btn');
        
        if (infoSection && toggleBtn) {
            const isHidden = infoSection.style.display === 'none';
            
            if (isHidden) {
                infoSection.style.display = 'block';
                toggleBtn.innerHTML = '<i class="fas fa-info-circle"></i> 收起介绍';
            } else {
                infoSection.style.display = 'none';
                toggleBtn.innerHTML = '<i class="fas fa-info-circle"></i> 展开介绍';
            }
        }
    }
    
    // 切换单个面板
    togglePanel(panel) {
        const content = panel.querySelector('.panel-content');
        const toggleIcon = panel.querySelector('.panel-toggle i');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            toggleIcon.className = 'fas fa-chevron-up';
            panel.classList.add('active');
        } else {
            content.style.display = 'none';
            toggleIcon.className = 'fas fa-chevron-down';
            panel.classList.remove('active');
        }
    }
    
    // 添加返回按钮
    addBackButton() {
        const backBtn = document.createElement('button');
        backBtn.className = 'back-to-home-btn';
        backBtn.innerHTML = '<i class="fas fa-arrow-left"></i> 返回';
        
        backBtn.addEventListener('click', () => {
            if (this.context && this.context.app && this.context.app.navigate) {
                this.context.app.navigate('home');
            } else {
                window.location.reload();
            }
        });
        
        this.container.insertBefore(backBtn, this.container.firstChild);
    }
    
    // 处理窗口大小变化
    handleResize() {
        // 重新检测是否移动端
        this.gameState.isMobile = this.detectMobile();
        
        // 更新虚拟控制显示
        if (this.virtualControls) {
            const controlsContainer = document.getElementById('virtual-controls');
            if (controlsContainer) {
                if (this.gameState.isMobile) {
                    controlsContainer.style.display = 'block';
                } else {
                    controlsContainer.style.display = 'none';
                }
            }
        }
        
        // 通知游戏引擎
        if (this.engine && this.engine.handleResize) {
            this.engine.handleResize();
        }
    }
    
    // 检测移动端
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    // 设置加载管理器
    setupLoadingManager() {
        this.loadingManager = {
            update: (progress) => {
                this.gameState.loadingProgress = progress;
                const bar = document.getElementById('loading-progress-bar');
                const text = document.getElementById('loading-progress-text');
                
                if (bar) {
                    bar.style.width = `${progress}%`;
                }
                
                if (text) {
                    const messages = [
                        '正在准备魔法阵...',
                        '加载游戏资源...',
                        '初始化魔力水晶...',
                        '准备虚拟按键...',
                        '即将完成...'
                    ];
                    
                    const index = Math.floor(progress / 20);
                    if (messages[index]) {
                        text.textContent = messages[index];
                    }
                }
            },
            
            complete: () => {
                const loadingScreen = document.getElementById('game-loading');
                if (loadingScreen) {
                    loadingScreen.style.opacity = '0';
                    setTimeout(() => {
                        loadingScreen.style.display = 'none';
                    }, 300);
                }
            }
        };
    }
    
    // 清理资源
    destroy() {
        // 移除事件监听
        document.removeEventListener('keydown', this.handleKeyDown);
        
        // 清理游戏引擎
        if (this.engine) {
            this.engine.destroy();
            this.engine = null;
        }
        
        // 清理虚拟控制
        if (this.virtualControls) {
            this.virtualControls.destroy();
            this.virtualControls = null;
        }
        
        // 移除容器
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        
        console.log('🎮 游戏模块已清理');
    }
}