import { config } from '../../../config/config.js';
import { Animation } from '../utils/Animation.js';

/**
 * 泡泡消除游戏
 */
class BubbleGame {
    constructor() {
        this.gameArea = document.getElementById('game-area');
        this.bubbles = [];
        this.spawnInterval = null;
        this.currentSpeed = config.game.bubble.speedRange[0];
    }

    start() {
        this.#clearGameArea();
        this.#createBubble();
        this.spawnInterval = setInterval(() => this.#createBubble(), config.game.bubble.spawnRate);
    }

    applyDifficulty(level) {
        this.currentSpeed = config.game.bubble.speedRange[0] + 
            (config.game.bubble.speedRange[1] - config.game.bubble.speedRange[0]) * 
            (level / config.game.maxDifficulty);
    }

    #createBubble() {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.style.backgroundColor = this.#getRandomColor();
        bubble.style.left = `${Math.random() * 90}%`;
        bubble.style.animationDuration = `${this.currentSpeed}s`;

        bubble.addEventListener('click', (e) => this.#handleBubbleClick(e, bubble));
        this.gameArea.appendChild(bubble);
        this.bubbles.push(bubble);
    }

    #handleBubbleClick(e, bubble) {
        const score = this.#calculateScore(bubble);
        gameManager.updateScore(score);
        Animation.pulse(bubble);
        bubble.remove();
        this.bubbles = this.bubbles.filter(b => b !== bubble);
    }

    #calculateScore(bubble) {
        const color = bubble.style.backgroundColor;
        if (color === config.game.bubble.colorMap.golden) return config.game.bubble.score.golden;
        if (color === config.game.bubble.colorMap.pink) return config.game.bubble.score.pink;
        return 0;
    }

    #getRandomColor() {
        const colors = Object.values(config.game.bubble.colorMap);
        return colors[Math.floor(Math.random() * colors.length)];
    }

    #clearGameArea() {
        this.gameArea.innerHTML = '';
        this.bubbles = [];
    }

    destroy() {
        clearInterval(this.spawnInterval);
        this.#clearGameArea();
    }
}

export default BubbleGame;
