/**
 * 本地存储管理类
 * 负责用户数据的持久化存储
 */
class LocalStorage {
    constructor() {
        this.storageKey = 'taoci-magic-user';
    }

    setUser(user) {
        localStorage.setItem(this.storageKey, JSON.stringify(user));
    }

    getUser() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : null;
    }

    getUserByUsername(username) {
        const user = this.getUser();
        return user && user.username === username ? user : null;
    }

    removeUser() {
        localStorage.removeItem(this.storageKey);
    }

    // 以下为抽奖系统扩展方法
    getLotteryHistory() {
        return JSON.parse(localStorage.getItem('lottery-history')) || [];
    }

    setLotteryHistory(history) {
        localStorage.setItem('lottery-history', JSON.stringify(history));
    }

    getFreeSpins() {
        return parseInt(localStorage.getItem('free-spins')) || 0;
    }

    setFreeSpins(count) {
        localStorage.setItem('free-spins', count.toString());
    }

    decrementFreeSpins() {
        const current = this.getFreeSpins();
        localStorage.setItem('free-spins', (current - 1).toString());
    }

    getLastSpinDate() {
        return localStorage.getItem('last-spin-date');
    }

    setLastSpinDate(date) {
        localStorage.setItem('last-spin-date', date);
    }
}

export default LocalStorage;
