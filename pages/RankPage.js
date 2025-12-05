import Header from '../components/Header.js';
import Footer from '../components/Footer.js';
import { RankTable } from '../modules/rank/RankTable.js';
import { Router } from '../router/Router.js';

class RankPage {
    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'rank-page';
        this.router = new Router();
        this.#render();
    }

    #render() {
        this.element.innerHTML = `
            <div class="rank-banner">
                <h2>魔力排行榜</h2>
                <p>当前积分：<span id="current-points">0</span></p>
            </div>
            
            <div id="rank-container"></div>
        `;

        // 渲染导航栏
        const header = new Header();
        this.element.prepend(header.element);

        // 初始化排行榜
        new RankTable('rank-container');

        // 渲染页脚
        const footer = new Footer();
        this.element.appendChild(footer.element);
    }

    #setupEvents() {
        // 返回按钮事件
        document.querySelector('.header .back-btn').addEventListener('click', () => {
            this.router.navigate('/');
        });
    }
}

export default RankPage;
