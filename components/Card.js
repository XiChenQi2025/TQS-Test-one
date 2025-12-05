/**
 * 卡片组件
 * 支持标题、内容、徽章和点击事件
 */
class Card {
    constructor(title, content, onClick) {
        this.element = document.createElement('div');
        this.element.className = 'card';
        this.#render(title, content);
        this.#bindClickEvent(onClick);
    }

    #render(title, content) {
        this.element.innerHTML = `
            <div class="card-content">
                <h3>${title}</h3>
                <p>${content}</p>
            </div>
        `;
    }

    #bindClickEvent(onClick) {
        if (onClick) {
            this.element.addEventListener('click', onClick);
            this.element.style.cursor = 'pointer';
        }
    }

    setBadge(text) {
        const badge = document.createElement('div');
        badge.className = 'badge';
        badge.textContent = text;
        this.element.appendChild(badge);
    }

    setImage(src) {
        const img = document.createElement('img');
        img.src = src;
        img.className = 'card-image';
        this.element.prepend(img);
    }
}

export default Card;
