import { LocalStorage } from '../modules/auth/LocalStorage.js';

/**
 * 导航栏组件
 * 动态显示用户状态和操作按钮
 */
class Header {
    constructor() {
        this.localStorage = new LocalStorage();
        this.element = document.createElement('header');
        this.element.className = 'header';
        this.#render();
        this.#updateUserState();
    }

    #render() {
        this.element.innerHTML = `
            <div class="header-content">
                <h1>桃汽水的魔力补给站</h1>
                <div id="user-actions"></div>
            </div>
        `;
    }

    #updateUserState() {
        const user = this.localStorage.getUser();
        const actions = user ? `
            <span>${user.nickname}</span>
            <button class="logout-btn">退出</button>
        ` : `
            <button class="login-btn">登录</button>
            <button class="register-btn">注册</button>
        `;
        
        this.element.querySelector('#user-actions').innerHTML = actions;
        this.#bindEvents(user);
    }

    #bindEvents(user) {
        const logoutBtn = this.element.querySelector('.logout-btn');
        const loginBtn = this.element.querySelector('.login-btn');
        const registerBtn = this.element.querySelector('.register-btn');

        if (user) {
            logoutBtn.addEventListener('click', () => {
                this.localStorage.removeUser();
                this.#updateUserState();
            });
        } else {
            loginBtn.addEventListener('click', () => {
                // 触发登录逻辑
                alert('登录功能待实现');
            });

            registerBtn.addEventListener('click', () => {
                // 触发注册逻辑
                alert('注册功能待实现');
            });
        }
    }
}

export default Header;
