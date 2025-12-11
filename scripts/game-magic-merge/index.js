/**
 * 魔力合成游戏主模块 - 优化版
 * 集成彩虹进度条，添加游戏蒙版，优化虚拟按键
 */
import { createRainbowLoadingBar } from '../../core/loading-bar.js';

export default class MagicMergeGame {
    constructor() {
        this.name = 'magic-merge';
        this.version = '3.0.0';
        
        // 游戏状态
        this.state = {
            isPlaying: false,
            isMobile: false,
            isInitialized: false,      // 游戏是否已初始化
            hasStarted: false,         // 游戏是否已开始
            showVirtualControls: false,
            showHelp: true,           // 默认显示帮助
            score: 0,
            bestScore: 0,
            moves: 0,
            swipeEnabled: true        // 默认启用滑动操作
        };
        
        // 等级数据
        this.levels = {
            1: { emoji: '✨', name: '微弱魔力', color: 'rgba(255, 204, 255, 0.9)' },
            2: { emoji: '🌟', name: '初级魔力', color: 'rgba(255, 204, 0, 0.9)' },
            4: { emoji: '💫', name: '中级魔力', color: 'rgba(0, 204, 255, 0.9)' },
            8: { emoji: '🔮', name: '高级魔力', color: 'rgba(255, 102, 204, 0.9)' },
            16: { emoji: '🧙‍♀️', name: '魔法师魔力', color: 'rgba(153, 102, 255, 0.9)' },
            32: { emoji: '🧚', name: '精灵魔力', color: 'rgba(0, 255, 153, 0.9)' },
            64: { emoji: '👑', name: '公主魔力', color: 'rgba(255, 102, 102, 0.9)' },
            128: { emoji: '📜', name: '契约魔力', color: 'rgba(255, 204, 102, 0.9)' },
            256: { emoji: '🌌', name: '异界魔力', color: 'rgba(204, 102, 255, 0.9)' },
            512: { emoji: '👑✨', name: '至尊魔力', color: 'rgba(102, 255, 255, 0.9)' },
            1024: { emoji: '🏆', name: '传说魔力', color: 'rgba(255, 255, 102, 0.9)' },
            2048: { emoji: '🍑💖', name: '桃汽水の祝福', color: 'rgba(255, 102, 255, 0.9)' }
        };
        
        // 创建彩虹进度条实例
        this.loadingBar = createRainbowLoadingBar({
            position: 'floating',
            theme: 'rainbow-glitter',
            animation: 'flow',
            showParticles: true,
            particleCount: 12,
            colors: [
                '#FF6EFF', '#FF5E7D', '#FFEE58', '#6EFF7A',
                '#5ED1FF', '#B26EFF', '#FFA75E', '#FF8EAF'
            ]
        });
        
        // DOM引用
        this.elements = {
            container: null,
            gameContainer: null,
            grid: null,
            scoreDisplay: null,
            bestScoreDisplay: null,
            startButton: null,
            virtualControls: null,
            helpSection: null,
            gridMask: null,           // 网格蒙版
            gridCells: []             // 所有网格单元格
        };
        
        // 组件实例
        this.gameEngine = null;
        this.virtualJoystick = null;
        
        // 绑定方法
        this.handleMove = this.handleMove.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.startGame = this.startGame.bind(this);
    }
    
    /**
     * 初始化模块
     */
    async init(context) {
        this.context = context;
        
        try {
            // 显示彩虹进度条
            this.loadingBar.show('正在打开魔力合成游戏...');
            this.loadingBar.simulateNetworkRequest(1500);
            
            // 1. 检测设备类型
            this.state.isMobile = this.detectMobile();
            
            // 2. 创建游戏容器
            await this.createGameContainer();
            
            // 3. 初始化游戏引擎（但不显示格子内容）
            await this.initGameEngine();
            
            // 4. 初始化虚拟控制
            if (this.state.isMobile) {
                await this.initVirtualControls();
            }
            
            // 5. 初始化事件监听
            this.initEventListeners();
            
            // 6. 加载游戏状态
            this.loadGameState();
            
            // 7. 添加网格蒙版（初次进入时）
            this.addGridMask();
            
            // 8. 隐藏进度条
            setTimeout(() => {
                this.loadingBar.hide();
                // 显示欢迎消息
                this.showWelcomeMessage();
            }, 1000);
            
            console.log('🎮 魔力合成游戏模块初始化完成');
            
            // 标记为已初始化
            this.state.isInitialized = true;
            
            // 触发模块加载完成事件
            this.context.emit('game:magic-merge:ready');
            
        } catch (error) {
            console.error('游戏模块初始化失败:', error);
            this.loadingBar.setProgress(100, '加载失败');
            setTimeout(() => this.loadingBar.hide(), 2000);
            this.showError('游戏加载失败，请刷新重试');
        }
    }
    
    /**
     * 创建游戏容器
     */
    async createGameContainer() {
        // 获取主容器
        const appContainer = document.getElementById('app-container');
        if (!appContainer) throw new Error('找不到应用容器');
        
        // 清空主容器
        appContainer.innerHTML = '';
        
        // 添加返回按钮
        this.addBackButton(appContainer);
        
        // 创建游戏容器
        this.elements.container = document.createElement('div');
        this.elements.container.className = 'magic-merge-container container';
        this.elements.container.innerHTML = this.renderGameUI();
        
        appContainer.appendChild(this.elements.container);
        
        // 获取DOM引用
        this.elements.gameContainer = document.getElementById('game-container');
        this.elements.grid = document.getElementById('game-grid');
        this.elements.scoreDisplay = document.getElementById('current-score');
        this.elements.bestScoreDisplay = document.getElementById('best-score');
        this.elements.startButton = document.getElementById('start-game-btn');
        this.elements.virtualControls = document.getElementById('virtual-controls');
        this.elements.helpSection = document.getElementById('game-help');
        
        // 绑定UI事件
        this.bindUIEvents();
    }
    
    /**
     * 渲染游戏UI
     */
    renderGameUI() {
        return `
            <!-- 游戏头部 -->
            <div class="game-header">
                <div class="header-left">
                    <h1 class="game-title">
                        <i class="fas fa-gamepad"></i> 魔力合成
                    </h1>
                    <p class="game-subtitle">滑动合并魔力水晶，合成桃汽水の祝福！</p>
                </div>
                
                <div class="header-right">
                    <!-- 分数显示 -->
                    <div class="score-board">
                        <div class="score-item">
                            <span class="score-label">当前分数</span>
                            <span class="score-value" id="current-score">0</span>
                        </div>
                        <div class="score-item">
                            <span class="score-label">最高分数</span>
                            <span class="score-value" id="best-score">0</span>
                        </div>
                    </div>
                    
                    <!-- 控制按钮 -->
                    <div class="control-buttons">
                        <button class="btn btn-rainbow" id="start-game-btn">
                            <i class="fas fa-play-circle"></i> 开始游戏
                        </button>
                        ${this.state.isMobile ? `
                            <button class="btn btn-secondary" id="toggle-controls-btn">
                                <i class="fas fa-gamepad"></i> 虚拟按键
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
            
            <!-- 游戏网格区域 -->
            <div class="game-grid-section" id="game-container">
                <div class="grid-wrapper">
                    <div class="grid-background">
                        <!-- 网格蒙版（初始时显示） -->
                        <div class="grid-mask" id="grid-mask">
                            <div class="mask-content">
                                <div class="mask-icon">
                                    <i class="fas fa-lock"></i>
                                </div>
                                <div class="mask-text">
                                    <h3>魔力水晶准备中...</h3>
                                    <p>点击"开始游戏"按钮揭开神秘面纱</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 游戏网格 -->
                        <div class="game-grid" id="game-grid"></div>
                    </div>
                    
                    <!-- 操作提示 -->
                    ${this.state.isMobile ? `
                        <div class="mobile-hint">
                            <i class="fas fa-hand-point-up"></i> 滑动屏幕或使用虚拟按键
                        </div>
                    ` : `
                        <div class="desktop-hint">
                            <i class="fas fa-keyboard"></i> 使用方向键 ↑ ↓ ← → 控制
                        </div>
                    `}
                </div>
                
                <!-- 虚拟控制区域 -->
                <div class="virtual-controls-container" id="virtual-controls" style="display: none;">
                    <div class="virtual-controls">
                        <div class="controls-row">
                            <button class="control-btn btn-up" data-direction="up">
                                <i class="fas fa-caret-up"></i>
                                <span class="control-label">上</span>
                            </button>
                        </div>
                        <div class="controls-row">
                            <button class="control-btn btn-left" data-direction="left">
                                <i class="fas fa-caret-left"></i>
                                <span class="control-label">左</span>
                            </button>
                            <div class="control-center">
                                <div class="center-icon">
                                    <i class="fas fa-hand-point-up"></i>
                                </div>
                            </div>
                            <button class="control-btn btn-right" data-direction="right">
                                <i class="fas fa-caret-right"></i>
                                <span class="control-label">右</span>
                            </button>
                        </div>
                        <div class="controls-row">
                            <button class="control-btn btn-down" data-direction="down">
                                <i class="fas fa-caret-down"></i>
                                <span class="control-label">下</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="controls-switch">
                        <label class="switch">
                            <input type="checkbox" id="swipe-toggle" checked>
                            <span class="slider"></span>
                        </label>
                        <span class="switch-label">滑动操作</span>
                    </div>
                </div>
            </div>
            
            <!-- 游戏信息区域 -->
            <div class="game-info-section">
                <!-- 可折叠的游戏说明 -->
                <div class="collapsible-card">
                    <div class="card-header" id="help-header">
                        <h3>
                            <i class="fas fa-question-circle"></i> 游戏说明
                            <span class="toggle-icon">
                                <i class="fas fa-chevron-down"></i>
                            </span>
                        </h3>
                    </div>
                    <div class="card-content" id="game-help" style="display: none;">
                        <div class="help-content">
                            <div class="help-section">
                                <h4><i class="fas fa-play-circle"></i> 如何游戏</h4>
                                <ul>
                                    <li><strong>电脑玩家</strong>：使用键盘方向键 ↑ ↓ ← → 移动水晶</li>
                                    <li><strong>手机玩家</strong>：滑动屏幕或点击虚拟按键移动水晶</li>
                                    <li>相同等级的魔力水晶碰撞时会<strong>合成更高级的水晶</strong></li>
                                    <li>每次移动后会在空白位置生成新的1级或2级水晶</li>
                                </ul>
                            </div>
                            
                            <div class="help-section">
                                <h4><i class="fas fa-trophy"></i> 游戏目标</h4>
                                <p>合成 <span class="goal-emoji">🍑💖</span> <strong>桃汽水の祝福 (2048级)</strong></p>
                                <p>当棋盘填满且无法移动时，游戏结束</p>
                            </div>
                            
                            <div class="help-section">
                                <h4><i class="fas fa-star"></i> 魔力等级</h4>
                                <div class="levels-preview">
                                    ${Object.entries(this.levels).slice(0, 6).map(([value, data]) => `
                                        <div class="level-preview">
                                            <span class="level-emoji">${data.emoji}</span>
                                            <span class="level-name">${data.name}</span>
                                            <span class="level-value">${value}</span>
                                        </div>
                                    `).join('')}
                                </div>
                                <p class="more-levels">更多等级请查看完整列表...</p>
                            </div>
                            
                            <div class="help-section">
                                <h4><i class="fas fa-gem"></i> 积分规则</h4>
                                <p>每合成一次，获得与合成后水晶等级相等的积分</p>
                                <p>例如：合成128级水晶，获得128积分</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 等级展示 -->
                <div class="levels-card">
                    <h3><i class="fas fa-layer-group"></i> 魔力等级</h3>
                    <div class="levels-grid" id="levels-grid"></div>
                </div>
            </div>
            
            <!-- 游戏底部 -->
            <div class="game-footer">
                <p>合成更多魔力水晶，获得桃汽水公主的祝福吧！</p>
                <p class="footer-note">
                    <i class="fas fa-lightbulb"></i> 提示：连续合成可以快速获得高分哦！
                </p>
            </div>
        `;
    }
    
    /**
     * 初始化游戏引擎
     */
    async initGameEngine() {
        // 动态导入游戏引擎
        const { default: GameEngine } = await import('./game-engine.js');
        
        this.gameEngine = new GameEngine();
        this.gameEngine.init({
            levels: this.levels,
            onScoreUpdate: this.handleScoreUpdate.bind(this),
            onGameOver: this.handleGameOver.bind(this),
            onGameWin: this.handleGameWin.bind(this),
            onTileMerged: this.handleTileMerged.bind(this)
        });
        
        // 创建游戏网格（但不填充内容）
        this.createEmptyGrid();
    }
    
    /**
     * 创建空网格（只有格子，没有数字）
     */
    createEmptyGrid() {
        if (!this.elements.grid) return;
        
        this.elements.grid.innerHTML = '';
        this.elements.gridCells = [];
        
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell empty';
                cell.dataset.row = i;
                cell.dataset.col = j;
                this.elements.grid.appendChild(cell);
                this.elements.gridCells.push(cell);
            }
        }
    }
    
    /**
     * 初始化虚拟控制
     */
    async initVirtualControls() {
        try {
            // 动态导入虚拟控制组件
            const { default: VirtualJoystick } = await import('./virtual-joystick.js');
            
            this.virtualJoystick = new VirtualJoystick();
            await this.virtualJoystick.init({
                container: this.elements.virtualControls,
                onMove: this.handleMove
            });
            
            // 默认显示虚拟控制
            this.toggleVirtualControls(true);
            
        } catch (error) {
            console.error('虚拟控制初始化失败:', error);
        }
    }
    
    /**
     * 初始化事件监听
     */
    initEventListeners() {
        // 键盘事件（桌面端）
        if (!this.state.isMobile) {
            document.addEventListener('keydown', this.handleKeyDown);
        }
        
        // 触摸事件（移动端）
        if (this.state.isMobile && this.elements.grid) {
            this.elements.grid.addEventListener('touchstart', this.handleTouchStart, { passive: false });
            this.elements.grid.addEventListener('touchend', this.handleTouchEnd, { passive: false });
        }
        
        // 窗口大小变化
        window.addEventListener('resize', this.handleResize.bind(this));
    }
    
    /**
     * 绑定UI事件
     */
    bindUIEvents() {
        // 开始/重新开始游戏按钮
        if (this.elements.startButton) {
            this.elements.startButton.addEventListener('click', this.startGame);
        }
        
        // 虚拟控制切换按钮
        const toggleControlsBtn = document.getElementById('toggle-controls-btn');
        if (toggleControlsBtn) {
            toggleControlsBtn.addEventListener('click', () => this.toggleVirtualControls());
        }
        
        // 滑动操作开关
        const swipeToggle = document.getElementById('swipe-toggle');
        if (swipeToggle) {
            swipeToggle.addEventListener('change', (e) => {
                this.state.swipeEnabled = e.target.checked;
                this.showMessage(`滑动操作已${e.target.checked ? '启用' : '禁用'}`, 'info');
            });
        }
        
        // 帮助卡片折叠
        const helpHeader = document.getElementById('help-header');
        if (helpHeader) {
            helpHeader.addEventListener('click', () => this.toggleHelpSection());
            // 默认展开帮助区域
            setTimeout(() => this.toggleHelpSection(), 500);
        }
    }
    
    /**
     * 开始游戏（首次点击）
     */
    startGame() {
        if (!this.state.hasStarted) {
            // 第一次点击：开始游戏
            this.state.hasStarted = true;
            this.state.isPlaying = true;
            
            // 移除网格蒙版
            this.removeGridMask();
            
            // 初始化游戏引擎（生成初始格子）
            if (this.gameEngine) {
                this.gameEngine.newGame();
                this.updateGameUI();
            }
            
            // 更新按钮文本和图标
            if (this.elements.startButton) {
                this.elements.startButton.innerHTML = '<i class="fas fa-redo"></i> 重新开始';
                this.elements.startButton.classList.remove('btn-rainbow');
                this.elements.startButton.classList.add('btn-primary');
            }
            
            // 显示游戏提示
            this.showMessage('游戏开始！移动魔力水晶进行合成', 'info');
            
        } else {
            // 后续点击：重新开始
            this.restartGame();
        }
    }
    
    /**
     * 重新开始游戏
     */
    restartGame() {
        if (!this.gameEngine) return;
        
        // 重置游戏状态
        this.gameEngine.newGame();
        this.state.score = 0;
        this.state.moves = 0;
        this.state.isPlaying = true;
        
        // 更新显示
        this.updateGameUI();
        this.hideMessage();
        
        // 显示重新开始提示
        this.showMessage('游戏已重新开始', 'info');
        
        console.log('🎮 游戏重新开始');
    }
    
    /**
     * 处理移动
     */
    handleMove(direction) {
        if (!this.state.isPlaying || !this.gameEngine || this.gameEngine.isGameOver) return;
        
        const moved = this.gameEngine.move(direction);
        if (moved) {
            this.state.moves++;
            this.updateGameUI();
            
            // 保存游戏状态
            this.saveGameState();
        }
    }
    
    /**
     * 处理键盘按下
     */
    handleKeyDown(e) {
        if (!this.state.isPlaying || !this.gameEngine || this.gameEngine.isGameOver) return;
        
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
    }
    
    /**
     * 处理触摸开始
     */
    handleTouchStart(e) {
        if (!this.state.swipeEnabled || !this.state.isPlaying) return;
        
        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
        e.preventDefault();
    }
    
    /**
     * 处理触摸结束
     */
    handleTouchEnd(e) {
        if (!this.state.swipeEnabled || !this.touchStartX || !this.touchStartY) return;
        
        const touch = e.changedTouches[0];
        const dx = touch.clientX - this.touchStartX;
        const dy = touch.clientY - this.touchStartY;
        
        // 最小滑动距离
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
        
        this.touchStartX = null;
        this.touchStartY = null;
        e.preventDefault();
    }
    
    /**
     * 处理分数更新
     */
    handleScoreUpdate(score) {
        const oldScore = this.state.score;
        this.state.score = score;
        
        // 更新最高分
        if (score > this.state.bestScore) {
            this.state.bestScore = score;
        }
        
        // 更新显示
        if (this.elements.scoreDisplay) {
            this.elements.scoreDisplay.textContent = score;
        }
        if (this.elements.bestScoreDisplay) {
            this.elements.bestScoreDisplay.textContent = this.state.bestScore;
        }
        
        // 添加积分
        const pointsEarned = score - oldScore;
        if (pointsEarned > 0) {
            this.awardPoints(pointsEarned);
        }
    }
    
    /**
     * 处理游戏结束
     */
    handleGameOver() {
        this.state.isPlaying = false;
        this.showMessage('游戏结束！棋盘已满，无法继续移动。', 'error');
    }
    
    /**
     * 处理游戏胜利
     */
    handleGameWin() {
        this.state.isPlaying = false;
        this.showMessage('🎉 恭喜！你成功合成了桃汽水の祝福！', 'success');
        
        // 显示庆祝特效
        this.showCelebration();
    }
    
    /**
     * 处理格子合并
     */
    handleTileMerged(data) {
        // 可以在这里添加合并特效
        // console.log('格子合并:', data);
    }
    
    /**
     * 更新游戏UI
     */
    updateGameUI() {
        if (this.gameEngine && this.elements.gridCells.length > 0) {
            this.gameEngine.updateGridDisplay(this.elements.gridCells);
            this.updateLevelsDisplay();
        }
    }
    
    /**
     * 更新等级显示
     */
    updateLevelsDisplay() {
        const levelsGrid = document.getElementById('levels-grid');
        if (!levelsGrid || !this.gameEngine) return;
        
        let html = '';
        for (const [value, data] of Object.entries(this.levels)) {
            const achieved = this.gameEngine.hasAchieved(parseInt(value));
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
        
        levelsGrid.innerHTML = html;
    }
    
    /**
     * 添加网格蒙版
     */
    addGridMask() {
        const gridBackground = document.querySelector('.grid-background');
        if (!gridBackground) return;
        
        // 创建蒙版
        const mask = document.createElement('div');
        mask.className = 'grid-mask active';
        mask.id = 'grid-mask';
        mask.innerHTML = `
            <div class="mask-content">
                <div class="mask-icon">
                    <i class="fas fa-lock"></i>
                </div>
                <div class="mask-text">
                    <h3>魔力水晶准备中...</h3>
                    <p>点击"开始游戏"按钮揭开神秘面纱</p>
                </div>
            </div>
        `;
        
        gridBackground.appendChild(mask);
        this.elements.gridMask = mask;
    }
    
    /**
     * 移除网格蒙版
     */
    removeGridMask() {
        if (this.elements.gridMask) {
            this.elements.gridMask.classList.remove('active');
            this.elements.gridMask.classList.add('fade-out');
            
            setTimeout(() => {
                if (this.elements.gridMask && this.elements.gridMask.parentNode) {
                    this.elements.gridMask.parentNode.removeChild(this.elements.gridMask);
                    this.elements.gridMask = null;
                }
            }, 500);
        }
    }
    
    /**
     * 切换虚拟控制
     */
    toggleVirtualControls(show = null) {
        if (show === null) {
            this.state.showVirtualControls = !this.state.showVirtualControls;
        } else {
            this.state.showVirtualControls = show;
        }
        
        if (this.elements.virtualControls) {
            this.elements.virtualControls.style.display = 
                this.state.showVirtualControls ? 'block' : 'none';
            
            // 更新按钮文本
            const toggleBtn = document.getElementById('toggle-controls-btn');
            if (toggleBtn) {
                toggleBtn.innerHTML = this.state.showVirtualControls ? 
                    '<i class="fas fa-eye-slash"></i> 隐藏按键' : 
                    '<i class="fas fa-gamepad"></i> 虚拟按键';
            }
        }
    }
    
    /**
     * 切换帮助区域
     */
    toggleHelpSection() {
        this.state.showHelp = !this.state.showHelp;
        const helpContent = document.getElementById('game-help');
        const toggleIcon = document.querySelector('#help-header .toggle-icon i');
        
        if (helpContent && toggleIcon) {
            if (this.state.showHelp) {
                helpContent.style.display = 'block';
                toggleIcon.className = 'fas fa-chevron-up';
                
                // 添加淡入动画
                setTimeout(() => {
                    helpContent.style.opacity = '1';
                    helpContent.style.transform = 'translateY(0)';
                }, 10);
            } else {
                helpContent.style.opacity = '0';
                helpContent.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                    helpContent.style.display = 'none';
                }, 300);
                toggleIcon.className = 'fas fa-chevron-down';
            }
        }
    }
    
    /**
     * 显示欢迎消息
     */
    showWelcomeMessage() {
        this.showMessage('欢迎来到魔力合成游戏！点击"开始游戏"按钮开始冒险', 'info');
    }
    
    /**
     * 显示庆祝特效
     */
    showCelebration() {
        // 创建庆祝元素
        const celebration = document.createElement('div');
        celebration.className = 'celebration-overlay';
        celebration.innerHTML = `
            <div class="celebration-content">
                <div class="celebration-icon">🎉</div>
                <h3>恭喜达成目标！</h3>
                <p>你成功合成了桃汽水の祝福！</p>
                <button class="btn btn-rainbow" id="continue-btn">
                    <i class="fas fa-forward"></i> 继续挑战
                </button>
            </div>
        `;
        
        document.body.appendChild(celebration);
        
        // 绑定继续按钮事件
        const continueBtn = celebration.querySelector('#continue-btn');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                celebration.classList.add('fade-out');
                setTimeout(() => {
                    if (celebration.parentNode) {
                        celebration.parentNode.removeChild(celebration);
                    }
                }, 500);
            });
        }
        
        // 10秒后自动关闭
        setTimeout(() => {
            if (celebration.parentNode) {
                celebration.classList.add('fade-out');
                setTimeout(() => {
                    if (celebration.parentNode) {
                        celebration.parentNode.removeChild(celebration);
                    }
                }, 500);
            }
        }, 10000);
    }
    
    /**
     * 显示消息
     */
    showMessage(message, type = 'info') {
        // 移除旧的消息
        const oldMessages = document.querySelectorAll('.game-message');
        oldMessages.forEach(msg => {
            if (msg.parentNode) {
                msg.parentNode.removeChild(msg);
            }
        });
        
        // 创建消息元素
        const messageEl = document.createElement('div');
        messageEl.className = `game-message ${type}`;
        messageEl.innerHTML = `
            <div class="message-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 
                                  type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                ${message}
            </div>
        `;
        
        // 添加到游戏容器
        if (this.elements.gameContainer) {
            this.elements.gameContainer.appendChild(messageEl);
            
            // 淡入效果
            setTimeout(() => {
                messageEl.style.opacity = '1';
                messageEl.style.transform = 'translateY(0)';
            }, 10);
            
            // 自动消失（成功和错误消息停留时间更长）
            const duration = type === 'success' || type === 'error' ? 5000 : 3000;
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.style.opacity = '0';
                    messageEl.style.transform = 'translateY(-20px)';
                    setTimeout(() => {
                        if (messageEl.parentNode) {
                            messageEl.parentNode.removeChild(messageEl);
                        }
                    }, 300);
                }
            }, duration);
        }
    }
    
    /**
     * 隐藏消息
     */
    hideMessage() {
        const messages = document.querySelectorAll('.game-message');
        messages.forEach(msg => {
            msg.style.opacity = '0';
            setTimeout(() => {
                if (msg.parentNode) {
                    msg.parentNode.removeChild(msg);
                }
            }, 300);
        });
    }
    
    /**
     * 添加积分
     */
    async awardPoints(points) {
        try {
            if (window.TaociApi && window.TaociApi.addPoints) {
                const result = await window.TaociApi.addPoints(
                    points,
                    '魔力合成游戏得分',
                    'magic-merge'
                );
                
                if (result && result.success) {
                    console.log(`获得积分: ${points}`);
                    // 显示积分获得提示
                    this.showPointsNotification(points);
                }
            }
        } catch (error) {
            console.warn('积分保存失败:', error);
        }
    }
    
    /**
     * 显示积分通知
     */
    showPointsNotification(points) {
        const notification = document.createElement('div');
        notification.className = 'points-notification';
        notification.innerHTML = `+${points} <i class="fas fa-star"></i>`;
        
        document.body.appendChild(notification);
        
        // 3秒后移除
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
    
    /**
     * 添加返回按钮
     */
    addBackButton(container) {
        const backBtn = document.createElement('button');
        backBtn.className = 'back-to-home';
        backBtn.innerHTML = '<i class="fas fa-arrow-left"></i> 返回首页';
        
        backBtn.addEventListener('click', () => {
            if (this.context.app && this.context.app.navigate) {
                this.context.app.navigate('home');
            } else {
                window.location.reload();
            }
        });
        
        container.appendChild(backBtn);
    }
    
    /**
     * 检测移动设备
     */
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    /**
     * 保存游戏状态
     */
    saveGameState() {
        try {
            localStorage.setItem('magic_merge_state', JSON.stringify({
                bestScore: this.state.bestScore,
                score: this.state.score,
                hasStarted: this.state.hasStarted,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.error('保存游戏状态失败:', error);
        }
    }
    
    /**
     * 加载游戏状态
     */
    loadGameState() {
        try {
            const saved = localStorage.getItem('magic_merge_state');
            if (saved) {
                const state = JSON.parse(saved);
                this.state.bestScore = state.bestScore || 0;
                this.state.score = state.score || 0;
                this.state.hasStarted = state.hasStarted || false;
                
                // 更新显示
                if (this.elements.bestScoreDisplay) {
                    this.elements.bestScoreDisplay.textContent = this.state.bestScore;
                }
                
                // 如果之前已经开始过游戏，显示"重新开始"按钮
                if (this.state.hasStarted && this.elements.startButton) {
                    this.elements.startButton.innerHTML = '<i class="fas fa-redo"></i> 重新开始';
                    this.elements.startButton.classList.remove('btn-rainbow');
                    this.elements.startButton.classList.add('btn-primary');
                }
            }
        } catch (error) {
            console.error('加载游戏状态失败:', error);
        }
    }
    
    /**
     * 处理窗口大小变化
     */
    handleResize() {
        // 可以在这里处理响应式调整
        // console.log('窗口大小变化，重新适配游戏界面');
    }
    
    /**
     * 显示错误
     */
    showError(message) {
        console.error('游戏错误:', message);
        this.showMessage(`错误: ${message}`, 'error');
    }
    
    /**
     * 清理资源
     */
    destroy() {
        // 移除事件监听
        document.removeEventListener('keydown', this.handleKeyDown);
        
        // 清理游戏引擎
        if (this.gameEngine) {
            this.gameEngine.destroy();
        }
        
        // 清理虚拟控制
        if (this.virtualJoystick) {
            this.virtualJoystick.destroy();
        }
        
        // 清理彩虹进度条
        if (this.loadingBar) {
            this.loadingBar.destroy();
        }
        
        // 移除游戏容器
        if (this.elements.container && this.elements.container.parentNode) {
            this.elements.container.parentNode.removeChild(this.elements.container);
        }
        
        // 移除所有消息
        this.hideMessage();
        
        console.log('🎮 魔力合成游戏模块已销毁');
    }
}