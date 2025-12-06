/**
 * 存储管理器
 * 封装localStorage和sessionStorage，提供统一的API
 */

class StorageManager {
    constructor() {
        this.prefix = 'taoci_';
        this.enabled = this.testStorage();
        
        console.log('💾 存储管理器初始化', this.enabled ? '✅' : '❌');
    }
    
    /**
     * 测试存储是否可用
     */
    testStorage() {
        try {
            const testKey = this.prefix + 'test';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            console.warn('本地存储不可用:', error);
            return false;
        }
    }
    
    /**
     * 设置存储项
     * @param {string} key - 键名
     * @param {any} value - 值
     * @param {Object} options - 选项 { expiry: 过期时间(毫秒), session: 使用sessionStorage }
     */
    set(key, value, options = {}) {
        if (!this.enabled) return false;
        
        const storage = options.session ? sessionStorage : localStorage;
        const fullKey = this.prefix + key;
        
        try {
            const data = {
                value,
                timestamp: Date.now(),
                expiry: options.expiry || null
            };
            
            storage.setItem(fullKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('存储数据失败:', error);
            return false;
        }
    }
    
    /**
     * 获取存储项
     */
    get(key, defaultValue = null, session = false) {
        if (!this.enabled) return defaultValue;
        
        const storage = session ? sessionStorage : localStorage;
        const fullKey = this.prefix + key;
        
        try {
            const item = storage.getItem(fullKey);
            if (!item) return defaultValue;
            
            const data = JSON.parse(item);
            
            // 检查是否过期
            if (data.expiry && Date.now() > data.timestamp + data.expiry) {
                this.remove(key, session);
                return defaultValue;
            }
            
            return data.value;
        } catch (error) {
            console.error('读取数据失败:', error);
            return defaultValue;
        }
    }
    
    /**
     * 移除存储项
     */
    remove(key, session = false) {
        if (!this.enabled) return false;
        
        const storage = session ? sessionStorage : localStorage;
        const fullKey = this.prefix + key;
        
        try {
            storage.removeItem(fullKey);
            return true;
        } catch (error) {
            console.error('移除数据失败:', error);
            return false;
        }
    }
    
    /**
     * 检查存储项是否存在
     */
    has(key, session = false) {
        if (!this.enabled) return false;
        
        const storage = session ? sessionStorage : localStorage;
        const fullKey = this.prefix + key;
        
        try {
            const item = storage.getItem(fullKey);
            if (!item) return false;
            
            // 检查是否过期
            const data = JSON.parse(item);
            if (data.expiry && Date.now() > data.timestamp + data.expiry) {
                this.remove(key, session);
                return false;
            }
            
            return true;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * 清空所有存储项
     */
    clear(session = false, includePrefix = true) {
        if (!this.enabled) return false;
        
        const storage = session ? sessionStorage : localStorage;
        
        try {
            if (includePrefix) {
                // 只删除前缀匹配的项
                const keysToRemove = [];
                for (let i = 0; i < storage.length; i++) {
                    const key = storage.key(i);
                    if (key.startsWith(this.prefix)) {
                        keysToRemove.push(key);
                    }
                }
                
                keysToRemove.forEach(key => storage.removeItem(key));
            } else {
                // 清空所有
                storage.clear();
            }
            
            return true;
        } catch (error) {
            console.error('清空存储失败:', error);
            return false;
        }
    }
    
    /**
     * 获取所有键名
     */
    keys(session = false, includePrefix = false) {
        if (!this.enabled) return [];
        
        const storage = session ? sessionStorage : localStorage;
        const result = [];
        
        try {
            for (let i = 0; i < storage.length; i++) {
                let key = storage.key(i);
                
                if (key.startsWith(this.prefix)) {
                    if (!includePrefix) {
                        key = key.substring(this.prefix.length);
                    }
                    result.push(key);
                }
            }
        } catch (error) {
            console.error('获取键名失败:', error);
        }
        
        return result;
    }
    
    /**
     * 存储用户数据
     */
    saveUser(userData) {
        return this.set('user', userData, { expiry: 30 * 24 * 60 * 60 * 1000 }); // 30天
    }
    
    /**
     * 加载用户数据
     */
    loadUser() {
        return this.get('user', null);
    }
    
    /**
     * 清除用户数据
     */
    clearUser() {
        this.remove('user');
    }
    
    /**
     * 存储游戏数据
     */
    saveGameData(gameId, data) {
        const key = `game_${gameId}`;
        return this.set(key, data, { expiry: 7 * 24 * 60 * 60 * 1000 }); // 7天
    }
    
    /**
     * 加载游戏数据
     */
    loadGameData(gameId) {
        const key = `game_${gameId}`;
        return this.get(key, {});
    }
    
    /**
     * 存储设置
     */
    saveSettings(settings) {
        return this.set('settings', settings);
    }
    
    /**
     * 加载设置
     */
    loadSettings() {
        return this.get('settings', {});
    }
    
    /**
     * 获取存储统计信息
     */
    getStats() {
        const stats = {
            localStorage: { count: 0, size: 0 },
            sessionStorage: { count: 0, size: 0 }
        };
        
        [localStorage, sessionStorage].forEach((storage, index) => {
            const key = index === 0 ? 'localStorage' : 'sessionStorage';
            
            try {
                for (let i = 0; i < storage.length; i++) {
                    const itemKey = storage.key(i);
                    if (itemKey.startsWith(this.prefix)) {
                        const item = storage.getItem(itemKey);
                        stats[key].count++;
                        stats[key].size += item ? item.length : 0;
                    }
                }
                
                // 转换为KB
                stats[key].size = Math.round(stats[key].size / 1024 * 100) / 100;
            } catch (error) {
                console.error(`获取${key}统计失败:`, error);
            }
        });
        
        return stats;
    }
    
    /**
     * 导出所有数据
     */
    exportAll() {
        const data = {};
        
        [localStorage, sessionStorage].forEach(storage => {
            try {
                for (let i = 0; i < storage.length; i++) {
                    const key = storage.key(i);
                    if (key.startsWith(this.prefix)) {
                        const item = storage.getItem(key);
                        try {
                            data[key] = JSON.parse(item);
                        } catch (e) {
                            data[key] = item;
                        }
                    }
                }
            } catch (error) {
                console.error('导出数据失败:', error);
            }
        });
        
        return JSON.stringify(data, null, 2);
    }
    
    /**
     * 导入数据
     */
    importAll(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            Object.entries(data).forEach(([key, value]) => {
                if (key.startsWith(this.prefix)) {
                    if (typeof value === 'object') {
                        localStorage.setItem(key, JSON.stringify(value));
                    } else {
                        localStorage.setItem(key, value);
                    }
                }
            });
            
            return true;
        } catch (error) {
            console.error('导入数据失败:', error);
            return false;
        }
    }
}

// 创建单例实例
const storageManager = new StorageManager();

// 导出实例
export default storageManager;