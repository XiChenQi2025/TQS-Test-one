import { config } from '../../../config/config.js';
import { Animation } from '../utils/Animation.js';

/**
 * 能量蓄力游戏
 */
class EnergyGame {
    constructor() {
        this.gameArea = document.getElementById('game-area');
        this.energyBar = null;
        this.pointer = null;
        this.isMoving = false;
        this.pointerPosition = 0;
        this.rounds = config.game.energy.rounds;
        this.currentRound = 0;
        this.scores = [];
    }

    start() {
        this.#clearGameArea();
        this.#createEnergyBar();
        this.#startPointer();
    }

    applyDifficulty(level) {
        this.pointerSpeed = 0.5 + level * 0.1;
    }

    #createEnergyBar() {
        const energyBar = document.createElement('div');
        energyBar.className = 'energy-bar';

        const progress = document.createElement('div');
        progress.className = 'progress';
        progress.style.width = '0%';

        const pointer = document.createElement('div');
        pointer.className = 'pointer';

        energyBar.appendChild(progress);
        energyBar.appendChild(pointer);
        this.gameArea.appendChild(energyBar);

        this.energyBar = energyBar;
        this.pointer = pointer;
    }

    #startPointer() {
        this.isMoving = true;
        this.pointerPosition = 0;
        this.#updatePointer();
    }

    #updatePointer() {
        if (!this.isMoving) return;

        this.pointerPosition += this.pointerSpeed;
        if (this.pointerPosition > 100) {
            this.pointerPosition = 0;
        }

        this.pointer.style.left = `${this.pointerPosition}%`;
        requestAnimationFrame(() => this.#updatePointer());
    }

    handleClick() {
        if (!this.isMoving) return;

        this.isMoving = false;
        const score = this.#calculateScore();
        this.scores.push(score);
        this.currentRound++;

        if (this.currentRound < this.rounds) {
            setTimeout(() => this.#startPointer(), 1000);
        } else {
            const averageScore = this.scores.reduce((a, b) => a + b, 0) / this.rounds;
            gameManager.updateScore(Math.floor(averageScore));
            this.#showResult(averageScore);
        }
    }

    #calculateScore() {
        const position = this.pointerPosition;
        if (position < config.game.energy.perfectZone * 100) return 100;
        if (position < config.game.energy.greatZone * 100) return 80;
        if (position < config.game.energy.goodZone * 100) return 60;
        return 0;
    }

    #showResult(score) {
        const result = document.createElement('div');
        result.className = 'result';
        result.textContent = `本轮得分：${score}`;
        this.gameArea.appendChild(result);
        Animation.pulse(result);
    }

    #clearGameArea() {
        this.gameArea.innerHTML = '';
    }

    destroy() {
        this.#clearGameArea();
    }
}

export default EnergyGame;
