/**
 * 虚拟控制组件
 * 为移动设备提供方向控制
 */
export default class VirtualJoystick {
    constructor() {
        this.container = null;
        this.callbacks = {};
        this.isEnabled = true;
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
        
        // 渲染控制界面
        this.render();
        
        // 绑定事件
        this.bindEvents();
        
        console.log('🎮 虚拟控制组件已初始化');
    }
    
    /**
     * 渲染控制界面
     */
    render() {
        // 虚拟控制已经在主模块中渲染，这里只需要绑定事件
        console.log('虚拟控制界面已渲染');
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
        const controlButtons = this.container.querySelectorAll('.control-btn');
        controlButtons.forEach(btn => {
            // 触摸事件
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (!this.isEnabled) return;
                
                const direction = btn.dataset.direction;
                this.handleButtonPress(direction, btn);
            });
            
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.handleButtonRelease(btn);
            });
            
            // 鼠标事件（用于桌面端测试）
            btn.addEventListener('mousedown', (e) => {
                e.preventDefault();
                if (!this.isEnabled) return;
                
                const direction = btn.dataset.direction;
                this.handleButtonPress(direction, btn);
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
    
    /**
     * 处理按钮按下
     */
    handleButtonPress(direction, button) {
        if (!this.isEnabled) return;
        
        // 添加按下效果
        button.classList.add('pressed');
        
        // 触发回调
        if (this.callbacks.onMove) {
            this.callbacks.onMove(direction);
        }
        
        // 添加动画效果
        this.animateButtonPress(button);
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
        // 添加脉冲动画
        button.style.animation = 'none';
        setTimeout(() => {
            button.style.animation = 'pulse 0.3s ease';
        }, 10);
    }
    
    /**
     * 启用/禁用虚拟控制
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        
        const buttons = this.container.querySelectorAll('.control-btn');
        buttons.forEach(btn => {
            btn.style.opacity = enabled ? '1' : '0.5';
            btn.style.cursor = enabled ? 'pointer' : 'not-allowed';
        });
    }
    
    /**
     * 清理资源
     */
    destroy() {
        const buttons = this.container.querySelectorAll('.control-btn');
        buttons.forEach(btn => {
            btn.removeEventListener('touchstart', this.handleButtonPress);
            btn.removeEventListener('touchend', this.handleButtonRelease);
        });
        
        console.log('🎮 虚拟控制组件已清理');
    }
}