import Header from '../components/Header.js';
import Footer from '../components/Footer.js';
import { LotteryManager } from '../modules/lottery/LotteryManager.js';
import { MagicWheel } from '../modules/lottery/MagicWheel.js';
import { Router } from '../router/Router.js';

class LotteryPage {
    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'lottery-page';
        this.lotteryManager = new LotteryManager();
        this.router = new Router();
        this.#render();
        this.#setupEvents();
    }

    #render() {
        this.element.innerHTML = `
            <div class="lottery-banner">
                <h2>幸运大转盘</h2>
                <p>当前积分：<span id="current-points">0</span></p>
                <p>免费抽奖次数：<span id="free-spins">0</span></p>
            </div>
            
            <div id="lottery-container"></div>
            <div id="spin-actions"></div>
        `;

        // 渲染导航栏
        const header = new Header();
        this.element.prepend(header.element);

        // 初始化抽奖转盘
        const magicWheel = new MagicWheel('lottery-wheel');
        magicWheel.updateRewards([
            { name: '桃色贴纸', points: 50 },
            { name: '魔力药水', points: 100 },
            { name: '限定头像框', points: 200 }
        ]);

        // 渲染抽奖按钮
        const spinBtn = new Button('转动轮盘', 'primary');
        document.getElementById('spin-actions').appendChild(spinBtn.element);

        // 渲染页脚
        const footer = new Footer();
        this.element.appendChild(footer.element);
    }

    #setupEvents() {
        // 更新用户积分显示
        this.lotteryManager.on('pointsUpdated', (points) => {
            document.getElementById('current-points').textContent = points;
        });

        // 更新免费抽奖次数
        this.lotteryManager.on('freeSpinsUpdated', (count) => {
            document.getElementById('free-spins').textContent = count;
        });

        // 抽奖按钮点击事件
        document.querySelector('.lottery-page .primary').addEventListener('click', () => {
            this.lotteryManager.spin().then(result => {
                if (result.success) {
                    const magicWheel = document.querySelector('canvas');
                    magicWheel.spin();
                } else {
                    alert(result.message);
                }
            });
        });

        // 返回按钮事件
        document.querySelector('.header .back-btn').addEventListener('click', () => {
            this.router.navigate('/');
        });
    }
}

export default LotteryPage;
