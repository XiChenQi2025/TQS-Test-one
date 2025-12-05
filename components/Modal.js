/**
 * 弹窗组件
 * 支持标题、内容和自定义按钮
 */
class Modal {
    constructor(title, content, buttons = []) {
        this.element = document.createElement('div');
        this.element.className = 'modal';
        this.#render(title, content, buttons);
        this.#bindEvents();
    }

    #render(title, content, buttons) {
        this.element.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <h2>${title}</h2>
                    <div class="modal-body">${content}</div>
                    <div class="modal-actions">
                        ${buttons.map(btn => `
                            <button class="modal-btn ${btn.type}">${btn.text}</button>
                        `).join('')}
                        <button class="close-btn">关闭</button>
                    </div>
                </div>
            </div>
        `;
    }

    #bindEvents() {
        this.element.querySelector('.close-btn').addEventListener('click', () => this.close());
        this.element.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.close();
            }
        });
    }

    close() {
        this.element.remove();
    }
}

export default Modal;
