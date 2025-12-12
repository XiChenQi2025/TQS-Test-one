/**
 * 2048游戏引擎
 * 处理游戏核心逻辑
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
    
    // ... 其他方法保持不变 ...
    
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
    
    // ... 其他方法保持不变 ...
    
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