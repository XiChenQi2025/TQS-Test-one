/**
 * API接口配置
 * 包含端点定义、环境配置、请求参数
 */
export default {
    // 环境配置（开发/生产）
    baseUrl: 'https://api.taoci-magic.com', // 开发环境
    // baseUrl: 'https://prod.taoci-magic.com', // 生产环境

    // API端点
    endpoints: {
        // 用户系统
        register: '/api/user/register',
        login: '/api/user/login',
        info: '/api/user/info',
        update: '/api/user/update',

        // 游戏系统
        submitScore: '/api/game/submit',
        getHistory: '/api/game/history',
        getRankings: '/api/game/rankings',

        // 抽奖系统
        spinLottery: '/api/lottery/spin',
        getRewards: '/api/lottery/rewards'
    },

    // 请求配置
    timeout: 10000,         // 请求超时时间（毫秒）
    headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'YOUR_API_KEY' // 重要：请替换为实际API密钥
    }
};
