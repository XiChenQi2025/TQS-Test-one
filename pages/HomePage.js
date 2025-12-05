import Header from '../components/Header.js';
import Footer from '../components/Footer.js';
import Card from '../components/Card.js';
import Button from '../components/Button.js';
import { Router } from '../router/Router.js';

class HomePage {
    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'home-page';
        this.router = new Router();
        this.#render();
        this.#setupEvents();
    }

    #render() {
        this.element.innerHTML = `
            <div class="hero">
                <h2>欢迎来到桃汽水的魔力补给站！</h2>
                <p>虚拟主播周年庆特别企划</p>
            </div>
            
            <div class="features">
                <div id="login-actions"></div>
                <div id="game-entrance"></div>
            </div>
        `;

        // 渲染导航栏
        const header = new Header();
        this.element.prepend(header.element);

        // 渲染登录/注册按钮
        const loginBtn = new Button('立即登录', 'primary');
        const registerBtn = new Button('立即注册', 'secondary');
        document.getElementById('login-actions').appendChild(loginBtn.element);
        document.getElementById('login-actions').appendChild(registerBtn.element);

        // 渲染游戏入口
        const gameCard = new Card('进入游戏大厅', '体验三款超有趣的小游戏');
        document.getElementById('game-entrance').appendChild(gameCard.element);

        // 渲染页脚
        const footer = new Footer();
        this.element.appendChild(footer.element);
    }

    #setupEvents() {
        // 登录按钮点击事件
        document.querySelector('.home-page .primary').addEventListener('click', () => {
            this.router.navigate('/login');
        });

        // 注册按钮点击事件
        document.querySelector('.home-page .secondary').addEventListener('click', () => {
            this.router.navigate('/register');
        });

        // 游戏入口点击事件
        document.querySelector('.home-page .card').addEventListener('click', () => {
            this.router.navigate('/games');
        });
    }
}

export default HomePage;
