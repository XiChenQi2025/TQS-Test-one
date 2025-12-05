/**
 * 游戏核心配置文件
 * 包含各游戏参数、难度算法、数值平衡
 */
export default {
    // 通用游戏配置
    baseScore: 100,           // 基础得分
    difficultyMultiplier: 1.2, // 难度递增系数
    maxDifficulty: 10,        // 最大难度等级

    // 泡泡游戏配置
    bubble: {
        spawnRate: 1500,        // 泡泡生成间隔（毫秒）
        maxBubbles: 20,         // 场景中最大泡泡数
        speedRange: [1, 3],     // 泡泡速度范围（秒/像素）
        score: {
            pink: 10,           // 普通泡泡得分
            golden: 30,         // 金色泡泡得分
            tricky: 50          // 特殊泡泡得分
        },
        colorMap: {
            pink: '#FF6EFF',
            golden: '#FFD700'
        }
    },

    // 符文游戏配置
    rune: {
        showTime: {
            initial: 2000,      // 初始显示时间（毫秒）
            decreasePerLevel: 150, // 每级减少时间
            min: 500            // 最小显示时间
        },
        comboBonus: 50,         // 连击奖励系数
        trickyChance: 0.2,      // 特殊符文出现概率
        validKeys: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ']
    },

    // 能量游戏配置
    energy: {
        perfectZone: 0.45,      // 完美区域百分比
        greatZone: 0.65,        // 优秀区域百分比
        goodZone: 0.75,         // 良好区域百分比
        animationSpeed: 5,      // 指针速度系数
        rounds: 3               // 总轮数
    }
};
