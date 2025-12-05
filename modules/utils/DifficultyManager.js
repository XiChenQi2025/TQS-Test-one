import { config } from '../../../config/config.js';

class DifficultyManager {
    constructor() {
        this.currentLevel = 1;
        this.scoreThreshold = config.game.baseScore;
    }

    updateScore(score) {
        if (score >= this.scoreThreshold) {
            this.currentLevel++;
            this.scoreThreshold *= config.game.difficultyMultiplier;
        }
    }

    reset() {
        this.currentLevel = 1;
        this.scoreThreshold = config.game.baseScore;
    }
}

export default DifficultyManager;
