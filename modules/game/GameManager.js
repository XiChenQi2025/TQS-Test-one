import { config } from '../../../config/config.js';
import { InputManager } from '../utils/InputManager.js';
import { DifficultyManager } from '../utils/DifficultyManager.js';

/**
 * 游戏管理类
 * 统一管理游戏生命周期、输入、难度等
 */
class GameManager {
    constructor() {
        this.currentGame = null;
        this.score = 0;
        this.difficulty = 1;
        this.input = new InputManager();
        this.difficultyManager = new DifficultyManager();
        this.#init();
    }

    #init() {
        this.input.init();
        window.addEventListener('resize', () => this.#adjustGameLayout());
    }

    startGame(type) {
        this.#resetGame();
        this.currentGame = type;

        switch (type) {
            case 'bubble':
                this.currentGameInstance = new BubbleGame();
                break;
            case 'rune':
                this.currentGameInstance = new RuneGame();
                break;
            case 'energy':
                this.currentGameInstance = new EnergyGame();
                break;
            default:
                throw new Error(`未知游戏类型: ${type}`);
        }

        this.currentGameInstance.start();
    }

    updateScore(points) {
        this.score += points;
        this.difficultyManager.updateScore(this.score);
        this.#updateDifficulty();
        return this.score;
    }

    #updateDifficulty() {
        this.difficulty = Math.min(
            this.difficultyManager.currentLevel,
            config.game.maxDifficulty
        );
        this.currentGameInstance?.applyDifficulty(this.difficulty);
    }

    #resetGame() {
        this.score = 0;
        this.difficulty = 1;
        this.difficultyManager.reset();
        this.currentGameInstance?.destroy();
        this.#adjustGameLayout();
    }

    #adjustGameLayout() {
        const gameArea = document.getElementById('game-area');
        if (!gameArea) return;

        gameArea.style.height = `${window.innerHeight * 0.8}px`;
        gameArea.style.width = `${window.innerWidth * 0.8}px`;
    }
}

export default GameManager;
