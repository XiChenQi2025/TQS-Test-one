/**
 * 炫酷彩虹进度条组件 - 修复版
 * 修复了进度条不隐藏的问题
 */
export default class RainbowLoadingBar {
    constructor(options = {}) {
        // 默认配置 - 花哨彩虹主题
        this.config = {
            // 基本配置
            position: 'top',          // top | bottom | center | floating
            height: '6px',            // 进度条高度
            theme: 'rainbow-glitter', // rainbow-glitter | cosmic | neon | galaxy
            animation: 'flow',        // flow | pulse | wave | spiral | sparkle
            
            // 显示配置
            showPercentage: true,     // 显示百分比
            showMessage: true,        // 显示消息
            showIcon: true,           // 显示图标
            showParticles: true,      // 显示粒子效果
            
            // 动画配置
            autoHide: true,           // 完成后自动隐藏
            hideDelay: 800,           // 隐藏延迟（ms）
            zIndex: 9999,             // z-index
            
            // 花哨配置
            glowEffect: true,         // 发光效果
            shadowEffect: true,       // 阴影效果
            borderEffect: true,       // 边框效果
            particleCount: 8,         // 粒子数量
            
            // 颜色配置（彩虹色系）
            colors: [
                '#FF6EFF',  // 桃粉
                '#FF5E7D',  // 玫红
                '#FFEE58',  // 明黄
                '#6EFF7A',  // 荧光绿
                '#5ED1FF',  // 天蓝
                '#B26EFF',  // 紫色
                '#FFA75E'   // 橙色
            ],
            
            ...options
        };
        
        this.element = null;
        this.progressBar = null;
        this.progressFill = null;
        this.textElement = null;
        this.iconElement = null;
        this.messageElement = null;
        this.particlesContainer = null;
        
        // 状态管理 - 修复关键
        this.currentProgress = 0;
        this.isVisible = false;
        this.isCompleting = false;    // 防止重复完成
        this.isHidden = false;        // 跟踪隐藏状态
        this.animationFrame = null;
        this.particles = [];
        this.hideTimer = null;        // 隐藏定时器
    }
    
    /**
     * 创建进度条
     */
    create() {
        if (this.element) return this.element;
        
        // 创建主容器
        this.element = document.createElement('div');
        this.element.className = 'rainbow-loading-bar';
        
        // 添加主题类
        this.element.classList.add(`theme-${this.config.theme}`);
        this.element.classList.add(`animation-${this.config.animation}`);
        
        // 添加位置类
        const positionClass = `position-${this.config.position}`;
        this.element.classList.add(positionClass);
        
        // 创建进度条容器
        const progressContainer = document.createElement('div');
        progressContainer.className = 'loading-progress-container';
        
        // 创建进度条背景
        const progressBackground = document.createElement('div');
        progressBackground.className = 'loading-progress-bg';
        progressContainer.appendChild(progressBackground);
        
        // 创建进度条填充
        this.progressFill = document.createElement('div');
        this.progressFill.className = 'loading-progress-fill';
        progressContainer.appendChild(this.progressFill);
        
        // 创建进度条前景（用于特殊效果）
        const progressForeground = document.createElement('div');
        progressForeground.className = 'loading-progress-foreground';
        progressContainer.appendChild(progressForeground);
        
        // 创建发光效果
        if (this.config.glowEffect) {
            const glowElement = document.createElement('div');
            glowElement.className = 'loading-glow';
            progressContainer.appendChild(glowElement);
        }
        
        // 创建文字容器
        const textContainer = document.createElement('div');
        textContainer.className = 'loading-text-container';
        
        // 创建图标
        if (this.config.showIcon) {
            this.iconElement = document.createElement('div');
            this.iconElement.className = 'loading-icon';
            this.iconElement.innerHTML = this.getThemeIcon();
            textContainer.appendChild(this.iconElement);
        }
        
        // 创建百分比文字
        if (this.config.showPercentage) {
            this.textElement = document.createElement('div');
            this.textElement.className = 'loading-percentage';
            this.textElement.innerHTML = '<span class="percentage-number">0</span><span class="percentage-symbol">%</span>';
            textContainer.appendChild(this.textElement);
        }
        
        // 创建消息文字
        if (this.config.showMessage) {
            this.messageElement = document.createElement('div');
            this.messageElement.className = 'loading-message';
            this.messageElement.textContent = '正在加载...';
            textContainer.appendChild(this.messageElement);
        }
        
        // 创建粒子容器
        if (this.config.showParticles) {
            this.particlesContainer = document.createElement('div');
            this.particlesContainer.className = 'loading-particles';
            progressContainer.appendChild(this.particlesContainer);
        }
        
        // 组装元素
        progressContainer.appendChild(textContainer);
        this.element.appendChild(progressContainer);
        
        // 添加到body
        document.body.appendChild(this.element);
        
        // 设置初始状态
        this.element.style.opacity = '0';
        this.element.style.display = 'none';
        
        // 创建粒子
        if (this.config.showParticles) {
            this.createParticles();
        }
        
        console.log('🌈 彩虹进度条组件已创建');
        return this.element;
    }
    
    /**
     * 创建粒子效果
     */
    createParticles() {
        if (!this.particlesContainer) return;
        
        for (let i = 0; i < this.config.particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'loading-particle';
            particle.style.setProperty('--particle-index', i);
            particle.style.setProperty('--particle-color', this.config.colors[i % this.config.colors.length]);
            
            // 随机大小和位置
            const size = 2 + Math.random() * 4;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            this.particlesContainer.appendChild(particle);
            this.particles.push(particle);
        }
    }
    
    /**
     * 获取主题图标
     */
    getThemeIcon() {
        const icons = {
            'rainbow-glitter': '✨',
            'cosmic': '🌌',
            'neon': '💡',
            'galaxy': '🌠',
            'default': '⚡'
        };
        return icons[this.config.theme] || icons.default;
    }
    
    /**
     * 显示进度条
     */
    show(message = '正在加载...') {
        if (this.isHidden) {
            // 如果之前被隐藏了，先重置状态
            this.isHidden = false;
            this.isCompleting = false;
        }
        
        if (!this.element) this.create();
        
        // 重置完成状态
        if (this.element) {
            this.element.classList.remove('complete', 'celebrating');
        }
        
        this.element.style.display = 'flex';
        setTimeout(() => {
            if (this.element && !this.isHidden) {
                this.element.style.opacity = '1';
            }
        }, 10);
        
        this.isVisible = true;
        
        // 更新消息
        if (message && this.messageElement) {
            this.messageElement.textContent = message;
        }
        
        // 开始粒子动画
        if (this.config.showParticles) {
            this.startParticleAnimation();
        }
        
        // 重置当前进度
        this.currentProgress = 0;
        if (this.progressFill) {
            this.progressFill.style.width = '0%';
        }
        
        return this;
    }
    
    /**
     * 隐藏进度条
     */
    hide() {
        if (!this.element || this.isHidden) return this;
        
        this.isHidden = true;
        this.isVisible = false;
        
        // 停止粒子动画
        this.stopParticleAnimation();
        
        // 清除隐藏定时器
        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
            this.hideTimer = null;
        }
        
        // 淡出动画
        this.element.style.opacity = '0';
        this.element.style.transition = 'opacity 0.5s ease';
        
        // 延迟后真正隐藏
        setTimeout(() => {
            if (this.element && this.element.parentNode && this.isHidden) {
                this.element.style.display = 'none';
                this.element.classList.remove('complete', 'celebrating');
            }
        }, 500);
        
        return this;
    }
    
    /**
     * 开始粒子动画
     */
    startParticleAnimation() {
        if (!this.config.showParticles || !this.particlesContainer) return;
        
        this.stopParticleAnimation();
        
        this.particles.forEach((particle, index) => {
            const delay = index * 0.1;
            particle.style.animation = `particleFloat 2s ease-in-out ${delay}s infinite`;
        });
    }
    
    /**
     * 停止粒子动画
     */
    stopParticleAnimation() {
        this.particles.forEach(particle => {
            particle.style.animation = 'none';
        });
    }
    
    /**
     * 设置进度 - 修复关键：防止递归调用
     */
    setProgress(progress, message = '') {
        if (!this.element) this.create();
        
        // 如果正在完成或已隐藏，不更新进度
        if (this.isCompleting || this.isHidden) return this;
        
        // 限制范围
        progress = Math.max(0, Math.min(100, progress));
        this.currentProgress = progress;
        
        // 更新进度条
        if (this.progressFill) {
            this.progressFill.style.width = `${this.currentProgress}%`;
            
            // 更新颜色（根据进度变化）
            this.updateProgressColor();
        }
        
        // 更新百分比
        if (this.textElement) {
            const numberElement = this.textElement.querySelector('.percentage-number');
            if (numberElement) {
                numberElement.textContent = Math.round(this.currentProgress);
                
                // 添加数字变化动画
                numberElement.classList.add('number-update');
                setTimeout(() => {
                    numberElement.classList.remove('number-update');
                }, 300);
            }
        }
        
        // 更新消息
        if (message && this.messageElement) {
            this.messageElement.textContent = message;
        }
        
        // 如果进度完成，自动隐藏 - 修复：防止递归
        if (this.config.autoHide && progress >= 100 && !this.isCompleting) {
            // 标记为正在完成，防止重复调用
            this.isCompleting = true;
            
            // 延迟一小段时间后执行完成动画
            setTimeout(() => {
                this.performComplete('加载完成！🎉');
            }, 300);
        }
        
        return this;
    }
    
    /**
     * 执行完成动画 - 新增方法，分离逻辑
     */
    performComplete(message = '加载完成！🎉') {
        if (!this.element || this.isHidden) return;
        
        // 确保进度是100%
        if (this.progressFill) {
            this.progressFill.style.width = '100%';
        }
        
        // 更新消息
        if (this.messageElement) {
            this.messageElement.textContent = message;
        }
        
        // 添加完成类
        this.element.classList.add('complete');
        
        // 添加庆祝效果
        this.addCelebrationEffects();
        
        // 延迟隐藏
        if (this.config.autoHide && this.config.hideDelay > 0) {
            // 清除之前的定时器
            if (this.hideTimer) {
                clearTimeout(this.hideTimer);
            }
            
            this.hideTimer = setTimeout(() => {
                this.hide();
                this.isCompleting = false;
            }, this.config.hideDelay);
        } else {
            this.isCompleting = false;
        }
    }
    
    /**
     * 更新进度条颜色
     */
    updateProgressColor() {
        if (!this.progressFill) return;
        
        const progress = this.currentProgress;
        const colorCount = this.config.colors.length;
        const segment = 100 / colorCount;
        
        // 根据进度选择颜色
        const colorIndex = Math.floor(progress / segment);
        const nextColorIndex = (colorIndex + 1) % colorCount;
        const blendRatio = (progress % segment) / segment;
        
        if (colorIndex < colorCount) {
            const currentColor = this.config.colors[colorIndex];
            const nextColor = this.config.colors[nextColorIndex];
            
            // 创建渐变颜色
            const gradientColor = this.blendColors(currentColor, nextColor, blendRatio);
            this.progressFill.style.backgroundColor = gradientColor;
            
            // 更新CSS变量
            this.element.style.setProperty('--current-progress', `${progress}%`);
            this.element.style.setProperty('--current-color', gradientColor);
        }
    }
    
    /**
     * 混合颜色
     */
    blendColors(color1, color2, ratio) {
        // 简单的颜色混合
        const hex = color => color.replace('#', '');
        const r1 = parseInt(hex(color1).substring(0, 2), 16);
        const g1 = parseInt(hex(color1).substring(2, 4), 16);
        const b1 = parseInt(hex(color1).substring(4, 6), 16);
        
        const r2 = parseInt(hex(color2).substring(0, 2), 16);
        const g2 = parseInt(hex(color2).substring(2, 4), 16);
        const b2 = parseInt(hex(color2).substring(4, 6), 16);
        
        const r = Math.round(r1 + (r2 - r1) * ratio);
        const g = Math.round(g1 + (g2 - g1) * ratio);
        const b = Math.round(b1 + (b2 - b1) * ratio);
        
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    /**
     * 增量更新进度
     */
    increment(amount = 10, message = '') {
        // 如果正在完成，不更新
        if (this.isCompleting) return this;
        
        const newProgress = Math.min(100, this.currentProgress + amount);
        return this.setProgress(newProgress, message);
    }
    
    /**
     * 完成加载（特殊效果）- 修复：直接调用完成方法
     */
    complete(message = '加载完成！🎉') {
        // 如果已经在完成过程中，直接返回
        if (this.isCompleting) return this;
        
        this.isCompleting = true;
        
        // 直接设置进度为100%
        if (this.progressFill) {
            this.progressFill.style.width = '100%';
        }
        
        this.currentProgress = 100;
        
        // 更新消息
        if (this.messageElement) {
            this.messageElement.textContent = message;
        }
        
        // 执行完成动画
        this.performComplete(message);
        
        return this;
    }
    
    /**
     * 添加庆祝效果
     */
    addCelebrationEffects() {
        if (!this.element || this.isHidden) return;
        
        // 添加庆祝类
        this.element.classList.add('celebrating');
        
        // 创建爆炸效果
        if (this.config.showParticles && this.particlesContainer) {
            this.createExplosionEffect();
        }
    }
    
    /**
     * 创建爆炸效果
     */
    createExplosionEffect() {
        if (!this.particlesContainer) return;
        
        // 让所有粒子爆炸
        this.particles.forEach((particle, index) => {
            const angle = (index / this.particles.length) * Math.PI * 2;
            const distance = 50 + Math.random() * 100;
            const duration = 0.5 + Math.random() * 0.5;
            
            particle.style.animation = 'none';
            particle.style.transition = `all ${duration}s ease-out`;
            particle.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;
            particle.style.opacity = '0';
            
            // 重置粒子
            setTimeout(() => {
                if (particle && particle.style) {
                    particle.style.transition = '';
                    particle.style.transform = '';
                    particle.style.opacity = '1';
                }
            }, duration * 1000 + 100);
        });
    }
    
    /**
     * 模拟逐步加载
     */
    simulate(steps = 10, interval = 100, finalMessage = '加载完成！') {
        // 清除之前的动画帧
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        // 重置状态
        this.isCompleting = false;
        this.currentProgress = 0;
        
        let currentStep = 0;
        const stepSize = 100 / steps;
        
        const animate = () => {
            // 如果已隐藏或正在完成，停止模拟
            if (this.isHidden || this.isCompleting) return;
            
            if (currentStep <= steps) {
                const progress = Math.min(currentStep * stepSize, 100);
                const message = currentStep < steps ? 
                    `正在加载... ${Math.round(progress)}%` : 
                    finalMessage;
                
                this.setProgress(progress, message);
                currentStep++;
                
                // 使用setTimeout而不是requestAnimationFrame，避免递归问题
                this.animationFrame = setTimeout(() => {
                    animate();
                }, interval);
            } else {
                // 模拟完成
                this.complete(finalMessage);
            }
        };
        
        animate();
        return this;
    }
    
    /**
     * 模拟网络请求加载 - 修复：使用新的完成逻辑
     */
    simulateNetworkRequest(requestTime = 2000) {
        // 重置状态
        this.reset();
        this.show('正在连接到服务器...');
        
        // 使用时间戳确保精确控制
        const startTime = Date.now();
        const endTime = startTime + requestTime;
        
        // 清除之前的定时器
        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
        }
        
        // 模拟网络延迟
        const updateProgress = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(100, (elapsed / requestTime) * 100);
            
            // 根据进度更新消息
            let message = '';
            if (progress < 20) {
                message = '正在连接到服务器...';
            } else if (progress < 45) {
                message = '正在验证用户信息...';
            } else if (progress < 70) {
                message = '正在加载游戏资源...';
            } else if (progress < 90) {
                message = '正在初始化游戏引擎...';
            } else {
                message = '正在完成加载...';
            }
            
            this.setProgress(progress, message);
            
            // 如果还没完成，继续更新
            if (progress < 100 && !this.isCompleting && !this.isHidden) {
                setTimeout(updateProgress, 50);
            }
        };
        
        // 开始更新进度
        setTimeout(updateProgress, 0);
        
        // 设置完成时间
        this.hideTimer = setTimeout(() => {
            if (!this.isCompleting && !this.isHidden) {
                this.complete('游戏加载完成！');
            }
        }, requestTime);
        
        return this;
    }
    
    /**
     * 重置进度条
     */
    reset() {
        // 清除所有定时器
        if (this.animationFrame) {
            clearTimeout(this.animationFrame);
            this.animationFrame = null;
        }
        
        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
            this.hideTimer = null;
        }
        
        // 重置状态
        this.isCompleting = false;
        this.isHidden = false;
        this.currentProgress = 0;
        
        // 重置元素
        if (this.element) {
            this.element.classList.remove('complete', 'celebrating');
            this.element.style.opacity = '0';
            this.element.style.display = 'none';
        }
        
        // 重置进度条
        if (this.progressFill) {
            this.progressFill.style.width = '0%';
        }
        
        // 重置粒子
        if (this.particlesContainer) {
            this.particles.forEach(particle => {
                if (particle && particle.style) {
                    particle.style.transform = '';
                    particle.style.opacity = '1';
                    particle.style.animation = '';
                }
            });
        }
        
        // 重置消息
        if (this.messageElement) {
            this.messageElement.textContent = '正在加载...';
        }
        
        return this;
    }
    
    /**
     * 切换主题
     */
    setTheme(theme) {
        if (!this.element) return this;
        
        // 移除旧主题类
        const themeClasses = ['theme-rainbow-glitter', 'theme-cosmic', 'theme-neon', 'theme-galaxy'];
        themeClasses.forEach(cls => this.element.classList.remove(cls));
        
        // 添加新主题类
        this.element.classList.add(`theme-${theme}`);
        this.config.theme = theme;
        
        // 更新图标
        if (this.iconElement) {
            this.iconElement.innerHTML = this.getThemeIcon();
        }
        
        return this;
    }
    
    /**
     * 切换动画
     */
    setAnimation(animation) {
        if (!this.element) return this;
        
        // 移除旧动画类
        const animationClasses = ['animation-flow', 'animation-pulse', 'animation-wave', 'animation-spiral', 'animation-sparkle'];
        animationClasses.forEach(cls => this.element.classList.remove(cls));
        
        // 添加新动画类
        this.element.classList.add(`animation-${animation}`);
        this.config.animation = animation;
        
        return this;
    }
    
    /**
     * 更新配置
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        // 重新创建进度条以应用新配置
        if (this.element) {
            this.destroy();
            this.create();
        }
        
        return this;
    }
    
    /**
     * 获取当前进度
     */
    getProgress() {
        return this.currentProgress;
    }
    
    /**
     * 检查是否可见
     */
    isShowing() {
        return this.isVisible && !this.isHidden;
    }
    
    /**
     * 销毁进度条
     */
    destroy() {
        // 清除所有定时器
        if (this.animationFrame) {
            clearTimeout(this.animationFrame);
            this.animationFrame = null;
        }
        
        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
            this.hideTimer = null;
        }
        
        // 停止粒子动画
        this.stopParticleAnimation();
        
        // 移除元素
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        
        // 重置所有状态
        this.element = null;
        this.progressFill = null;
        this.textElement = null;
        this.messageElement = null;
        this.iconElement = null;
        this.particlesContainer = null;
        this.particles = [];
        this.isVisible = false;
        this.isHidden = true;
        this.isCompleting = false;
        this.currentProgress = 0;
        
        console.log('🌈 彩虹进度条组件已销毁');
    }
}

// 创建全局单例实例
let globalRainbowLoadingBar = null;

/**
 * 获取全局彩虹进度条实例
 */
export function getRainbowLoadingBar(config = {}) {
    if (!globalRainbowLoadingBar) {
        globalRainbowLoadingBar = new RainbowLoadingBar(config);
    }
    return globalRainbowLoadingBar;
}

/**
 * 创建新的彩虹进度条实例
 */
export function createRainbowLoadingBar(config = {}) {
    return new RainbowLoadingBar(config);
}

/**
 * 快捷方法
 */
export const rainbowLoading = {
    show: (message) => getRainbowLoadingBar().show(message),
    hide: () => getRainbowLoadingBar().hide(),
    setProgress: (progress, message) => getRainbowLoadingBar().setProgress(progress, message),
    increment: (amount, message) => getRainbowLoadingBar().increment(amount, message),
    complete: (message) => getRainbowLoadingBar().complete(message),
    simulate: (steps, interval, message) => getRainbowLoadingBar().simulate(steps, interval, message),
    simulateNetwork: (time) => getRainbowLoadingBar().simulateNetworkRequest(time),
    reset: () => getRainbowLoadingBar().reset(),
    setTheme: (theme) => getRainbowLoadingBar().setTheme(theme),
    setAnimation: (animation) => getRainbowLoadingBar().setAnimation(animation),
    destroy: () => getRainbowLoadingBar().destroy()
};

// 添加到全局对象
if (typeof window !== 'undefined') {
    window.RainbowLoading = rainbowLoading;
}
