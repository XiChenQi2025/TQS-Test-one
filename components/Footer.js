/**
 * 页脚组件
 * 包含版权信息和社交链接
 */
class Footer {
    constructor() {
        this.element = document.createElement('footer');
        this.element.className = 'footer';
        this.#render();
    }

    #render() {
        this.element.innerHTML = `
            <div class="footer-content">
                <p>虚拟主播周年庆特别企划 | 开发者：桃色契约者</p>
                <div class="social-links">
                    <a href="#twitter" class="twitter-link">🐦 Twitter</a>
                    <a href="#youtube" class="youtube-link">🎥 YouTube</a>
                    <a href="#discord" class="discord-link">💬 Discord</a>
                </div>
            </div>
        `;
    }
}

export default Footer;
