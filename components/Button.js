/**
 * 按钮组件
 * 支持不同样式和状态管理
 */
class Button {
    constructor(text, type = 'primary', onClick) {
        this.element = document.createElement('button');
        this.element.className = `button ${type}`;
        this.element.textContent = text;
        this.#bindClickEvent(onClick);
    }

    #bindClickEvent(onClick) {
        if (onClick) {
            this.element.addEventListener('click', onClick);
        }
    }

    disable() {
        this.element.disabled = true;
        this.element.style.opacity = 0.5;
        this.element.style.cursor = 'not-allowed';
    }

    enable() {
        this.element.disabled = false;
        this.element.style.opacity = 1;
        this.element.style.cursor = 'pointer';
    }

    setLoading(loading) {
        if (loading) {
            this.element.innerHTML = `
                <span class="spinner"></span>
                <span>加载中...</span>
            `;
            this.disable();
        } else {
            this.element.textContent = this.element.dataset.originalText;
            this.enable();
        }
    }
}

export default Button;
