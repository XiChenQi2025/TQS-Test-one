// 魔力合成游戏模块 - 稳定加载版
export default class MagicMergeModule {
    constructor() {
        this.name = 'magic-merge';
        this.version = '1.0.0';
        
        // 游戏状态
        this.gameState = {
            score: 0,
            bestScore: 0,
            grid: [],
            gameOver: false,
            won: false,
            isMobile: false,
            isPlaying: false,
            gameStartTime: null
        };
        
        // 等级数据
        this.levelData = {
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
            2048: { emoji: '🍑💖', name: '桃汽水の祝福' }
        };
        
        // DOM引用
        this.container = null;
        this.gridContainer = null;
        this.loadingProgress = null;
        this.loadingBar = null;
        
        // 游戏参数
        this.gridSize = 4;
        this.listeners = {};
    }
    
    async init(context) {
        console.log('🎮 开始加载魔力合成游戏...');
        
        this.context = context;
        
        try {
            // 1. 创建基础UI并显示加载界面
            await this.showLoadingScreen();
            
            // 2. 检测设备类型
            this.detectDeviceType();
            
            // 3. 创建游戏主界面
            await this.createGameUI();
            
            // 4. 初始化游戏逻辑
            await this.initGameLogic();
            
            // 5. 绑定事件
            this.bindAllEvents();
            
            // 6. 加载保存的状态
            this.loadSavedState();
            
            // 7. 隐藏加载界面，显示游戏
            this.hideLoadingScreen();
            
            console.log('✅ 游戏加载完成');
            
        } catch (error) {
            console.error('❌ 游戏加载失败:', error);
            this.showError('游戏加载失败: ' + error.message);
        }
    }
    
    // 显示加载界面
    async showLoadingScreen() {
        return new Promise((resolve) => {
            const appContainer = document.getElementById('app-container');
            if (!appContainer) {
                resolve();
                return;
            }
            
            appContainer.innerHTML = `
                <div class="game-loading-screen" style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(135deg, rgba(255,110,255,0.1), rgba(178,110,255,0.2));
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    backdrop-filter: blur(10px);
                ">
                    <div class="loading-content" style="
                        text-align: center;
                        max-width: 400px;
                        padding: 30px;
                        background: rgba(255,255,255,0.15);
                        border-radius: 20px;
                        border: 2px solid rgba(255,110,255,0.3);
                        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                    ">
                        <div class="loading-icon" style="
                            font-size: 4rem;
                            margin-bottom: 20px;
                            animation: pulse 1.5s infinite;
                        ">
                            🎮
                        </div>
                        
                        <h2 style="
                            color: white;
                            margin-bottom: 10px;
                            font-size: 1.8rem;
                        ">加载魔力合成游戏...</h2>
                        
                        <p style="
                            color: rgba(255,255,255,0.8);
                            margin-bottom: 25px;
                            font-size: 1rem;
                        ">精灵公主正在准备游戏魔法~</p>
                        
                        <div class="progress-container" style="
                            width: 100%;
                            background: rgba(255,255,255,0.1);
                            height: 12px;
                            border-radius: 6px;
                            overflow: hidden;
                            margin-bottom: 15px;
                        ">
                            <div class="progress-bar" style="
                                width: 0%;
                                height: 100%;
                                background: linear-gradient(90deg, 
                                    var(--color-primary), 
                                    var(--color-accent-purple));
                                transition: width 0.3s ease;
                                border-radius: 6px;
                            "></div>
                        </div>
                        
                        <div class="progress-text" style="
                            color: rgba(255,255,255,0.8);
                            font-size: 0.9rem;
                        ">0%</div>
                    </div>
                </div>
            `;
            
            this.loadingProgress = document.querySelector('.progress-text');
            this.loadingBar = document.querySelector('.progress-bar');
            
            // 添加CSS动画
            const style = document.createElement('style');
            style.textContent = `
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
            
            // 开始加载动画
            this.updateProgress(10, '正在检测设备...');
            setTimeout(() => resolve(), 100);
        });
    }
    
    // 更新加载进度
    updateProgress(percent, message = '') {
        if (this.loadingBar) {
            this.loadingBar.style.width = percent + '%';
        }
        if (this.loadingProgress) {
            this.loadingProgress.textContent = `${percent}% ${message ? ' - ' + message : ''}`;
        }
    }
    
    // 检测设备类型
    detectDeviceType() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.gameState.isMobile = isMobile || window.innerWidth <= 768;
        this.updateProgress(20, this.gameState.isMobile ? '移动端检测' : '桌面端检测');
    }
    
    // 创建游戏主界面
    async createGameUI() {
        this.updateProgress(30, '正在创建游戏界面...');
        
        const appContainer = document.getElementById('app-container');
        if (!appContainer) return;
        
        // 创建游戏容器
        this.container = document.createElement('div');
        this.container.className = 'magic-merge-game';
        this.container.innerHTML = this.getGameHTML();
        
        // 添加返回按钮
        this.addBackButton();
        
        // 添加到页面
        appContainer.innerHTML = '';
        appContainer.appendChild(this.container);
        
        // 获取DOM元素引用
        this.gridContainer = document.getElementById('game-grid');
        this.scoreEl = document.getElementById('current-score');
        this.bestScoreEl = document.getElementById('best-score');
        
        this.updateProgress(50, '界面创建完成');
    }
    
    // 获取游戏HTML
    getGameHTML() {
        return `
            <div class="game-header">
                <div class="game-title">
                    <h1>🍑 桃汽水的魔力合成</h1>
                    <p class="game-subtitle">滑动合并相同等级的魔力水晶，合成"桃汽水の祝福"！</p>
                </div>
                
                <div class="game-stats">
                    <div class="stat-card">
                        <div class="stat-label">当前分数</div>
                        <div class="stat-value score-display" id="current-score">0</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-label">最高分数</div>
                        <div class="stat-value best-score-display" id="best-score">0</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-label">目标</div>
                        <div class="stat-value">${this.levelData[2048].emoji} 2048</div>
                    </div>
                </div>
            </div>
            
            <div class="game-controls">
                <button class="btn btn-rainbow" id="new-game-btn">
                    <i class="fas fa-magic"></i> 新的游戏
                </button>
                <button class="btn btn-secondary" id="how-to-play-btn">
                    <i class="fas fa-question-circle"></i> 游戏说明
                </button>
                <button class="btn btn-secondary" id="undo-btn" disabled>
                    <i class="fas fa-undo"></i> 撤销一步
                </button>
            </div>
            
            <div class="game-message" id="game-message"></div>
            
            <div class="game-grid-container">
                <div class="grid-background">
                    <div class="grid" id="game-grid"></div>
                </div>
            </div>
            
            ${this.gameState.isMobile ? `
                <div class="virtual-controls-container" id="virtual-controls">
                    <div class="virtual-controls">
                        <div class="controls-row">
                            <button class="control-btn btn-up" data-direction="up">
                                <i class="fas fa-arrow-up"></i>
                            </button>
                        </div>
                        <div class="controls-row">
                            <button class="control-btn btn-left" data-direction="left">
                                <i class="fas fa-arrow-left"></i>
                            </button>
                            <div class="control-center">
                                <button class="control-btn btn-center" id="center-btn">
                                    <i class="fas fa-hand-pointer"></i>
                                </button>
                            </div>
                            <button class="control-btn btn-right" data-direction="right">
                                <i class="fas fa-arrow-right"></i>
                            </button>
                        </div>
                        <div class="controls-row">
                            <button class="control-btn btn-down" data-direction="down">
                                <i class="fas fa-arrow-down"></i>
                            </button>
                        </div>
                    </div>
                </div>
            ` : ''}
            
            <div class="game-info-section">
                <div class="rules-card">
                    <h3 class="rules-title">
                        <i class="fas fa-book"></i> 游戏规则
                        <i class="fas fa-chevron-down"></i>
                    </h3>
                    <div class="rules-content">
                        <p>1. 使用 <strong>方向键</strong>（电脑）或 <strong>虚拟按键</strong>（手机）移动魔力水晶</p>
                        <p>2. 相同等级的魔力水晶碰撞时会 <strong>合成更高级的水晶</strong></p>
                        <p>3. 每次移动后会在空白位置生成新的1级或2级水晶</p>
                        <p>4. 目标是合成 <strong>${this.levelData[2048].emoji} 桃汽水の祝福 (2048)</strong></p>
                        <p>5. 当棋盘填满且无法移动时，游戏结束</p>
                        <p>6. 每次合并获得的积分等于合并后水晶的等级（1:1）</p>
                    </div>
                </div>
                
                <div class="levels-card">
                    <h3><i class="fas fa-star"></i> 魔力等级</h3>
                    <div class="levels-grid" id="levels-grid"></div>
                </div>
            </div>
        `;
    }
    
    // 初始化游戏逻辑
    async initGameLogic() {
        this.updateProgress(60, '正在初始化游戏逻辑...');
        
        // 初始化网格
        this.initGrid();
        
        // 初始化等级显示
        this.initLevelsDisplay();
        
        // 初始化虚拟控制
        if (this.gameState.isMobile) {
            this.initVirtualControls();
        }
        
        this.updateProgress(80, '游戏逻辑初始化完成');
    }
    
    // 初始化网格
    initGrid() {
        if (!this.gridContainer) return;
        
        // 清空网格
        this.gridContainer.innerHTML = '';
        
        // 创建4x4网格
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                this.gridContainer.appendChild(cell);
            }
        }
        
        // 初始化游戏状态
        this.resetGame();
    }
    
    // 重置游戏
    resetGame() {
        this.gameState.grid = this.createEmptyGrid();
        this.gameState.score = 0;
        this.gameState.moves = 0;
        this.gameState.gameOver = false;
        this.gameState.won = false;
        this.gameState.history = [];
        
        // 添加初始方块
        this.addRandomTile();
        this.addRandomTile();
        
        // 更新显示
        this.updateGridDisplay();
        this.updateScoreDisplay();
    }
    
    // 创建空网格
    createEmptyGrid() {
        const grid = [];
        for (let i = 0; i < this.gridSize; i++) {
            grid[i] = [];
            for (let j = 0; j < this.gridSize; j++) {
                grid[i][j] = 0;
            }
        }
        return grid;
    }
    
    // 添加随机方块
    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.gameState.grid[i][j] === 0) {
                    emptyCells.push({ row: i, col: j });
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            // 90%概率生成1，10%概率生成2
            this.gameState.grid[row][col] = Math.random() < 0.9 ? 1 : 2;
            return true;
        }
        return false;
    }
    
    // 更新网格显示
    updateGridDisplay() {
        if (!this.gridContainer) return;
        
        const cells = this.gridContainer.querySelectorAll('.grid-cell');
        cells.forEach((cell, index) => {
            const row = Math.floor(index / this.gridSize);
            const col = index % this.gridSize;
            const value = this.gameState.grid[row][col];
            
            cell.innerHTML = '';
            cell.className = 'grid-cell';
            
            if (value > 0) {
                const tile = document.createElement('div');
                tile.className = `grid-tile tile-${value}`;
                tile.textContent = this.levelData[value]?.emoji || value;
                tile.title = `${this.levelData[value]?.name || '未知'} (${value})`;
                tile.dataset.value = value;
                
                // 确保居中
                tile.style.display = 'flex';
                tile.style.alignItems = 'center';
                tile.style.justifyContent = 'center';
                
                // 添加等级显示
                const levelText = document.createElement('div');
                levelText.className = 'tile-level';
                levelText.textContent = value;
                tile.appendChild(levelText);
                
                cell.appendChild(tile);
            }
        });
    }
    
    // 更新分数显示
    updateScoreDisplay() {
        if (this.scoreEl) {
            this.scoreEl.textContent = this.gameState.score;
        }
        if (this.bestScoreEl) {
            this.bestScoreEl.textContent = this.gameState.bestScore;
        }
    }
    
    // 初始化等级显示
    initLevelsDisplay() {
        const levelsGrid = document.getElementById('levels-grid');
        if (!levelsGrid) return;
        
        levelsGrid.innerHTML = '';
        
        for (const [value, data] of Object.entries(this.levelData)) {
            const numValue = parseInt(value);
            if (numValue <= 2048) {
                const levelItem = document.createElement('div');
                levelItem.className = 'level-item';
                levelItem.innerHTML = `
                    <div class="level-emoji">${data.emoji}</div>
                    <div class="level-info">
                        <div class="level-name">${data.name}</div>
                        <div class="level-value">${value}</div>
                    </div>
                `;
                levelsGrid.appendChild(levelItem);
            }
        }
    }
    
    // 初始化虚拟控制
    initVirtualControls() {
        const container = document.getElementById('virtual-controls');
        if (!container) return;
        
        const buttons = container.querySelectorAll('.control-btn[data-direction]');
        buttons.forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const direction = btn.dataset.direction;
                this.handleMove(direction);
                btn.classList.add('pressed');
            });
            
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                btn.classList.remove('pressed');
            });
            
            // 鼠标支持（用于测试）
            btn.addEventListener('mousedown', (e) => {
                e.preventDefault();
                const direction = btn.dataset.direction;
                this.handleMove(direction);
                btn.classList.add('pressed');
            });
            
            btn.addEventListener('mouseup', (e) => {
                e.preventDefault();
                btn.classList.remove('pressed');
            });
        });
        
        // 中心按钮帮助
        const centerBtn = document.getElementById('center-btn');
        if (centerBtn) {
            centerBtn.addEventListener('click', () => {
                this.showMessage('使用方向键或滑动屏幕移动方块', 'info');
            });
        }
    }
    
    // 绑定所有事件
    bindAllEvents() {
        this.updateProgress(90, '正在绑定事件...');
        
        // 新游戏按钮
        const newGameBtn = document.getElementById('new-game-btn');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => {
                this.startNewGame();
            });
        }
        
        // 游戏说明按钮
        const howToPlayBtn = document.getElementById('how-to-play-btn');
        if (howToPlayBtn) {
            howToPlayBtn.addEventListener('click', () => {
                this.showHowToPlay();
            });
        }
        
        // 撤销按钮
        const undoBtn = document.getElementById('undo-btn');
        if (undoBtn) {
            undoBtn.addEventListener('click', () => {
                this.undoMove();
            });
        }
        
        // 游戏规则展开/收起
        const rulesTitle = document.querySelector('.rules-title');
        if (rulesTitle) {
            rulesTitle.addEventListener('click', () => {
                const rulesCard = rulesTitle.closest('.rules-card');
                rulesCard.classList.toggle('expanded');
                
                const icon = rulesTitle.querySelector('.fa-chevron-down');
                if (icon) {
                    icon.style.transform = rulesCard.classList.contains('expanded') ? 'rotate(180deg)' : 'rotate(0deg)';
                }
            });
        }
        
        // 键盘控制（桌面端）
        if (!this.gameState.isMobile) {
            document.addEventListener('keydown', (e) => {
                if (this.gameState.gameOver || !this.gameState.isPlaying) return;
                
                let direction = null;
                switch(e.key) {
                    case 'ArrowUp':
                    case 'w':
                    case 'W':
                        direction = 'up';
                        break;
                    case 'ArrowDown':
                    case 's':
                    case 'S':
                        direction = 'down';
                        break;
                    case 'ArrowLeft':
                    case 'a':
                    case 'A':
                        direction = 'left';
                        break;
                    case 'ArrowRight':
                    case 'd':
                    case 'D':
                        direction = 'right';
                        break;
                }
                
                if (direction) {
                    e.preventDefault();
                    this.handleMove(direction);
                }
            });
        }
        
        // 触摸滑动（移动端）
        if (this.gameState.isMobile && this.gridContainer) {
            this.setupTouchControls();
        }
        
        this.updateProgress(95, '事件绑定完成');
    }
    
    // 设置触摸控制
    setupTouchControls() {
        let touchStartX, touchStartY;
        
        this.gridContainer.addEventListener('touchstart', (e) => {
            if (!this.gameState.isPlaying) return;
            
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            e.preventDefault();
        }, { passive: false });
        
        this.gridContainer.addEventListener('touchend', (e) => {
            if (!this.gameState.isPlaying || !touchStartX || !touchStartY) return;
            
            const touch = e.changedTouches[0];
            const dx = touch.clientX - touchStartX;
            const dy = touch.clientY - touchStartY;
            
            // 最小滑动距离
            const minSwipeDistance = 30;
            
            if (Math.abs(dx) > Math.abs(dy)) {
                // 水平滑动
                if (Math.abs(dx) > minSwipeDistance) {
                    if (dx > 0) {
                        this.handleMove('right');
                    } else {
                        this.handleMove('left');
                    }
                }
            } else {
                // 垂直滑动
                if (Math.abs(dy) > minSwipeDistance) {
                    if (dy > 0) {
                        this.handleMove('down');
                    } else {
                        this.handleMove('up');
                    }
                }
            }
            
            touchStartX = null;
            touchStartY = null;
            e.preventDefault();
        }, { passive: false });
    }
    
    // 开始新游戏
    startNewGame() {
        // 保存历史状态（用于撤销）
        this.saveState();
        
        // 重置游戏
        this.resetGame();
        
        this.gameState.isPlaying = true;
        this.gameState.gameStartTime = Date.now();
        
        // 更新按钮状态
        this.updateUndoButton();
        
        this.showMessage('游戏开始！滑动或使用方向键移动方块', 'success');
    }
    
    // 处理移动
    handleMove(direction) {
        if (!this.gameState.isPlaying || this.gameState.gameOver) return;
        
        // 保存当前状态（用于撤销）
        this.saveState();
        
        let moved = false;
        const oldScore = this.gameState.score;
        
        switch(direction) {
            case 'up':
                moved = this.moveUp();
                break;
            case 'down':
                moved = this.moveDown();
                break;
            case 'left':
                moved = this.moveLeft();
                break;
            case 'right':
                moved = this.moveRight();
                break;
        }
        
        if (moved) {
            this.gameState.moves++;
            this.addRandomTile();
            
            // 检查游戏状态
            this.checkGameOver();
            this.checkGameWon();
            
            // 更新显示
            this.updateGridDisplay();
            this.updateScoreDisplay();
            this.updateUndoButton();
            
            // 计算获得的积分
            const pointsEarned = this.gameState.score - oldScore;
            if (pointsEarned > 0) {
                this.awardPoints(pointsEarned);
                
                // 显示积分获得提示
                this.showPointsNotification(pointsEarned);
            }
        }
    }
    
    // 向上移动
    moveUp() {
        let moved = false;
        
        for (let col = 0; col < this.gridSize; col++) {
            const column = [];
            for (let row = 0; row < this.gridSize; row++) {
                column.push(this.gameState.grid[row][col]);
            }
            
            const newColumn = this.slideAndMerge(column);
            
            for (let row = 0; row < this.gridSize; row++) {
                if (this.gameState.grid[row][col] !== newColumn[row]) {
                    moved = true;
                }
                this.gameState.grid[row][col] = newColumn[row];
            }
        }
        
        return moved;
    }
    
    // 向下移动
    moveDown() {
        let moved = false;
        
        for (let col = 0; col < this.gridSize; col++) {
            const column = [];
            for (let row = this.gridSize - 1; row >= 0; row--) {
                column.push(this.gameState.grid[row][col]);
            }
            
            const newColumn = this.slideAndMerge(column);
            
            for (let row = this.gridSize - 1; row >= 0; row--) {
                const newValue = newColumn[this.gridSize - 1 - row];
                if (this.gameState.grid[row][col] !== newValue) {
                    moved = true;
                }
                this.gameState.grid[row][col] = newValue;
            }
        }
        
        return moved;
    }
    
    // 向左移动
    moveLeft() {
        let moved = false;
        
        for (let row = 0; row < this.gridSize; row++) {
            const newRow = this.slideAndMerge(this.gameState.grid[row]);
            
            for (let col = 0; col < this.gridSize; col++) {
                if (this.gameState.grid[row][col] !== newRow[col]) {
                    moved = true;
                }
                this.gameState.grid[row][col] = newRow[col];
            }
        }
        
        return moved;
    }
    
    // 向右移动
    moveRight() {
        let moved = false;
        
        for (let row = 0; row < this.gridSize; row++) {
            const reversedRow = [...this.gameState.grid[row]].reverse();
            const newReversedRow = this.slideAndMerge(reversedRow);
            const newRow = newReversedRow.reverse();
            
            for (let col = 0; col < this.gridSize; col++) {
                if (this.gameState.grid[row][col] !== newRow[col]) {
                    moved = true;
                }
                this.gameState.grid[row][col] = newRow[col];
            }
        }
        
        return moved;
    }
    
    // 滑动并合并
    slideAndMerge(line) {
        // 移除0
        let filtered = line.filter(val => val > 0);
        const result = [];
        let merged = false;
        
        for (let i = 0; i < filtered.length; i++) {
            if (merged) {
                merged = false;
                continue;
            }
            
            if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
                // 合并相同值
                const newValue = filtered[i] * 2;
                result.push(newValue);
                
                // 计算得分
                const pointsEarned = newValue;
                this.gameState.score += pointsEarned;
                
                merged = true;
            } else {
                result.push(filtered[i]);
            }
        }
        
        // 填充0
        while (result.length < this.gridSize) {
            result.push(0);
        }
        
        return result;
    }
    
    // 检查游戏是否结束
    checkGameOver() {
        // 检查是否有空位
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.gameState.grid[i][j] === 0) {
                    return false;
                }
            }
        }
        
        // 检查是否还有可合并的相邻格子
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const current = this.gameState.grid[i][j];
                
                // 检查右边
                if (j < this.gridSize - 1 && current === this.gameState.grid[i][j + 1]) {
                    return false;
                }
                
                // 检查下边
                if (i < this.gridSize - 1 && current === this.gameState.grid[i + 1][j]) {
                    return false;
                }
            }
        }
        
        this.gameState.gameOver = true;
        this.gameState.isPlaying = false;
        
        // 保存最高分
        if (this.gameState.score > this.gameState.bestScore) {
            this.gameState.bestScore = this.gameState.score;
            this.saveGameState();
        }
        
        this.showMessage('游戏结束！棋盘已满，无法继续移动。', 'error');
        
        return true;
    }
    
    // 检查游戏是否胜利
    checkGameWon() {
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.gameState.grid[i][j] >= 2048) {
                    this.gameState.won = true;
                    this.gameState.isPlaying = false;
                    
                    // 保存最高分
                    if (this.gameState.score > this.gameState.bestScore) {
                        this.gameState.bestScore = this.gameState.score;
                        this.saveGameState();
                    }
                    
                    this.showMessage(`🎉 恭喜！你成功合成了${this.levelData[2048].emoji}桃汽水の祝福！`, 'success');
                    
                    return true;
                }
            }
        }
        return false;
    }
    
    // 撤销移动
    undoMove() {
        if (!this.gameState.history || this.gameState.history.length === 0) {
            this.showMessage('没有可撤销的操作', 'info');
            return false;
        }
        
        const state = this.gameState.history.pop();
        this.gameState.grid = state.grid;
        this.gameState.score = state.score;
        this.gameState.moves = state.moves;
        this.gameState.gameOver = state.gameOver;
        this.gameState.won = state.won;
        
        // 更新显示
        this.updateGridDisplay();
        this.updateScoreDisplay();
        this.updateUndoButton();
        
        this.showMessage('已撤销上一步操作', 'info');
        
        return true;
    }
    
    // 更新撤销按钮状态
    updateUndoButton() {
        const undoBtn = document.getElementById('undo-btn');
        if (undoBtn) {
            undoBtn.disabled = !this.gameState.history || this.gameState.history.length === 0;
        }
    }
    
    // 保存状态
    saveState() {
        if (!this.gameState.history) {
            this.gameState.history = [];
        }
        
        // 深拷贝网格
        const gridCopy = this.gameState.grid.map(row => [...row]);
        
        this.gameState.history.push({
            grid: gridCopy,
            score: this.gameState.score,
            moves: this.gameState.moves,
            gameOver: this.gameState.gameOver,
            won: this.gameState.won,
            timestamp: Date.now()
        });
        
        // 限制历史记录数量
        if (this.gameState.history.length > 10) {
            this.gameState.history.shift();
        }
    }
    
    // 添加积分
    async awardPoints(points) {
        try {
            if (window.TaociApi && window.TaociApi.addPoints) {
                const result = await window.TaociApi.addPoints(
                    points,
                    '魔力合成游戏',
                    'magic-merge'
                );
                
                if (result && result.success) {
                    console.log(`🎮 获得${points}点魔力积分`);
                    return true;
                }
            }
        } catch (error) {
            console.warn('积分保存失败:', error);
        }
        
        // 本地保存
        this.saveLocalPoints(points);
        return false;
    }
    
    // 本地保存积分
    saveLocalPoints(points) {
        try {
            const localKey = 'taoci_magic_merge_local_points';
            const current = parseInt(localStorage.getItem(localKey) || '0');
            localStorage.setItem(localKey, (current + points).toString());
        } catch (error) {
            console.error('本地积分保存失败:', error);
        }
    }
    
    // 保存游戏状态
    saveGameState() {
        try {
            localStorage.setItem('taoci_magic_merge_state', JSON.stringify({
                bestScore: this.gameState.bestScore,
                lastPlayed: Date.now(),
                version: this.version
            }));
        } catch (error) {
            console.error('保存游戏状态失败:', error);
        }
    }
    
    // 加载保存的状态
    loadSavedState() {
        try {
            const saved = localStorage.getItem('taoci_magic_merge_state');
            if (saved) {
                const state = JSON.parse(saved);
                this.gameState.bestScore = state.bestScore || 0;
                this.updateScoreDisplay();
            }
        } catch (error) {
            console.error('加载游戏状态失败:', error);
        }
    }
    
    // 隐藏加载界面
    hideLoadingScreen() {
        this.updateProgress(100, '游戏准备就绪！');
        
        setTimeout(() => {
            const loadingScreen = document.querySelector('.game-loading-screen');
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                loadingScreen.style.transition = 'opacity 0.5s ease';
                
                setTimeout(() => {
                    if (loadingScreen.parentNode) {
                        loadingScreen.parentNode.removeChild(loadingScreen);
                    }
                    
                    // 显示欢迎消息
                    this.showMessage('欢迎来到魔力合成游戏！点击"新的游戏"开始', 'success');
                }, 500);
            }
        }, 500);
    }
    
    // 显示消息
    showMessage(message, type = 'info') {
        const messageEl = document.getElementById('game-message');
        if (!messageEl) return;
        
        messageEl.textContent = message;
        messageEl.className = `game-message ${type}`;
        messageEl.style.display = 'block';
        
        if (type !== 'error') {
            setTimeout(() => {
                messageEl.style.display = 'none';
            }, 3000);
        }
    }
    
    // 显示积分通知
    showPointsNotification(points) {
        const notification = document.createElement('div');
        notification.className = 'points-notification';
        notification.innerHTML = `+${points} <i class="fas fa-star"></i>`;
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, var(--color-primary), var(--color-accent-yellow));
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            font-size: 24px;
            font-weight: bold;
            z-index: 1000;
            animation: floatUp 1s ease-out forwards;
            box-shadow: 0 5px 20px rgba(255, 110, 255, 0.5);
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 1000);
    }
    
    // 显示游戏说明
    showHowToPlay() {
        const modalHtml = `
            <div class="how-to-play-modal">
                <div class="modal-header">
                    <h3>🎮 魔力合成游戏说明</h3>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-content">
                    <h4>基本玩法：</h4>
                    <p>1. 使用方向键（电脑）或虚拟按键/滑动（手机）移动魔力水晶</p>
                    <p>2. 相同等级的魔力水晶碰撞时会合成更高级的水晶</p>
                    <p>3. 每次移动后会在空白位置生成新的1级或2级水晶</p>
                    
                    <h4>魔力等级：</h4>
                    <p>${this.levelData[1].emoji} 1 → ${this.levelData[2].emoji} 2 → ${this.levelData[4].emoji} 4 → ... → ${this.levelData[2048].emoji} 2048</p>
                    
                    <h4>积分规则：</h4>
                    <p>每合成一次，获得与合成后水晶等级相等的积分（1:1）</p>
                    <p>例如：合成128级水晶，获得128积分</p>
                    
                    <h4>游戏目标：</h4>
                    <p>合成 ${this.levelData[2048].emoji} 桃汽水の祝福 (2048级)</p>
                </div>
                <button class="btn btn-primary close-modal">明白了</button>
            </div>
        `;
        
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = modalHtml;
        
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            padding: 20px;
        `;
        
        document.body.appendChild(overlay);
        
        // 绑定关闭事件
        const closeBtn = overlay.querySelector('.close-modal');
        const modalClose = overlay.querySelector('.modal-close');
        
        const closeModal = () => {
            overlay.style.opacity = '0';
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 300);
        };
        
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (modalClose) modalClose.addEventListener('click', closeModal);
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
        
        // ESC键关闭
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
    }
    
    // 添加返回按钮
    addBackButton() {
        const backBtn = document.createElement('button');
        backBtn.className = 'back-to-home-btn';
        backBtn.innerHTML = '<i class="fas fa-arrow-left"></i> 返回首页';
        backBtn.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 1000;
            background: rgba(255, 110, 255, 0.95);
            color: white;
            border: none;
            border-radius: 20px;
            padding: 10px 20px;
            cursor: pointer;
            font-size: 14px;
            box-shadow: var(--glow-shadow);
            transition: all 0.3s ease;
        `;
        
        backBtn.addEventListener('click', () => {
            if (this.context.app && this.context.app.navigate) {
                this.context.app.navigate('home');
            }
        });
        
        document.body.appendChild(backBtn);
    }
    
    // 显示错误
    showError(message) {
        const appContainer = document.getElementById('app-container');
        if (!appContainer) return;
        
        appContainer.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                text-align: center;
                padding: 20px;
                color: white;
            ">
                <div style="font-size: 3rem; margin-bottom: 20px;">⚠️</div>
                <h2 style="margin-bottom: 15px;">游戏加载失败</h2>
                <p style="margin-bottom: 25px; opacity: 0.8;">${message}</p>
                <button onclick="location.reload()" style="
                    background: var(--color-primary);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 20px;
                    cursor: pointer;
                    font-size: 16px;
                ">
                    重新加载
                </button>
            </div>
        `;
    }
    
    // 清理
    destroy() {
        // 清理事件监听
        document.removeEventListener('keydown', this.handleKeyDown);
        
        // 清理返回按钮
        const backBtn = document.querySelector('.back-to-home-btn');
        if (backBtn && backBtn.parentNode) {
            backBtn.parentNode.removeChild(backBtn);
        }
        
        console.log(`🗑️ ${this.name} 模块已清理`);
    }
}