/**
 * 事件系统
 * 提供应用内模块通信机制
 */

class EventSystem {
    constructor() {
        this.events = new Map();
        this.onceEvents = new Map();
        this.globalListeners = [];
        
        console.log('📡 事件系统初始化');
    }
    
    /**
     * 监听事件
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数
     * @param {Object} options - 选项
     */
    on(event, callback, options = {}) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        
        const listener = {
            callback,
            once: options.once || false,
            priority: options.priority || 0
        };
        
        this.events.get(event).push(listener);
        
        // 按优先级排序
        this.events.get(event).sort((a, b) => b.priority - a.priority);
        
        // 返回取消监听的函数
        return () => this.off(event, callback);
    }
    
    /**
     * 监听一次事件
     */
    once(event, callback, options = {}) {
        return this.on(event, callback, { ...options, once: true });
    }
    
    /**
     * 取消监听事件
     */
    off(event, callback) {
        if (!this.events.has(event)) return false;
        
        const listeners = this.events.get(event);
        const index = listeners.findIndex(l => l.callback === callback);
        
        if (index > -1) {
            listeners.splice(index, 1);
            return true;
        }
        
        return false;
    }
    
    /**
     * 触发事件
     */
    emit(event, data = null) {
        console.log(`🔊 触发事件: ${event}`, data);
        
        // 执行普通监听器
        if (this.events.has(event)) {
            const listeners = [...this.events.get(event)]; // 复制数组防止循环时修改
            
            for (const listener of listeners) {
                try {
                    listener.callback(data);
                    
                    // 如果是once监听器，执行后移除
                    if (listener.once) {
                        this.off(event, listener.callback);
                    }
                } catch (error) {
                    console.error(`事件监听器执行错误 (${event}):`, error);
                }
            }
        }
        
        // 执行全局监听器
        this.globalListeners.forEach(listener => {
            try {
                listener(event, data);
            } catch (error) {
                console.error('全局监听器执行错误:', error);
            }
        });
    }
    
    /**
     * 添加全局监听器（监听所有事件）
     */
    addGlobalListener(callback) {
        this.globalListeners.push(callback);
        
        // 返回移除函数
        return () => {
            const index = this.globalListeners.indexOf(callback);
            if (index > -1) {
                this.globalListeners.splice(index, 1);
            }
        };
    }
    
    /**
     * 移除所有事件监听器
     */
    removeAllListeners(event = null) {
        if (event) {
            this.events.delete(event);
        } else {
            this.events.clear();
            this.globalListeners = [];
        }
    }
    
    /**
     * 获取事件监听器数量
     */
    listenerCount(event = null) {
        if (event) {
            return this.events.has(event) ? this.events.get(event).length : 0;
        }
        
        let count = 0;
        for (const listeners of this.events.values()) {
            count += listeners.length;
        }
        count += this.globalListeners.length;
        
        return count;
    }
    
    /**
     * 创建命名空间事件系统
     */
    createNamespace(namespace) {
        return {
            on: (event, callback, options) => 
                this.on(`${namespace}:${event}`, callback, options),
            
            once: (event, callback, options) => 
                this.once(`${namespace}:${event}`, callback, options),
            
            off: (event, callback) => 
                this.off(`${namespace}:${event}`, callback),
            
            emit: (event, data) => 
                this.emit(`${namespace}:${event}`, data)
        };
    }
    
    /**
     * 常用事件定义
     */
    static get EVENT_TYPES() {
        return {
            // 应用事件
            APP_READY: 'app:ready',
            APP_ERROR: 'app:error',
            APP_LOADING: 'app:loading',
            APP_LOADED: 'app:loaded',
            
            // 用户事件
            USER_LOGIN: 'user:login',
            USER_LOGOUT: 'user:logout',
            USER_UPDATE: 'user:update',
            
            // 积分事件
            POINTS_ADD: 'points:add',
            POINTS_UPDATE: 'points:update',
            POINTS_NOT_ENOUGH: 'points:not_enough',
            
            // 游戏事件
            GAME_START: 'game:start',
            GAME_END: 'game:end',
            GAME_SCORE: 'game:score',
            
            // UI事件
            UI_NAVIGATE: 'ui:navigate',
            UI_MODAL_OPEN: 'ui:modal:open',
            UI_MODAL_CLOSE: 'ui:modal:close',
            
            // 网络事件
            NETWORK_ONLINE: 'network:online',
            NETWORK_OFFLINE: 'network:offline',
            
            // 数据事件
            DATA_SAVE: 'data:save',
            DATA_LOAD: 'data:load',
            DATA_SYNC: 'data:sync'
        };
    }
}

// 创建全局事件系统实例
const eventSystem = new EventSystem();

// 导出事件类型和实例
export { EventSystem, eventSystem };
export default eventSystem;