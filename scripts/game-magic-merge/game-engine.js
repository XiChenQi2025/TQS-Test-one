// 游戏逻辑引擎 - 微调版
export default class GameEngine {
    constructor() {
        this.gridSize = 4;
        this.grid = [];
        this.score = 0;
        this.gameOver = false;
        this.won = false;
        this.moves = 0;
        this.history = [];
        this.maxUndoSteps = 10;
        this.levelData = {};
        
        // 事件系统
        this.listeners = new Map();
    }
    
    init(levelData) {
        this.levelData = levelData;
        this.grid = this.createEmptyGrid();
        this.score = 0;
        this.moves = 0;
        this.history = [];
        
        // 初始化网格
        this.addRandomTile();
        this.addRandomTile();
    }
    
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
    
    createGrid(container) {
        if (!container) return;
        
        container.innerHTML = '';
        container.className = 'game-grid';
        
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                container.appendChild(cell);
            }
        }
        
        this.updateGridDisplay();
    }
    
    updateGridDisplay() {
        if (!this.grid) return;
        
        const cells = document.querySelectorAll('.grid-cell');
        cells.forEach((cell, index) => {
            const row = Math.floor(index / this.gridSize);
            const col = index % this.gridSize;
            const value = this.grid[row][col];
            
            cell.innerHTML = '';
            cell.className = 'grid-cell';
            
            if (value > 0) {
                const tile = document.createElement('div');
                tile.className = `grid-tile tile-${value}`;
                tile.textContent = this.levelData[value]?.emoji || value;
                tile.title = `${this.levelData[value]?.name || '未知'} (${value})`;
                tile.dataset.value = value;
                
                // 添加等级显示
                const levelText = document.createElement('div');
                levelText.className = 'tile-level';
                levelText.textContent = value;
                tile.appendChild(levelText);
                
                cell.appendChild(tile);
            }
        });
    }
    
    newGame() {
        this.saveState();
        this.grid = this.createEmptyGrid();
        this.score = 0;
        this.moves = 0;
        this.gameOver = false;
        this.won = false;
        this.history = [];
        
        this.addRandomTile();
        this.addRandomTile();
        
        this.emit('scoreUpdated', { score: 0 });
        this.updateGridDisplay();
    }
    
    move(direction) {
        if (this.gameOver) return false;
        
        this.saveState();
        
        let moved = false;
        const oldGrid = this.copyGrid(this.grid);
        const oldScore = this.score;
        
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
            this.addRandomTile();
            
            // 检查游戏状态
            this.checkGameOver();
            this.checkGameWon();
            
            // 计算得分变化
            const scoreDiff = this.score - oldScore;
            if (scoreDiff > 0) {
                this.emit('scoreUpdated', { 
                    score: this.score,
                    diff: scoreDiff
                });
            }
            
            this.emit('moved', {
                direction,
                moves: this.moves,
                score: this.score
            });
            
            this.updateGridDisplay();
        }
        
        return moved;
    }
    
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
                this.score += pointsEarned;
                
                // 触发合并事件
                this.emit('tileMerged', {
                    fromValue: filtered[i],
                    toValue: newValue,
                    points: pointsEarned
                });
                
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
            const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            // 90%概率生成1，10%概率生成2
            this.grid[row][col] = Math.random() < 0.9 ? 1 : 2;
            
            this.emit('tileAdded', {
                row,
                col,
                value: this.grid[row][col]
            });
            
            return true;
        }
        
        return false;
    }
    
    checkGameOver() {
        // 检查是否有空位
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] === 0) {
                    return false;
                }
            }
        }
        
        // 检查是否还有可合并的相邻格子
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const current = this.grid[i][j];
                
                // 检查右边
                if (j < this.gridSize - 1 && current === this.grid[i][j + 1]) {
                    return false;
                }
                
                // 检查下边
                if (i < this.gridSize - 1 && current === this.grid[i + 1][j]) {
                    return false;
                }
            }
        }
        
        this.gameOver = true;
        this.emit('gameOver', {
            score: this.score,
            moves: this.moves
        });
        
        return true;
    }
    
    checkGameWon() {
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] >= 2048) {
                    this.won = true;
                    this.emit('gameWon', {
                        score: this.score,
                        moves: this.moves,
                        target: this.grid[i][j]
                    });
                    return true;
                }
            }
        }
        return false;
    }
    
    undo() {
        if (this.history.length === 0) return false;
        
        const state = this.history.pop();
        this.grid = state.grid;
        this.score = state.score;
        this.moves = state.moves;
        this.gameOver = state.gameOver;
        this.won = state.won;
        
        this.emit('scoreUpdated', { score: this.score });
        this.emit('undo', { moves: this.moves });
        
        this.updateGridDisplay();
        
        return true;
    }
    
    canUndo() {
        return this.history.length > 0;
    }
    
    saveState() {
        const state = {
            grid: this.copyGrid(this.grid),
            score: this.score,
            moves: this.moves,
            gameOver: this.gameOver,
            won: this.won,
            timestamp: Date.now()
        };
        
        this.history.push(state);
        
        // 限制历史记录数量
        if (this.history.length > this.maxUndoSteps) {
            this.history.shift();
        }
    }
    
    copyGrid(grid) {
        return grid.map(row => [...row]);
    }
    
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
    
    // 处理窗口大小变化
    handleResize() {
        // 如果需要重新计算网格大小，可以在这里实现
        this.updateGridDisplay();
    }
    
    // 事件系统
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    
    off(event, callback) {
        if (!this.listeners.has(event)) return;
        
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }
    
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`事件 ${event} 执行错误:`, error);
                }
            });
        }
    }
    
    destroy() {
        this.listeners.clear();
    }
}