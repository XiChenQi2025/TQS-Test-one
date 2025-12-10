/**
 * 炫酷彩虹进度条组件
 * 支持多种动画效果和花哨的彩虹样式
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
        this.particlesContainer = null;
        this.currentProgress = 0;
        this.isVisible = false;
        this.animationFrame = null;
        this.particles = [];
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
        if (!this.element) this.create();
        
        this.element.style.display = 'flex';
        setTimeout(() => {
            this.element.style.opacity = '1';
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
        
        return this;
    }
    
    /**
     * 隐藏进度条
     */
    hide() {
        if (!this.element) return this;
        
        this.element.style.opacity = '0';
        setTimeout(() => {
            if (this.element) {
                this.element.style.display = 'none';
            }
        }, 500);
        
        this.isVisible = false;
        
        // 停止粒子动画
        this.stopParticleAnimation();
        
        return this;
    }
    
    /**
     * 开始粒子动画
     */
    startParticleAnimation() {
        if (!this.config.showParticles) return;
        
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
     * 设置进度
     */
    setProgress(progress, message = '') {
        if (!this.element) this.create();
        
        // 限制范围
        this.currentProgress = Math.max(0, Math.min(100, progress));
        
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
        
        // 如果进度完成，自动隐藏
        if (this.config.autoHide && this.currentProgress >= 100) {
            this.complete();
        }
        
        return this;
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
        const newProgress = Math.min(100, this.currentProgress + amount);
        return this.setProgress(newProgress, message);
    }
    
    /**
     * 完成加载（特殊效果）
     */
    complete(message = '加载完成！🎉') {
        // 先设置100%
        this.setProgress(100, message);
        
        // 添加完成动画
        if (this.element) {
            this.element.classList.add('complete');
            
            // 添加庆祝效果
            this.addCelebrationEffects();
        }
        
        // 延迟隐藏
        if (this.config.autoHide) {
            setTimeout(() => {
                this.hide();
            }, this.config.hideDelay);
        }
        
        return this;
    }
    
    /**
     * 添加庆祝效果
     */
    addCelebrationEffects() {
        // 添加庆祝类
        this.element.classList.add('celebrating');
        
        // 创建爆炸效果
        if (this.config.showParticles) {
            this.createExplosionEffect();
        }
        
        // 播放声音（可选）
        if (typeof Audio !== 'undefined') {
            try {
                // 这里可以添加一个微小的完成音效
                // const audio = new Audio('path/to/success.mp3');
                // audio.volume = 0.3;
                // audio.play();
            } catch (error) {
                console.log('无法播放音效');
            }
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
            
            particle.style.animation = `none`;
            particle.style.transition = `all ${duration}s ease-out`;
            particle.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;
            particle.style.opacity = '0';
            
            // 重置粒子
            setTimeout(() => {
                particle.style.transition = '';
                particle.style.transform = '';
                particle.style.opacity = '1';
            }, duration * 1000 + 100);
        });
    }
    
    /**
     * 模拟逐步加载
     */
    simulate(steps = 10, interval = 100, finalMessage = '加载完成！') {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        let currentStep = 0;
        const stepSize = 100 / steps;
        
        const animate = () => {
            if (currentStep <= steps) {
                const progress = Math.min(currentStep * stepSize, 100);
                const message = currentStep < steps ? 
                    `正在加载... ${Math.round(progress)}%` : 
                    finalMessage;
                
                this.setProgress(progress, message);
                currentStep++;
                
                this.animationFrame = requestAnimationFrame(() => {
                    setTimeout(animate, interval);
                });
            } else {
                this.complete(finalMessage);
            }
        };
        
        animate();
        return this;
    }
    
    /**
     * 模拟网络请求加载
     */
    simulateNetworkRequest(requestTime = 2000) {
        this.reset();
        this.show('正在连接到服务器...');
        
        // 模拟网络延迟
        setTimeout(() => {
            this.setProgress(20, '正在验证用户信息...');
        }, 300);
        
        setTimeout(() => {
            this.setProgress(45, '正在加载游戏资源...');
        }, 800);
        
        setTimeout(() => {
            this.setProgress(70, '正在初始化游戏引擎...');
        }, 1300);
        
        setTimeout(() => {
            this.setProgress(90, '正在完成加载...');
        }, 1600);
        
        setTimeout(() => {
            this.complete('游戏加载完成！');
        }, requestTime);
        
        return this;
    }
    
    /**
     * 重置进度条
     */
    reset() {
        if (this.element) {
            this.element.classList.remove('complete', 'celebrating');
        }
        
        this.setProgress(0, '正在加载...');
        
        // 重置粒子
        if (this.particlesContainer) {
            this.particles.forEach(particle => {
                particle.style.transform = '';
                particle.style.opacity = '1';
                particle.style.animation = '';
            });
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
        return this.isVisible;
    }
    
    /**
     * 销毁进度条
     */
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        
        this.element = null;
        this.progressFill = null;
        this.textElement = null;
        this.messageElement = null;
        this.iconElement = null;
        this.particlesContainer = null;
        this.particles = [];
        this.isVisible = false;
        
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
