import Header from '../components/Header.js';
import Footer from '../components/Footer.js';
import Card from '../components/Card.js';
import { GameManager } from '../modules/game/GameManager.js';
import { Router } from '../router/Router.js';

class GamePage {
    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'game-page';
        this.gameManager = new GameManager();
        this.router = new Router();
        this.#render();
        this.#setupEvents();
    }

    #render() {
        this.element.innerHTML = `
            <div class="game-banner">
                <h2>选择你的挑战</h2>
                <p>当前积分：<span id="current-points">0</span></p>
            </div>
            
            <div class="game-list" id="game-list"></div>
        `;

        // 渲染导航栏
        const header = new Header();
        this.element.prepend(header.element);

        // 渲染游戏列表
        const games = [
            {
                name: '魔力泡泡',
                description: '点击消除粉色泡泡，金色泡泡得分更高',
                type: 'bubble'
            },
            {
                name: '符文快闪',
                description: '快速响应方向箭头，倒箭头需要反向操作',
                type: 'rune'
            },
            {
                name: '能量蓄力',
                description: '在指针到达最佳区域时点击蓄力',
                type: 'energy'
            }
        ];

        games.forEach(game => {
            const card = new Card(game.name, game.description);
            card.element.dataset.gameType = game.type;
            document.getElementById('game-list').appendChild(card.element);
        });

        // 渲染页脚
        const footer = new Footer();
        this.element.appendChild(footer.element);
    }

    #setupEvents() {
        // 更新用户积分显示
        this.gameManager.on('pointsUpdated', (points) => {
            document.getElementById('current-points').textContent = points;
        });

        // 游戏卡片点击事件
        document.querySelectorAll('.game-page .card').forEach(card => {
            card.addEventListener('click', () => {
                const gameType = card.dataset.gameType;
                this.gameManager.startGame(gameType);
            });
        });

        // 返回按钮事件
        document.querySelector('.header .back-btn').addEventListener('click', () => {
            this.router.navigate('/');
        });
    }
}

export default GamePage;
