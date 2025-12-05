/**
 * 主配置文件
 * 统一管理所有子配置
 * 包含系统级配置项
 */
import { themeConfig } from './theme-config.js';
import { gameConfig } from './game-config.js';
import { lotteryConfig } from './lottery-config.js';
import { apiConfig } from './api-config.js';

export default {
    theme: themeConfig,
    game: gameConfig,
    lottery: lotteryConfig,
    api: apiConfig,
    system: {
        version: '1.0.0',
        debugMode: false,
        anniversaryDate: '2024-12-15',
        security: {
            salt: 'your-secret-salt-key', // 重要：请替换为实际盐值
            sessionTimeout: 86400, // 24小时（秒）
            rateLimit: {
                loginAttempts: 5,
                resetInterval: 3600
            }
        }
    }
};
