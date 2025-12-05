import { config } from '../../../config/config.js';

/**
 * 排行榜表格类
 * 负责排行榜数据的渲染和更新
 */
class RankTable {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.rankManager = new RankManager();
        this.#render();
    }

    #render() {
        const rankings = this.rankManager.getTopRankings();
        const personalRank = this.rankManager.getPersonalRank();

        let html = `
            <h2>魔力排行榜</h2>
            <table class="rank-table">
                <thead>
                    <tr>
                        <th>排名</th>
                        <th>用户名</th>
                        <th>积分</th>
                    </tr>
                </thead>
                <tbody>
        `;

        rankings.forEach((user, index) => {
            const isCurrentUser = user.id === this.rankManager.currentUser?.id;
            html += `
                <tr class="${isCurrentUser ? 'current-user' : ''}">
                    <td>${index + 1}</td>
                    <td>${user.username}</td>
                    <td>${user.points}</td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
            ${personalRank !== -1 ? `
                <p class="personal-rank">
                    你的排名：第${personalRank}名
                </p>
            ` : ''}
        `;

        this.container.innerHTML = html;
    }
}

export default RankTable;
