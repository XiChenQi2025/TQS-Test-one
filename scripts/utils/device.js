/**
 * 设备检测器
 * 检测设备类型、浏览器、屏幕信息等
 */

class DeviceDetector {
    constructor() {
        this.userAgent = navigator.userAgent;
        this.platform = navigator.platform;
        this.language = navigator.language;
        this.screen = {
            width: window.screen.width,
            height: window.screen.height,
            orientation: this.getScreenOrientation(),
            pixelRatio: window.devicePixelRatio || 1
        };
        
        // 设备信息
        this.device = this.detectDevice();
        this.browser = this.detectBrowser();
        this.os = this.detectOS();
        this.isTouch = this.detectTouch();
        
        console.log('📱 设备检测器初始化:', this.getInfo());
    }
    
    /**
     * 检测设备类型
     */
    detectDevice() {
        const ua = this.userAgent.toLowerCase();
        
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
            return 'tablet';
        }
        
        if (/mobile|iphone|ipod|android|blackberry|opera mini|opera mobi|windows phone/i.test(ua)) {
            return 'mobile';
        }
        
        return 'desktop';
    }
    
    /**
     * 检测浏览器
     */
    detectBrowser() {
        const ua = this.userAgent;
        
        if (ua.includes('Chrome') && !ua.includes('Edg')) {
            return 'chrome';
        }
        
        if (ua.includes('Firefox')) {
            return 'firefox';
        }
        
        if (ua.includes('Safari') && !ua.includes('Chrome')) {
            return 'safari';
        }
        
        if (ua.includes('Edg')) {
            return 'edge';
        }
        
        if (ua.includes('Opera') || ua.includes('OPR')) {
            return 'opera';
        }
        
        if (ua.includes('MSIE') || ua.includes('Trident/')) {
            return 'ie';
        }
        
        return 'unknown';
    }
    
    /**
     * 检测操作系统
     */
    detectOS() {
        const ua = this.userAgent;
        const platform = this.platform;
        
        if (/android/i.test(ua)) {
            return 'android';
        }
        
        if (/iphone|ipad|ipod/i.test(ua)) {
            return 'ios';
        }
        
        if (/mac/i.test(platform)) {
            return 'macos';
        }
        
        if (/win/i.test(platform)) {
            return 'windows';
        }
        
        if (/linux/i.test(platform)) {
            return 'linux';
        }
        
        return 'unknown';
    }
    
    /**
     * 检测触摸设备
     */
    detectTouch() {
        return 'ontouchstart' in window || 
               navigator.maxTouchPoints > 0 ||
               navigator.msMaxTouchPoints > 0;
    }
    
    /**
     * 获取屏幕方向
     */
    getScreenOrientation() {
        if (window.screen.orientation) {
            return window.screen.orientation.type;
        }
        
        // 兼容旧浏览器
        return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    }
    
    /**
     * 获取设备信息
     */
    getInfo() {
        return {
            device: this.device,
            browser: this.browser,
            os: this.os,
            screen: { ...this.screen },
            language: this.language,
            isTouch: this.isTouch,
            userAgent: this.userAgent
        };
    }
    
    /**
     * 获取设备名称（可读格式）
     */
    getDeviceName() {
        const names = {
            desktop: '电脑',
            mobile: '手机',
            tablet: '平板'
        };
        
        return names[this.device] || this.device;
    }
    
    /**
     * 获取浏览器名称（可读格式）
     */
    getBrowserName() {
        const names = {
            chrome: 'Chrome',
            firefox: 'Firefox',
            safari: 'Safari',
            edge: 'Edge',
            opera: 'Opera',
            ie: 'Internet Explorer'
        };
        
        return names[this.browser] || this.browser;
    }
    
    /**
     * 获取操作系统名称（可读格式）
     */
    getOSName() {
        const names = {
            android: 'Android',
            ios: 'iOS',
            macos: 'macOS',
            windows: 'Windows',
            linux: 'Linux'
        };
        
        return names[this.os] || this.os;
    }
    
    /**
     * 检测是否为黑暗模式
     */
    isDarkMode() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    /**
     * 检测网络状态
     */
    isOnline() {
        return navigator.onLine;
    }
    
    /**
     * 检测是否支持WebGL
     */
    supportsWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && 
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }
    
    /**
     * 检测是否支持Canvas
     */
    supportsCanvas() {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext && canvas.getContext('2d'));
    }
    
    /**
     * 检测是否支持Web Storage
     */
    supportsStorage() {
        try {
            return 'localStorage' in window && window.localStorage !== null;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * 检测是否支持ES6模块
     */
    supportsES6Modules() {
        try {
            return 'noModule' in HTMLScriptElement.prototype;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * 获取网络信息
     */
    getNetworkInfo() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        if (!connection) {
            return {
                type: 'unknown',
                effectiveType: 'unknown',
                downlink: 0,
                rtt: 0,
                saveData: false,
                online: this.isOnline()
            };
        }
        
        return {
            type: connection.type || 'unknown',
            effectiveType: connection.effectiveType || 'unknown',
            downlink: connection.downlink || 0,
            rtt: connection.rtt || 0,
            saveData: connection.saveData || false,
            online: this.isOnline()
        };
    }
    
    /**
     * 获取电池信息（如果支持）
     */
    async getBatteryInfo() {
        if ('getBattery' in navigator) {
            try {
                const battery = await navigator.getBattery();
                return {
                    level: battery.level,
                    charging: battery.charging,
                    chargingTime: battery.chargingTime,
                    dischargingTime: battery.dischargingTime
                };
            } catch (error) {
                console.error('获取电池信息失败:', error);
            }
        }
        
        return null;
    }
    
    /**
     * 获取内存信息（如果支持）
     */
    getMemoryInfo() {
        if ('deviceMemory' in navigator) {
            return {
                deviceMemory: navigator.deviceMemory, // GB
                hardwareConcurrency: navigator.hardwareConcurrency || 0
            };
        }
        
        return null;
    }
    
    /**
     * 获取所有支持的功能
     */
    getSupportedFeatures() {
        return {
            webgl: this.supportsWebGL(),
            canvas: this.supportsCanvas(),
            storage: this.supportsStorage(),
            es6Modules: this.supportsES6Modules(),
            serviceWorker: 'serviceWorker' in navigator,
            pushNotifications: 'PushManager' in window,
            geolocation: 'geolocation' in navigator,
            notifications: 'Notification' in window,
            speechSynthesis: 'speechSynthesis' in window,
            webRTC: 'RTCPeerConnection' in window,
            webAudio: 'AudioContext' in window || 'webkitAudioContext' in window
        };
    }
    
    /**
     * 监听设备变化
     */
    addListeners() {
        const listeners = {};
        
        // 屏幕方向变化
        if (window.screen.orientation) {
            window.screen.orientation.addEventListener('change', () => {
                this.screen.orientation = this.getScreenOrientation();
                console.log('屏幕方向变化:', this.screen.orientation);
            });
        } else {
            window.addEventListener('resize', () => {
                this.screen.orientation = this.getScreenOrientation();
                console.log('屏幕方向变化:', this.screen.orientation);
            });
        }
        
        // 网络状态变化
        window.addEventListener('online', () => {
            console.log('网络状态: 在线');
        });
        
        window.addEventListener('offline', () => {
            console.log('网络状态: 离线');
        });
        
        // 黑暗模式变化
        if (window.matchMedia) {
            const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
            darkModeQuery.addEventListener('change', (e) => {
                console.log('黑暗模式变化:', e.matches ? '开启' : '关闭');
            });
        }
        
        return listeners;
    }
    
    /**
     * 获取设备推荐设置
     */
    getRecommendedSettings() {
        const settings = {
            // 触摸设备优化
            touchOptimized: this.isTouch,
            
            // 性能优化
            useWebGL: this.supportsWebGL() && this.device !== 'mobile',
            
            // 根据设备类型调整
            gameControls: this.isTouch ? 'touch' : 'mouse',
            
            // 根据网络调整
            loadStrategy: this.getNetworkInfo().effectiveType === '4g' ? 'aggressive' : 'conservative',
            
            // 根据屏幕大小调整
            uiScale: this.device === 'mobile' ? 'compact' : 'normal'
        };
        
        return settings;
    }
}

// 创建单例实例
const deviceDetector = new DeviceDetector();

// 导出实例
export default deviceDetector;