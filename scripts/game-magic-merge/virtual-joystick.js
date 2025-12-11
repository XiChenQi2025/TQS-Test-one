/**
 * 虚拟控制组件 - 优化版
 * 为移动设备提供方向控制，支持图标和标签
 */
export default class VirtualJoystick {
    constructor() {
        this.container = null;
        this.callbacks = {};
        this.isEnabled = true;
        this.buttons = new Map();
    }
    
    /**
     * 初始化虚拟控制
     */
    async init(options) {
        this.container = options.container;
        this.callbacks = options;
        
        if (!this.container) {
            console.error('虚拟控制容器不存在');
            return;
        }
        
        // 渲染控制界面（如果尚未渲染）
        if (this.container.children.length === 0) {
            this.render();
        }
        
        // 绑定事件
        this.bindEvents();
        
        console.log('🎮 虚拟控制组件已初始化');
    }
    
    /**
     * 渲染控制界面
     */
    render() {
        // 如果容器已经有内容，不需要重新渲染
        if (this.container.children.length > 0) return;
        
        console.log('渲染虚拟控制界面');
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
        const controlButtons = this.container.querySelectorAll('.control-btn');
        
        controlButtons.forEach(btn => {
            const direction = btn.dataset.direction;
            if (direction) {
                this.buttons.set(direction, btn);
                
                // 触摸事件
                btn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    if (!this.isEnabled) return;
                    
                    this.handleButtonPress(direction, btn);
                });
                
                btn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    this.handleButtonRelease(btn);
                });
                
                btn.addEventListener('touchcancel', (e) => {
                    e.preventDefault();
                    this.handleButtonRelease(btn);
                });
                
                // 鼠标事件（用于桌面端测试）
                btn.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    if (!this.isEnabled) return;
                    
                    this.handleButtonPress(direction, btn);
                });
                
                btn.addEventListener('mouseup', (e) => {
                    e.preventDefault();
                    this.handleButtonRelease(btn);
                });
                
                btn.addEventListener('mouseleave', () => {
                    this.handleButtonRelease(btn);
                });
            }
        });
    }
    
    /**
     * 处理按钮按下
     */
    handleButtonPress(direction, button) {
        if (!this.isEnabled) return;
        
        // 添加按下效果
        button.classList.add('pressed');
        
        // 添加按压动画
        this.animateButtonPress(button);
        
        // 触发回调
        if (this.callbacks.onMove) {
            this.callbacks.onMove(direction);
        }
        
        // 添加视觉反馈
        this.showDirectionFeedback(direction);
    }
    
    /**
     * 处理按钮释放
     */
    handleButtonRelease(button) {
        button.classList.remove('pressed');
    }
    
    /**
     * 动画效果
     */
    animateButtonPress(button) {
        // 重置动画
        button.style.animation = 'none';
        void button.offsetWidth; // 触发重绘
        button.style.animation = 'buttonPress 0.2s ease';
    }
    
    /**
     * 显示方向反馈
     */
    showDirectionFeedback(direction) {
        // 可以在这里添加方向提示效果
        // console.log(`移动方向: ${direction}`);
    }
    
    /**
     * 启用/禁用虚拟控制
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        
        this.buttons.forEach(btn => {
            btn.style.opacity = enabled ? '1' : '0.5';
            btn.style.cursor = enabled ? 'pointer' : 'not-allowed';
            btn.disabled = !enabled;
        });
    }
    
    /**
     * 清理资源
     */
    destroy() {
        this.buttons.forEach((btn, direction) => {
            btn.removeEventListener('touchstart', this.handleButtonPress);
            btn.removeEventListener('touchend', this.handleButtonRelease);
            btn.removeEventListener('touchcancel', this.handleButtonRelease);
            btn.removeEventListener('mousedown', this.handleButtonPress);
            btn.removeEventListener('mouseup', this.handleButtonRelease);
            btn.removeEventListener('mouseleave', this.handleButtonRelease);
        });
        
        this.buttons.clear();
        this.container = null;
        this.callbacks = {};
        
        console.log('🎮 虚拟控制组件已清理');
    }
}