/**
 * 2048游戏引擎 - 更新版
 * 支持空网格显示
 */
export default class GameEngine {
    constructor() {
        this.gridSize = 4;
        this.grid = [];
        this.score = 0;
        this.bestScore = 0;
        this.isGameOver = false;
        this.isGameWon = false;
        this.moves = 0;
        this.levels = {};
        this.callbacks = {};
    }
    
    /**
     * 初始化游戏引擎
     */
    init(options) {
        this.levels = options.levels || {};
        this.callbacks = options;
        
        // 初始化空网格
        this.grid = this.createEmptyGrid();
        
        // 加载最高分
        this.loadBestScore();
        
        console.log('🎮 游戏引擎已初始化');
    }
    
    /**
     * 创建空网格
     */
    createEmptyGrid() {
        const grid = [];
        for (let i = 0; i < this.gridSize; i++) {
            grid[i] = new Array(this.gridSize).fill(0);
        }
        return grid;
    }
    
    /**
     * 更新网格显示
     */
    updateGridDisplay(gridCells = null) {
        if (!gridCells) {
            gridCells = document.querySelectorAll('.grid-cell');
        }
        
        gridCells.forEach((cell, index) => {
            const row = Math.floor(index / this.gridSize);
            const col = index % this.gridSize;
            const value = this.grid[row][col];
            
            // 清空单元格
            cell.innerHTML = '';
            cell.className = 'grid-cell';
            
            if (value > 0) {
                const level = this.levels[value];
                const tile = document.createElement('div');
                tile.className = `grid-tile tile-${value}`;
                
                // 添加emoji
                const emojiSpan = document.createElement('span');
                emojiSpan.className = 'tile-emoji';
                emojiSpan.textContent = level ? level.emoji : '?';
                tile.appendChild(emojiSpan);
                
                // 添加等级数字
                const levelSpan = document.createElement('span');
                levelSpan.className = 'tile-level';
                levelSpan.textContent = value;
                tile.appendChild(levelSpan);
                
                // 设置标题提示
                tile.title = level ? level.name : `等级 ${value}`;
                
                // 设置自定义颜色
                if (level && level.color) {
                    tile.style.background = level.color;
                }
                
                cell.appendChild(tile);
                
                // 添加出现动画
                tile.style.animation = 'tileAppear 0.3s ease';
            } else {
                // 空单元格
                cell.classList.add('empty');
            }
        });
    }
    
    /**
     * 开始新游戏
     */
    newGame() {
        this.grid = this.createEmptyGrid();
        this.score = 0;
        this.moves = 0;
        this.isGameOver = false;
        this.isGameWon = false;
        
        // 添加两个初始格子
        this.addRandomTile();
        this.addRandomTile();
        
        // 更新分数回调
        if (this.callbacks.onScoreUpdate) {
            this.callbacks.onScoreUpdate(this.score);
        }
        
        console.log('🎮 新游戏开始');
    }
    
    /**
     * 移动格子
     */
    move(direction) {
        if (this.isGameOver) return false;
        
        // 保存移动前的状态
        const oldGrid = this.copyGrid(this.grid);
        const oldScore = this.score;
        
        let moved = false;
        
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
            this.moves++;
            
            // 添加新格子
            this.addRandomTile();
            
            // 检查游戏状态
            this.checkGameStatus();
            
            // 计算得分
            const scoreDiff = this.score - oldScore;
            if (scoreDiff > 0) {
                // 更新最高分
                if (this.score > this.bestScore) {
                    this.bestScore = this.score;
                    this.saveBestScore();
                }
                
                // 调用分数更新回调
                if (this.callbacks.onScoreUpdate) {
                    this.callbacks.onScoreUpdate(this.score);
                }
                
                // 如果有格子合并，触发合并回调
                if (this.callbacks.onTileMerged && scoreDiff > 0) {
                    this.callbacks.onTileMerged({
                        scoreGain: scoreDiff,
                        totalScore: this.score
                    });
                }
            }
            
            return true;
        }
        
        return false;
    }
    
    /**
     * 向上移动
     */
    moveUp() {
        let moved = false;
        
        for (let col = 0; col < this.gridSize; col++) {
            const column = [];
            for (let row = 0; row < this.gridSize; row++) {
                column.push(this.grid[row][col]);
            }
            
            const newColumn = this.slideAndMerge(column);
            
            for (let row = 0; row < this.gridSize; row++) {
                if (this.grid[row][col] !== newColumn[row]) {
                    moved = true;
                }
                this.grid[row][col] = newColumn[row];
            }
        }
        
        return moved;
    }
    
    /**
     * 向下移动
     */
    moveDown() {
        let moved = false;
        
        for (let col = 0; col < this.gridSize; col++) {
            const column = [];
            for (let row = this.gridSize - 1; row >= 0; row--) {
                column.push(this.grid[row][col]);
            }
            
            const newColumn = this.slideAndMerge(column);
            
            for (let row = this.gridSize - 1; row >= 0; row--) {
                const newValue = newColumn[this.gridSize - 1 - row];
                if (this.grid[row][col] !== newValue) {
                    moved = true;
                }
                this.grid[row][col] = newValue;
            }
        }
        
        return moved;
    }
    
    /**
     * 向左移动
     */
    moveLeft() {
        let moved = false;
        
        for (let row = 0; row < this.gridSize; row++) {
            const newRow = this.slideAndMerge(this.grid[row]);
            
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col] !== newRow[col]) {
                    moved = true;
                }
                this.grid[row][col] = newRow[col];
            }
        }
        
        return moved;
    }
    
    /**
     * 向右移动
     */
    moveRight() {
        let moved = false;
        
        for (let row = 0; row < this.gridSize; row++) {
            const reversedRow = [...this.grid[row]].reverse();
            const newReversedRow = this.slideAndMerge(reversedRow);
            const newRow = newReversedRow.reverse();
            
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col] !== newRow[col]) {
                    moved = true;
                }
                this.grid[row][col] = newRow[col];
            }
        }
        
        return moved;
    }
    
    /**
     * 滑动并合并行/列
     */
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
                
                // 增加分数（1:1积分）
                this.score += newValue;
                
                // 检查是否达到2048
                if (newValue === 2048 && !this.isGameWon) {
                    this.isGameWon = true;
                    if (this.callbacks.onGameWin) {
                        setTimeout(() => this.callbacks.onGameWin(), 100);
                    }
                }
                
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
    
    /**
     * 添加随机格子
     */
    addRandomTile() {
        const emptyCells = [];
        
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({ row: i, col: j });
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            // 90%概率生成1，10%概率生成2
            this.grid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 1 : 2;
            return true;
        }
        
        return false;
    }
    
    /**
     * 检查游戏状态
     */
    checkGameStatus() {
        // 检查是否有空位
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] === 0) {
                    return;
                }
            }
        }
        
        // 检查是否还有可合并的相邻格子
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const current = this.grid[i][j];
                
                // 检查右边
                if (j < this.gridSize - 1 && current === this.grid[i][j + 1]) {
                    return;
                }
                
                // 检查下边
                if (i < this.gridSize - 1 && current === this.grid[i + 1][j]) {
                    return;
                }
            }
        }
        
        // 游戏结束
        this.isGameOver = true;
        if (this.callbacks.onGameOver) {
            setTimeout(() => this.callbacks.onGameOver(), 100);
        }
    }
    
    /**
     * 检查是否达到某个等级
     */
    hasAchieved(value) {
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] >= value) {
                    return true;
                }
            }
        }
        return false;
    }
    
    /**
     * 复制网格
     */
    copyGrid(grid) {
        return grid.map(row => [...row]);
    }
    
    /**
     * 保存最高分
     */
    saveBestScore() {
        try {
            localStorage.setItem('magic_merge_best_score', this.bestScore.toString());
        } catch (error) {
            console.error('保存最高分失败:', error);
        }
    }
    
    /**
     * 加载最高分
     */
    loadBestScore() {
        try {
            const saved = localStorage.getItem('magic_merge_best_score');
            if (saved) {
                this.bestScore = parseInt(saved) || 0;
            }
        } catch (error) {
            console.error('加载最高分失败:', error);
        }
    }
    
    /**
     * 清理资源
     */
    destroy() {
        this.grid = [];
        this.levels = {};
        this.callbacks = {};
        
        console.log('🎮 游戏引擎已清理');
    }
}