/**
 * 倒计时模块
 * 负责周年庆倒计时功能
 */
class CountdownManager {
    constructor() {
        this.targetDate = new Date(CONFIG.TIME.COUNTDOWN_TARGET);
        this.countdownElement = null;
        this.messageElement = null;
        this.intervalId = null;
        this.init();
    }
    
    init() {
        console.log('⏰ 倒计时模块初始化');
        
        // 监听页面变化，找到倒计时容器
        window.addEventListener('taoci:pageLoaded', (e) => {
            if (e.detail.pageId === 'home') {
                this.setupCountdown();
            }
        });
        
        // 立即尝试设置倒计时
        setTimeout(() => this.setupCountdown(), 100);
    }
    
    setupCountdown() {
        this.countdownElement = document.getElementById('countdown-section');
        if (!this.countdownElement) {
            console.warn('⏰ 未找到倒计时容器，等待页面加载');
            return;
        }
        
        // 创建倒计时显示
        this.countdownElement.innerHTML = this.renderCountdown();
        
        // 开始倒计时
        this.start();
    }
    
    renderCountdown() {
        return `
            <div class="countdown-container rainbow-border">
                <div class="countdown-header">
                    <h3 class="rainbow-text">
                        <i class="fas fa-clock"></i>
                        周年庆倒计时
                    </h3>
                    <span id="countdown-status" class="status-badge rainbow-bg">进行中</span>
                </div>
                
                <div class="countdown-display" id="countdown-display">
                    <div class="countdown-item">
                        <div class="countdown-value" id="countdown-days">00</div>
                        <div class="countdown-label">天</div>
                    </div>
                    <div class="countdown-item">
                        <div class="countdown-value" id="countdown-hours">00</div>
                        <div class="countdown-label">时</div>
                    </div>
                    <div class="countdown-item">
                        <div class="countdown-value" id="countdown-minutes">00</div>
                        <div class="countdown-label">分</div>
                    </div>
                    <div class="countdown-item">
                        <div class="countdown-value" id="countdown-seconds">00</div>
                        <div class="countdown-label">秒</div>
                    </div>
                </div>
                
                <p id="countdown-message" class="countdown-message rainbow-text">
                    距离桃汽水公主的周年庆直播还有
                </p>
            </div>
        `;
    }
    
    start() {
        // 清除之前的定时器
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        
        // 立即更新一次
        this.update();
        
        // 每秒更新一次
        this.intervalId = setInterval(() => this.update(), 1000);
    }
    
    update() {
        const now = new Date();
        const distance = this.targetDate - now;
        
        if (distance < 0) {
            this.showEventStarted();
            clearInterval(this.intervalId);
            return;
        }
        
        // 计算天、时、分、秒
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // 更新显示
        this.updateElement('countdown-days', days.toString().padStart(2, '0'));
        this.updateElement('countdown-hours', hours.toString().padStart(2, '0'));
        this.updateElement('countdown-minutes', minutes.toString().padStart(2, '0'));
        this.updateElement('countdown-seconds', seconds.toString().padStart(2, '0'));
        
        // 更新状态消息
        this.updateStatus(distance);
    }
    
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
    
    updateStatus(distance) {
        const statusElement = document.getElementById('countdown-status');
        const messageElement = document.getElementById('countdown-message');
        
        if (!statusElement || !messageElement) return;
        
        const hours24 = 24 * 60 * 60 * 1000;
        const hours72 = 72 * 60 * 60 * 1000;
        
        if (distance < hours24) {
            // 24小时内
            statusElement.textContent = '即将开始';
            statusElement.style.background = CONFIG.COLORS.GRADIENTS.RAINBOW;
            messageElement.textContent = '周年庆即将开始，准备好迎接惊喜了吗？';
            messageElement.style.animation = 'pulse 1s infinite';
        } else if (distance < hours72) {
            // 72小时内
            statusElement.textContent = '倒计时';
            statusElement.style.background = CONFIG.COLORS.GRADIENTS.PINK;
            messageElement.textContent = '周年庆即将到来，开始收集魔力吧！';
            messageElement.style.animation = 'none';
        } else {
            // 72小时以上
            statusElement.textContent = '进行中';
            statusElement.style.background = CONFIG.COLORS.GRADIENTS.SUNSET;
            messageElement.textContent = '距离桃汽水公主的周年庆直播还有';
            messageElement.style.animation = 'none';
        }
    }
    
    showEventStarted() {
        const countdownDisplay = document.getElementById('countdown-display');
        const statusElement = document.getElementById('countdown-status');
        const messageElement = document.getElementById('countdown-message');
        
        if (countdownDisplay) {
            countdownDisplay.innerHTML = `
                <div class="countdown-item">
                    <div class="countdown-value">🎉</div>
                    <div class="countdown-label">已开始</div>
                </div>
            `;
        }
        
        if (statusElement) {
            statusElement.textContent = '直播中';
            statusElement.style.background = CONFIG.COLORS.GRADIENTS.RAINBOW;
        }
        
        if (messageElement) {
            messageElement.textContent = '周年庆直播已开始！快来参与吧！';
            messageElement.style.animation = 'rainbow-text 2s infinite';
        }
        
        // 触发事件
        this.triggerEvent('eventStarted');
    }
    
    triggerEvent(eventName, data = {}) {
        const event = new CustomEvent(`taoci:countdown:${eventName}`, { detail: data });
        window.dispatchEvent(event);
    }
    
    // 获取剩余时间（秒）
    getRemainingTime() {
        const now = new Date();
        return Math.max(0, Math.floor((this.targetDate - now) / 1000));
    }
    
    // 格式化剩余时间
    getFormattedTime() {
        const seconds = this.getRemainingTime();
        const days = Math.floor(seconds / (24 * 60 * 60));
        const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((seconds % (60 * 60)) / 60);
        const secs = seconds % 60;
        
        return {
            days,
            hours,
            minutes,
            seconds: secs,
            totalSeconds: seconds
        };
    }
}

// 创建全局实例
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CountdownManager;
} else {
    window.CountdownManager = CountdownManager;
    
    // 自动初始化（如果配置启用）
    if (CONFIG && CONFIG.FEATURES.COUNTDOWN) {
        document.addEventListener('DOMContentLoaded', () => {
            window.countdownManager = new CountdownManager();
        });
    }
}
