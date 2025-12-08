/**
 * 配置管理器
 * 负责加载、管理和更新应用配置
 */

class ConfigManager {
    constructor() {
        // 防止重复实例化
        if (ConfigManager.instance) {
            return ConfigManager.instance;
        }
        
        this.config = null;
        this.listeners = new Map(); // 配置变更监听器
        ConfigManager.instance = this;
        
        console.log('⚙️ 配置管理器初始化');
    }
    
    /**
     * 加载配置
     */
    async load() {
        try {
            // 尝试从本地存储加载缓存配置
            const cachedConfig = this.loadFromCache();
            if (cachedConfig) {
                this.config = cachedConfig;
                console.log('✅ 从缓存加载配置');
            } else {
                // 加载默认配置
                this.config = this.getDefaultConfig();
                console.log('✅ 使用默认配置');
            }
            
            // 应用配置到CSS变量
            this.applyToCSS();
            
            // 保存到缓存
            this.saveToCache();
            
            return this.config;
        } catch (error) {
            console.error('配置加载失败:', error);
            this.config = this.getDefaultConfig();
            return this.config;
        }
    }
    
    /**
     * 获取默认配置
     */
    getDefaultConfig() {
        return {
            // 项目信息
            PROJECT: {
                NAME: "桃汽水の魔力补给站",
                VERSION: "1.0.0",
                DESCRIPTION: "异世界精灵公主桃汽水的周年庆典互动网站"
            },
            
            // 角色设定
            CHARACTER: {
                NAME: "桃汽水",
                TITLE: "精灵公主",
                PERSONALITY: "活泼可爱，偶尔调皮",
                QUOTE: "契约者们，准备好收集魔力了吗？"
            },
            
            // 时间配置
            TIME: {
                ANNOUNCEMENT_DATE: "2025-12-10T00:00:00",
                EVENT_START: "2025-12-25T19:00:00",
                EVENT_END: "2025-12-31T23:59:59",
                COUNTDOWN_TARGET: "2025-12-25T19:00:00"
            },
            
            // 功能开关
            FEATURES: {
                GAMES: true,
                LOTTERY: true,
                RANKING: true,
                MESSAGES: true,
                COUNTDOWN: true
            },
            
            // 积分系统
            POINTS: {
                INITIAL: 1000,
                DAILY_LIMIT: 5000,
                LOTTERY_COST: 500,
                DAILY_FREE_SPINS: 1
            },
            
            // 游戏配置
            GAMES: {
                BUBBLE: {
                    NAME: "魔力泡泡",
                    DESCRIPTION: "帮桃汽水收集飘散的魔力泡泡！",
                    ICON: "🫧"
                },
                RUNE: {
                    NAME: "符文快闪",
                    DESCRIPTION: "快速咏唱正确的咒语符文！",
                    ICON: "✨"
                },
                ENERGY: {
                    NAME: "能量蓄力",
                    DESCRIPTION: "为桃汽水的魔法阵蓄满能量！",
                    ICON: "⚡"
                }
            },
            
            // API配置
            API: {
                BASE_URL: "https://api.example.com",
                VERSION: "v1",
                OFFLINE_MODE: true
            },
            
            // 本地存储配置
            STORAGE: {
                PREFIX: "taoci_",
                EXPIRY_DAYS: 30
            }
            
            API: {
                BASE_URL: 'https://your-server.com/api',
                REQUEST: {
                    TIMEOUT: 10000,      // 请求超时时间（毫秒）
                    MAX_RETRIES: 3       // 最大重试次数
                },
                OFFLINE_MODE: true,      // 启用离线模式
                MOCK_DATA: false         // 强制使用模拟数据（开发用）
            }
        };
    }
    
    /**
     * 获取配置值
     * @param {string} path - 配置路径，如 "PROJECT.NAME"
     * @param {any} defaultValue - 默认值
     */
    get(path, defaultValue = null) {
        if (!this.config) {
            console.warn('配置尚未加载');
            return defaultValue;
        }
        
        const keys = path.split('.');
        let value = this.config;
        
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return defaultValue;
            }
        }
        
        return value;
    }
    
    /**
     * 设置配置值
     * @param {string} path - 配置路径
     * @param {any} value - 配置值
     */
    set(path, value) {
        if (!this.config) {
            console.warn('配置尚未加载');
            return false;
        }
        
        const keys = path.split('.');
        const lastKey = keys.pop();
        let target = this.config;
        
        // 遍历到目标对象
        for (const key of keys) {
            if (!(key in target)) {
                target[key] = {};
            }
            target = target[key];
        }
        
        // 保存旧值
        const oldValue = target[lastKey];
        
        // 设置新值
        target[lastKey] = value;
        
        // 触发变更事件
        this.emitChange(path, value, oldValue);
        
        // 保存到缓存
        this.saveToCache();
        
        // 如果改变了主题配置，重新应用CSS变量
        if (path.startsWith('THEME.')) {
            this.applyToCSS();
        }
        
        return true;
    }
    
    /**
     * 监听配置变更
     * @param {string} path - 配置路径
     * @param {Function} callback - 回调函数
     * @returns {Function} 取消监听的函数
     */
    onChange(path, callback) {
        if (!this.listeners.has(path)) {
            this.listeners.set(path, []);
        }
        
        this.listeners.get(path).push(callback);
        
        // 返回取消监听的函数
        return () => {
            const listeners = this.listeners.get(path);
            if (listeners) {
                const index = listeners.indexOf(callback);
                if (index > -1) {
                    listeners.splice(index, 1);
                }
            }
        };
    }
    
    /**
     * 触发配置变更事件
     */
    emitChange(path, newValue, oldValue) {
        if (this.listeners.has(path)) {
            this.listeners.get(path).forEach(callback => {
                try {
                    callback(newValue, oldValue);
                } catch (error) {
                    console.error(`配置变更回调错误 (${path}):`, error);
                }
            });
        }
    }
    
    /**
     * 从缓存加载配置
     */
    loadFromCache() {
        try {
            const cached = localStorage.getItem('taoci_config');
            if (!cached) return null;
            
            const config = JSON.parse(cached);
            
            // 检查是否过期（默认30天）
            const expiry = localStorage.getItem('taoci_config_expiry');
            if (expiry && Date.now() > parseInt(expiry)) {
                localStorage.removeItem('taoci_config');
                localStorage.removeItem('taoci_config_expiry');
                return null;
            }
            
            return config;
        } catch (error) {
            console.error('加载缓存配置失败:', error);
            return null;
        }
    }
    
    /**
     * 保存配置到缓存
     */
    saveToCache() {
        if (!this.config) return;
        
        try {
            localStorage.setItem('taoci_config', JSON.stringify(this.config));
            
            // 设置30天过期
            const expiry = Date.now() + (30 * 24 * 60 * 60 * 1000);
            localStorage.setItem('taoci_config_expiry', expiry.toString());
            
            console.log('✅ 配置已保存到缓存');
        } catch (error) {
            console.error('保存配置到缓存失败:', error);
        }
    }
    
    /**
     * 应用配置到CSS变量
     */
    applyToCSS() {
        const root = document.documentElement;
        
        // 应用主色调
        root.style.setProperty('--primary', 'rgba(255, 110, 255, 0.85)');
        root.style.setProperty('--primary-light', 'rgba(255, 153, 255, 0.7)');
        root.style.setProperty('--primary-dark', 'rgba(230, 92, 230, 0.8)');
        
        // 应用辅助色
        root.style.setProperty('--red', 'rgba(255, 94, 125, 0.75)');
        root.style.setProperty('--green', 'rgba(110, 255, 122, 0.75)');
        root.style.setProperty('--yellow', 'rgba(255, 238, 88, 0.75)');
        root.style.setProperty('--purple', 'rgba(178, 110, 255, 0.75)');
        root.style.setProperty('--blue', 'rgba(94, 209, 255, 0.75)');
        root.style.setProperty('--orange', 'rgba(255, 167, 94, 0.75)');
        
        console.log('✅ CSS变量已应用');
    }
    
    /**
     * 重置为默认配置
     */
    resetToDefault() {
        this.config = this.getDefaultConfig();
        this.saveToCache();
        this.applyToCSS();
        console.log('✅ 配置已重置为默认值');
    }
    
    /**
     * 导出配置
     */
    exportConfig() {
        return JSON.stringify(this.config, null, 2);
    }
    
    /**
     * 导入配置
     */
    importConfig(configString) {
        try {
            const newConfig = JSON.parse(configString);
            this.config = newConfig;
            this.saveToCache();
            this.applyToCSS();
            console.log('✅ 配置已导入');
            return true;
        } catch (error) {
            console.error('导入配置失败:', error);
            return false;
        }
    }
}

// 创建单例实例
const configManager = new ConfigManager();

// 导出实例
export default configManager;