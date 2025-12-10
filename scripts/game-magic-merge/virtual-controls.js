// 虚拟控制组件 - 简化版（确保加载成功）
export default class VirtualControls {
    constructor() {
        this.container = null;
        this.callbacks = {};
        this.isVisible = false;
    }
    
    init(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks;
        
        if (!container) {
            console.error('虚拟控制容器不存在');
            return;
        }
        
        this.render();
        this.bindEvents();
        this.isVisible = true;
        
        console.log('虚拟控制已初始化');
    }
    
    render() {
        this.container.innerHTML = `
            <div class="virtual-controls">
                <div class="controls-title">虚拟控制</div>
                <div class="controls-grid">
                    <div class="control-placeholder"></div>
                    <button class="control-btn up-btn" data-direction="up">
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <div class="control-placeholder"></div>
                    
                    <button class="control-btn left-btn" data-direction="left">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <div class="control-center">
                        <div class="control-hint">点击或滑动</div>
                    </div>
                    <button class="control-btn right-btn" data-direction="right">
                        <i class="fas fa-arrow-right"></i>
                    </button>
                    
                    <div class="control-placeholder"></div>
                    <button class="control-btn down-btn" data-direction="down">
                        <i class="fas fa-arrow-down"></i>
                    </button>
                    <div class="control-placeholder"></div>
                </div>
            </div>
        `;
    }
    
    bindEvents() {
        const buttons = this.container.querySelectorAll('.control-btn');
        
        // 触摸事件
        buttons.forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleButtonPress(btn);
            }, { passive: false });
            
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.handleButtonRelease(btn);
            }, { passive: false });
            
            // 鼠标事件（用于测试）
            btn.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.handleButtonPress(btn);
            });
            
            btn.addEventListener('mouseup', (e) => {
                e.preventDefault();
                this.handleButtonRelease(btn);
            });
            
            btn.addEventListener('mouseleave', () => {
                this.handleButtonRelease(btn);
            });
        });
    }
    
    handleButtonPress(btn) {
        const direction = btn.dataset.direction;
        if (direction && this.callbacks.onMove) {
            this.callbacks.onMove(direction);
        }
        
        // 添加按下效果
        btn.classList.add('pressed');
        btn.style.transform = 'scale(0.95)';
        
        // 添加点击反馈
        this.showPressFeedback(direction);
    }
    
    handleButtonRelease(btn) {
        btn.classList.remove('pressed');
        btn.style.transform = '';
    }
    
    showPressFeedback(direction) {
        // 可以在按钮上显示反馈效果
        const btn = this.container.querySelector(`.${direction}-btn`);
        if (btn) {
            const feedback = document.createElement('div');
            feedback.className = 'press-feedback';
            feedback.style.cssText = `
                position: absolute;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                animation: pressEffect 0.3s ease-out;
            `;
            
            btn.appendChild(feedback);
            
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 300);
        }
    }
    
    show() {
        if (this.container) {
            this.container.style.display = 'block';
            this.isVisible = true;
            
            if (this.callbacks.onShow) {
                this.callbacks.onShow();
            }
        }
    }
    
    hide() {
        if (this.container) {
            this.container.style.display = 'none';
            this.isVisible = false;
            
            if (this.callbacks.onHide) {
                this.callbacks.onHide();
            }
        }
    }
    
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
    
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.callbacks = {};
    }
}