import { LocalStorage } from '../../auth/LocalStorage.js';

/**
 * 排行榜管理类
 * 处理排行榜数据获取和排序
 */
class RankManager {
    constructor() {
        this.localStorage = new LocalStorage();
        this.users = this.#loadUsers();
        this.currentUser = this.localStorage.getUser();
    }

    #loadUsers() {
        // 模拟从后端获取用户数据（实际应通过API获取）
        const users = [];
        for (let i = 0; i < 100; i++) {
            users.push({
                id: `u_${i}`,
                username: `玩家${i + 1}`,
                points: Math.floor(Math.random() * 10000)
            });
        }
        return users;
    }

    getTopRankings(limit = 10) {
        const sortedUsers = [...this.users].sort((a, b) => b.points - a.points);
        return sortedUsers.slice(0, limit);
    }

    getPersonalRank() {
        if (!this.currentUser) return -1;
        const sortedUsers = [...this.users].sort((a, b) => b.points - a.points);
        return sortedUsers.findIndex(u => u.id === this.currentUser.id) + 1;
    }

    updateUserPoints(userId, points) {
        this.users = this.users.map(u => 
            u.id === userId ? { ...u, points } : u
        );
        // 实际应保存到后端或本地存储
    }
}

export default RankManager;
