import { config } from '../../../config/config.js';
import { Animation } from '../utils/Animation.js';

/**
 * 符文快闪游戏
 */
class RuneGame {
    constructor() {
        this.gameArea = document.getElementById('game-area');
        this.currentRune = null;
        this.combo = 0;
        this.showTime = config.game.rune.showTime.initial;
    }

    start() {
        this.#clearGameArea();
        this.#showNextRune();
    }

    applyDifficulty(level) {
        this.showTime = Math.max(
            config.game.rune.showTime.initial - (level - 1) * config.game.rune.showTime.decreasePerLevel,
            config.game.rune.showTime.min
        );
    }

    #showNextRune() {
        const rune = document.createElement('div');
        rune.className = 'rune';
        rune.innerHTML = this.#generateRune();

        this.gameArea.appendChild(rune);
        this.currentRune = rune;

        setTimeout(() => {
            if (rune === this.currentRune) {
                this.#handleTimeout();
            }
        }, this.showTime);
    }

    #generateRune() {
        const directions = ['↑', '↓', '←', '→'];
        const symbols = ['🍑', '✨', '⚡'];

        if (Math.random() < config.game.rune.trickyChance) {
            return this.#generateTrickyRune();
        }

        return directions[Math.floor(Math.random() * directions.length)];
    }

    #generateTrickyRune() {
        const reversed = ['↓', '↑', '→', '←'];
        const direction = reversed[Math.floor(Math.random() * reversed.length)];
        return `<span style="transform: rotate(180deg)">${direction}</span>`;
    }

    handleInput(direction) {
        if (!this.currentRune) return;

        const isCorrect = this.#isCorrectInput(direction);
        if (isCorrect) {
            this.combo++;
            gameManager.updateScore(config.game.rune.comboBonus * this.combo);
            Animation.shake(this.currentRune);
        } else {
            this.combo = 0;
            Animation.flash(this.currentRune, config.theme.danger);
        }

        this.currentRune.remove();
        this.#showNextRune();
    }

    #isCorrectInput(input) {
        const runeText = this.currentRune.textContent.trim();
        if (runeText === '↑') return input === 'up';
        if (runeText === '↓') return input === 'down';
        if (runeText === '←') return input === 'left';
        if (runeText === '→') return input === 'right';
        return false;
    }

    #handleTimeout() {
        this.combo = 0;
        Animation.flash(this.currentRune, config.theme.danger);
        this.currentRune.remove();
        this.#showNextRune();
    }

    #clearGameArea() {
        this.gameArea.innerHTML = '';
    }

    destroy() {
        this.#clearGameArea();
    }
}

export default RuneGame;
