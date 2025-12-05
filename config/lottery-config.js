/**
 * 抽奖系统配置
 * 包含消耗、概率、奖励池
 */
export default {
    // 基础配置
    spinCost: 100,           // 每次抽奖消耗积分
    dailyFreeSpins: 3,       // 每日免费抽奖次数
    maxRewards: 10,          // 单次抽奖最大奖励数

    // 概率配置（总和必须为100%）
    probability: {
        common: 60,
        rare: 30,
        epic: 9,
        legendary: 1
    },

    // 奖励池配置
    rewards: {
        common: [
            { name: '桃色贴纸', points: 50 },
            { name: '魔力药水', points: 100 }
        ],
        rare: [
            { name: '限定头像框', points: 200 },
            { name: '双倍积分卡', points: 300 }
        ],
        epic: [
            { name: '周年庆称号', points: 500 },
            { name: '动态气泡特效', points: 800 }
        ],
        legendary: [
            { name: '桃汽水手办', points: 2000 },
            { name: '年度VIP资格', points: 5000 }
        ]
    }
};
