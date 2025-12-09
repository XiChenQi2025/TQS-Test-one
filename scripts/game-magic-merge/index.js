// 魔力合成游戏模块
export default class MagicMergeModule {
    constructor() {
        this.name = 'magic-merge';
        this.version = '1.0.0';
        this.dependencies = ['user-system'];
        
        // 游戏状态
        this.gameState = {
            score: 0,
            bestScore: 0,
            grid: null,
            gameOver: false,
            won: false,
            isMobile: false,
            isPlaying: false
        };
        
        // 等级对应的emoji和名称
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
            2048: { emoji: '🍑💖', name: '桃汽水の祝福' },
            4096: { emoji: '🌈🌟', name: '终极魔力' }
        };
        
        // DOM元素引用
        this.container = null;
        this.gridContainer = null;
        this.scoreEl = null;
        this.bestScoreEl = null;
        this.messageEl = null;
        this.virtualControls = null;
        
        // 游戏引擎
        this.engine = null;
    }
    
    async init(context) {
        this.context = context;
        
        // 检查用户是否已登录
        if (context.app && context.app.isUserLoggedIn) {
            const isLoggedIn = context.app.isUserLoggedIn();
            if (!isLoggedIn) {
                console.warn('用户未登录，游戏积分可能无法保存');
            }
        } else {
            console.warn('无法获取应用实例，游戏功能可能受限');
        }
        
        // 检测设备类型
        this.gameState.isMobile = this.isMobileDevice();
        
        // 初始化
        await this.setup();
        this.bindEvents();
        
        console.log(`🎮 ${this.name} 模块已初始化`);
        
        // 触发游戏加载完成事件
        this.context.emit('game:magic-merge:loaded', { 
            timestamp: Date.now(),
            isMobile: this.gameState.isMobile 
        });
    }
    
    async setup() {
        // 1. 创建游戏容器
        this.container = document.createElement('div');
        this.container.className = 'magic-merge-game';
        this.container.innerHTML = this.render();
        
        // 2. 添加到页面（替换主容器内容）
        const appContainer = document.getElementById('app-container');
        if (appContainer) {
            appContainer.innerHTML = '';
            appContainer.appendChild(this.container);
            
            // 添加返回按钮
            this.addBackButton(appContainer);
        }
        
        // 3. 初始化游戏引擎
        await this.initGameEngine();
        
        // 4. 初始化虚拟控制（如果是移动端）
        if (this.gameState.isMobile) {
            await this.initVirtualControls();
        }
        
        // 5. 绑定键盘事件（如果是桌面端）
        if (!this.gameState.isMobile) {
            this.bindKeyboardEvents();
        }
        
        // 6. 加载游戏状态
        this.loadGameState();
        
        // 7. 更新UI
        this.updateGameUI();
    }
    
    render() {
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
            
            <div class="virtual-controls-container" id="virtual-controls"></div>
            
            <div class="game-info-section">
                <div class="rules-card">
                    <h3><i class="fas fa-book"></i> 游戏规则</h3>
                    <div class="rules-content">
                        <p>1. 使用 <strong>方向键</strong>（电脑）或 <strong>虚拟按键</strong>（手机）移动魔力水晶</p>
                        <p>2. 相同等级的魔力水晶碰撞时会 <strong>合成更高级的水晶</strong></p>
                        <p>3. 每次移动后会在空白位置生成新的1级或2级水晶</p>
                        <p>4. 目标是合成 <strong>${this.levelData[2048].emoji} 桃汽水の祝福 (2048)</strong></p>
                        <p>5. 当棋盘填满且无法移动时，游戏结束</p>
                    </div>
                </div>
                
                <div class="levels-card">
                    <h3><i class="fas fa-star"></i> 魔力等级</h3>
                    <div class="levels-grid" id="levels-grid"></div>
                </div>
            </div>
        `;
    }
    
    async initGameEngine() {
        // 动态导入游戏引擎
        try {
            const module = await import('./game-engine.js');
            this.engine = new module.default();
            this.engine.init(this.levelData);
            
            // 初始化网格
            this.gridContainer = document.getElementById('game-grid');
            this.engine.createGrid(this.gridContainer);
            
            // 绑定引擎事件
            this.engine.on('scoreUpdated', this.handleScoreUpdate.bind(this));
            this.engine.on('gameOver', this.handleGameOver.bind(this));
            this.engine.on('gameWon', this.handleGameWon.bind(this));
            this.engine.on('tileMerged', this.handleTileMerged.bind(this));
            
        } catch (error) {
            console.error('游戏引擎加载失败:', error);
            this.showError('游戏引擎加载失败，请刷新页面重试');
        }
    }
    
    async initVirtualControls() {
        // 动态导入虚拟控制
        try {
            const module = await import('./virtual-controls.js');
            this.virtualControls = new module.default();
            
            const container = document.getElementById('virtual-controls');
            this.virtualControls.init(container, {
                onMove: (direction) => this.handleMove(direction)
            });
            
        } catch (error) {
            console.error('虚拟控制加载失败:', error);
        }
    }
    
    bindEvents() {
        // 新游戏按钮
        const newGameBtn = document.getElementById('new-game-btn');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => this.startNewGame());
        }
        
        // 游戏说明按钮
        const howToPlayBtn = document.getElementById('how-to-play-btn');
        if (howToPlayBtn) {
            howToPlayBtn.addEventListener('click', () => this.showHowToPlay());
        }
        
        // 撤销按钮
        const undoBtn = document.getElementById('undo-btn');
        if (undoBtn) {
            undoBtn.addEventListener('click', () => this.undoMove());
        }
        
        // 监听应用事件
        this.context.on('app:resume', this.onAppResume.bind(this));
        this.context.on('auth:login', this.onUserLogin.bind(this));
        this.context.on('points:updated', this.onPointsUpdated.bind(this));
    }
    
    bindKeyboardEvents() {
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
    
    bindDOMEvents() {
        // 绑定触摸滑动事件（移动端）
        if (this.gameState.isMobile) {
            this.setupTouchControls();
        }
    }
    
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
    
    // 游戏控制方法
    async startNewGame() {
        if (this.engine) {
            this.engine.newGame();
            this.gameState.isPlaying = true;
            this.gameState.gameOver = false;
            this.gameState.won = false;
            
            // 更新UI
            this.updateGameUI();
            this.hideMessage();
            
            // 触发游戏开始事件
            this.context.emit('game:magic-merge:started', {
                timestamp: Date.now(),
                mode: 'classic'
            });
        }
    }
    
    async handleMove(direction) {
        if (!this.gameState.isPlaying || this.gameState.gameOver) return;
        
        if (this.engine) {
            const moved = this.engine.move(direction);
            if (moved) {
                this.updateGameUI();
                
                // 触发移动事件
                this.context.emit('game:magic-merge:moved', {
                    direction,
                    score: this.gameState.score,
                    timestamp: Date.now()
                });
            }
        }
    }
    
    async undoMove() {
        if (this.engine) {
            const undone = this.engine.undo();
            if (undone) {
                this.updateGameUI();
                this.showMessage('已撤销上一步操作', 'info');
            }
        }
    }
    
    // 事件处理方法
    handleScoreUpdate(data) {
        const oldScore = this.gameState.score;
        this.gameState.score = data.score;
        
        // 更新最高分
        if (this.gameState.score > this.gameState.bestScore) {
            this.gameState.bestScore = this.gameState.score;
            this.saveGameState();
        }
        
        // 更新积分（1:1对应）
        const pointsEarned = data.score - oldScore;
        if (pointsEarned > 0) {
            this.awardPoints(pointsEarned);
        }
        
        // 更新UI
        this.updateScoreDisplay();
    }
    
    handleGameOver() {
        this.gameState.gameOver = true;
        this.gameState.isPlaying = false;
        
        this.showMessage('游戏结束！棋盘已满，无法继续移动。', 'error');
        
        // 触发游戏结束事件
        this.context.emit('game:magic-merge:ended', {
            score: this.gameState.score,
            bestScore: this.gameState.bestScore,
            timestamp: Date.now()
        });
    }
    
    handleGameWon() {
        this.gameState.won = true;
        this.gameState.isPlaying = false;
        
        this.showMessage(`🎉 恭喜！你成功合成了${this.levelData[2048].emoji}桃汽水の祝福！`, 'success');
        
        // 触发游戏胜利事件
        this.context.emit('game:magic-merge:won', {
            score: this.gameState.score,
            target: 2048,
            timestamp: Date.now()
        });
    }
    
    // 添加一个游戏结束时的积分保存方法
    async saveGameScore() {
        if (!this.gameState.isPlaying) return;
        
        const totalPoints = this.gameState.score; // 总分就是获得的积分
        
        try {
            // 使用现有的 submitGameScore API
            const result = await window.TaociApi.submitGameScore(
                'magic-merge', // 游戏类型
                this.gameState.score, // 游戏分数
                Math.floor((Date.now() - this.gameStartTime) / 1000), // 游戏时长（秒）
                1 // 难度等级
            );
            
            if (result && result.success) {
                console.log(`游戏分数已保存: ${this.gameState.score}分，获得${totalPoints}积分`);
                return result.data;
            }
        } catch (error) {
            console.error('保存游戏分数失败:', error);
            // 如果API失败，尝试使用 addPoints 接口
            try {
                const addResult = await window.TaociApi.addPoints(
                    totalPoints,
                    '魔力合成游戏得分',
                    'magic-merge'
                );
                if (addResult && addResult.success) {
                    console.log(`积分已添加: ${totalPoints}分`);
                }
            } catch (addError) {
                console.error('添加积分失败:', addError);
            }
        }
        
        return null;
    }

    handleTileMerged(data) {
        // 显示合并动画或效果
        const { fromValue, toValue, points } = data;
        
        // 可以在UI上显示合并特效
        this.showMergeEffect(fromValue, toValue, points);
        
        // 触发合并事件
        this.context.emit('game:magic-merge:merged', data);
    }
    
    // 修改 awardPoints 方法，直接使用 window.TaociApi
    async awardPoints(points) {
        try {
            // 直接使用现有的API添加积分
            const result = await window.TaociApi.addPoints(
                points,
                '魔力合成游戏',
                'magic-merge'
            );
            
            if (result && result.success) {
                console.log(`🎮 获得${points}点魔力积分`);
                this.showPointsNotification(points);
                return true;
            } else {
                console.warn('积分保存失败:', result?.error);
                this.saveLocalPoints(points);
                return false;
            }
            
        } catch (error) {
            console.warn('API调用失败，使用本地存储:', error);
            this.saveLocalPoints(points);
            return false;
        }
    }
    
    // UI更新方法
    updateGameUI() {
        if (!this.engine) return;
        
        // 更新分数显示
        this.updateScoreDisplay();
        
        // 更新网格显示
        this.engine.updateGridDisplay();
        
        // 更新等级展示
        this.updateLevelsDisplay();
        
        // 更新按钮状态
        this.updateButtonsState();
    }
    
    updateScoreDisplay() {
        const scoreEl = document.getElementById('current-score');
        const bestScoreEl = document.getElementById('best-score');
        
        if (scoreEl) scoreEl.textContent = this.gameState.score;
        if (bestScoreEl) bestScoreEl.textContent = this.gameState.bestScore;
    }
    
    updateLevelsDisplay() {
        const levelsGrid = document.getElementById('levels-grid');
        if (!levelsGrid) return;
        
        let html = '';
        for (const [value, data] of Object.entries(this.levelData)) {
            if (value <= 4096) { // 限制显示范围
                html += `
                    <div class="level-item ${this.engine.hasAchieved(value) ? 'achieved' : ''}">
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
    
    updateButtonsState() {
        const undoBtn = document.getElementById('undo-btn');
        if (undoBtn) {
            undoBtn.disabled = !this.engine || !this.engine.canUndo();
        }
    }
    
    // 工具方法
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    loadGameState() {
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
    
    saveGameState() {
        try {
            localStorage.setItem('taoci_magic_merge_state', JSON.stringify({
                bestScore: this.gameState.bestScore,
                lastPlayed: Date.now()
            }));
        } catch (error) {
            console.error('保存游戏状态失败:', error);
        }
    }
    
    showMessage(message, type = 'info') {
        const messageEl = document.getElementById('game-message');
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.className = `game-message ${type}`;
            messageEl.style.display = 'block';
            
            // 3秒后自动隐藏
            if (type !== 'error') {
                setTimeout(() => {
                    this.hideMessage();
                }, 3000);
            }
        }
    }
    
    hideMessage() {
        const messageEl = document.getElementById('game-message');
        if (messageEl) {
            messageEl.style.display = 'none';
        }
    }
    
    showPointsNotification(points) {
        // 创建浮动积分提示
        const notification = document.createElement('div');
        notification.className = 'points-notification';
        notification.innerHTML = `+${points} <i class="fas fa-star"></i>`;
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--color-primary);
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
    
    showMergeEffect(fromValue, toValue, points) {
        // 可以添加合并特效动画
        console.log(`合并: ${fromValue} → ${toValue}, 获得${points}分`);
    }
    
    showHowToPlay() {
        const modalHtml = `
            <div class="how-to-play-modal">
                <h3>🎮 魔力合成游戏说明</h3>
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
        
        // 创建遮罩层
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = modalHtml;
        
        document.body.appendChild(overlay);
        
        // 绑定关闭事件
        const closeBtn = overlay.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        });
    }
    
    // 在 addBackButton 方法中添加响应式处理
    addBackButton(container) {
        const backBtn = document.createElement('button');
        backBtn.className = 'back-to-home-btn';
        backBtn.innerHTML = '<i class="fas fa-arrow-left"></i> <span class="btn-text">返回首页</span>';
        backBtn.style.cssText = `
            position: fixed;
            top: 80px;
            left: 20px;
            z-index: 1000;
            background: rgba(255, 110, 255, 0.9);
            color: white;
            border: none;
            border-radius: 20px;
            padding: 10px 20px;
            cursor: pointer;
            font-size: 14px;
            box-shadow: var(--glow-shadow);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        
        // 添加触摸反馈
        backBtn.addEventListener('touchstart', () => {
            backBtn.style.transform = 'scale(0.95)';
        });
        
        backBtn.addEventListener('touchend', () => {
            backBtn.style.transform = '';
        });
        
        // 添加鼠标悬停效果
        backBtn.addEventListener('mouseenter', () => {
            backBtn.style.transform = 'translateX(-5px)';
            backBtn.style.boxShadow = '0 0 20px rgba(255, 110, 255, 0.7)';
        });
        
        backBtn.addEventListener('mouseleave', () => {
            backBtn.style.transform = '';
            backBtn.style.boxShadow = 'var(--glow-shadow)';
        });
        
        backBtn.addEventListener('click', () => {
            // 返回首页
            if (this.context.app && this.context.app.renderHomePage) {
                this.context.app.renderHomePage();
            } else {
                window.location.reload();
            }
        });
        
        container.appendChild(backBtn);
        
        // 添加窗口大小变化监听，处理响应式
        window.addEventListener('resize', this.handleBackButtonResize.bind(this, backBtn));
        
        // 初始调用一次
        this.handleBackButtonResize(backBtn);
    }
    
    // 添加处理返回按钮响应式的方法
    handleBackButtonResize(backBtn) {
        const width = window.innerWidth;
        const textSpan = backBtn.querySelector('.btn-text');
        
        if (width <= 480) {
            // 超小屏幕只显示图标
            if (textSpan) textSpan.style.display = 'none';
            backBtn.style.padding = '6px 12px';
            backBtn.style.borderRadius = '15px';
            backBtn.style.fontSize = '12px';
            backBtn.style.top = '60px';
            backBtn.style.left = '5px';
        } else if (width <= 768) {
            // 小屏幕缩小按钮
            if (textSpan) textSpan.style.display = 'inline';
            backBtn.style.padding = '8px 16px';
            backBtn.style.fontSize = '12px';
            backBtn.style.top = '70px';
            backBtn.style.left = '10px';
        } else {
            // 正常屏幕
            if (textSpan) textSpan.style.display = 'inline';
            backBtn.style.padding = '10px 20px';
            backBtn.style.fontSize = '14px';
            backBtn.style.top = '80px';
            backBtn.style.left = '20px';
        }
    }
    
    // 事件监听器
    onAppResume(data) {
        console.log('应用恢复，重新加载游戏');
        this.loadGameState();
    }
    
    onUserLogin(user) {
        console.log('用户登录，同步游戏数据');
        // 可以在这里同步本地积分到服务器
    }
    
    onPointsUpdated(data) {
        console.log('积分更新:', data);
    }
    
    showError(message) {
        this.showMessage(message, 'error');
        console.error(message);
    }
    
    destroy() {
        // 清理资源
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        
        // 移除事件监听
        document.removeEventListener('keydown', this.handleKeyDown);
        
        // 清理游戏引擎
        if (this.engine) {
            this.engine.destroy();
        }
        
        // 清理虚拟控制
        if (this.virtualControls) {
            this.virtualControls.destroy();
        }
        
        console.log(`🗑️ ${this.name} 模块已销毁`);
    }
}