// 虚拟控制组件（移动端专用）
export default class VirtualControls {
    constructor() {
        this.container = null;
        this.callbacks = {};
        this.isVisible = false;
    }
    
    init(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks;
        
        if (!container) return;
        
        this.render();
        this.bindEvents();
        this.isVisible = true;
    }
    
    render() {
        this.container.innerHTML = `
            <div class="virtual-controls">
                <div class="controls-row">
                    <button class="control-btn btn-up" data-direction="up">
                        <i class="fas fa-arrow-up"></i>
                    </button>
                </div>
                <div class="controls-row">
                    <button class="control-btn btn-left" data-direction="left">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <div class="control-center">
                        <button class="control-btn btn-center" id="center-btn">
                            <i class="fas fa-hand-pointer"></i>
                        </button>
                    </div>
                    <button class="control-btn btn-right" data-direction="right">
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
                <div class="controls-row">
                    <button class="control-btn btn-down" data-direction="down">
                        <i class="fas fa-arrow-down"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    bindEvents() {
        const buttons = this.container.querySelectorAll('.control-btn[data-direction]');
        buttons.forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const direction = btn.dataset.direction;
                this.handleButtonPress(direction);
                
                // 添加按下效果
                btn.classList.add('pressed');
            });
            
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                btn.classList.remove('pressed');
            });
            
            // 鼠标支持（用于测试）
            btn.addEventListener('mousedown', (e) => {
                e.preventDefault();
                const direction = btn.dataset.direction;
                this.handleButtonPress(direction);
                btn.classList.add('pressed');
            });
            
            btn.addEventListener('mouseup', (e) => {
                e.preventDefault();
                btn.classList.remove('pressed');
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.classList.remove('pressed');
            });
        });
        
        // 中心按钮（用于说明）
        const centerBtn = document.getElementById('center-btn');
        if (centerBtn) {
            centerBtn.addEventListener('click', () => {
                this.showControlsHelp();
            });
        }
    }
    
    handleButtonPress(direction) {
        if (this.callbacks.onMove) {
            this.callbacks.onMove(direction);
        }
        
        // 添加点击反馈
        this.showPressFeedback(direction);
    }
    
    showPressFeedback(direction) {
        const btn = this.container.querySelector(`.btn-${direction}`);
        if (btn) {
            // 添加短暂的放大效果
            btn.style.transform = 'scale(1.1)';
            setTimeout(() => {
                btn.style.transform = '';
            }, 150);
        }
    }
    
    showControlsHelp() {
        const helpText = document.createElement('div');
        helpText.className = 'controls-help';
        helpText.innerHTML = `
            <div class="help-content">
                <h4>🎮 虚拟按键说明</h4>
                <p>使用方向键控制魔力水晶移动</p>
                <p>也可以直接在游戏区域滑动手指操作</p>
                <p><small>提示：长按方向键可以连续移动</small></p>
            </div>
        `;
        
        helpText.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 15px;
            z-index: 100;
            text-align: center;
            animation: fadeIn 0.3s ease;
        `;
        
        this.container.appendChild(helpText);
        
        setTimeout(() => {
            if (helpText.parentNode) {
                helpText.parentNode.removeChild(helpText);
            }
        }, 2000);
    }
    
    show() {
        if (this.container) {
            this.container.style.display = 'block';
            this.isVisible = true;
        }
    }
    
    hide() {
        if (this.container) {
            this.container.style.display = 'none';
            this.isVisible = false;
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
    }
}