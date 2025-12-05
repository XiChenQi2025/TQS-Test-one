import { config } from '../../../config/config.js';
import { LocalStorage } from '../../auth/LocalStorage.js';

/**
 * 抽奖管理类
 * 处理抽奖逻辑、积分消耗、奖励生成
 */
class LotteryManager {
    constructor() {
        this.localStorage = new LocalStorage();
        this.user = this.localStorage.getUser();
        this.history = this.localStorage.getLotteryHistory() || [];
        this.#syncFreeSpins();
    }

    async spin() {
        if (!this.user) return { success: false, message: '请先登录' };
        if (this.user.points < config.lottery.spinCost) {
            return { success: false, message: '积分不足' };
        }

        const hasFreeSpin = this.#checkFreeSpin();
        if (!hasFreeSpin) {
            this.user.points -= config.lottery.spinCost;
            this.localStorage.setUser(this.user);
        }

        const reward = this.#getRandomReward();
        this.history.push({
            timestamp: new Date().toISOString(),
            reward: reward.name,
            points: reward.points,
            isFree: hasFreeSpin
        });
        this.localStorage.setLotteryHistory(this.history);

        return { success: true, reward };
    }

    #getRandomReward() {
        const totalProbability = Object.values(config.lottery.probability).reduce((a, b) => a + b, 0);
        const random = Math.random() * totalProbability;

        let cumulative = 0;
        for (const [tier, probability] of Object.entries(config.lottery.probability)) {
            cumulative += probability;
            if (random < cumulative) {
                return this.#getRandomItemFromTier(tier);
            }
        }
        return this.#getRandomItemFromTier('common');
    }

    #getRandomItemFromTier(tier) {
        const items = config.lottery.rewards[tier];
        return items[Math.floor(Math.random() * items.length)];
    }

    #checkFreeSpin() {
        const today = new Date().toLocaleDateString();
        const lastSpinDate = this.localStorage.getLastSpinDate();
        
        if (lastSpinDate !== today) {
            this.localStorage.setLastSpinDate(today);
            this.localStorage.setFreeSpins(config.lottery.dailyFreeSpins);
        }

        if (this.localStorage.getFreeSpins() > 0) {
            this.localStorage.decrementFreeSpins();
            return true;
        }
        return false;
    }

    #syncFreeSpins() {
        const today = new Date().toLocaleDateString();
        const lastSpinDate = this.localStorage.getLastSpinDate();
        
        if (lastSpinDate !== today) {
            this.localStorage.setLastSpinDate(today);
            this.localStorage.setFreeSpins(config.lottery.dailyFreeSpins);
        }
    }

    getHistory() {
        return this.history;
    }
}

export default LotteryManager;
