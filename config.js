// 桃汽水周年庆网站配置文件
const CONFIG = {
    // 网站信息
    SITE: {
        NAME: "🍑 桃汽水的魔力补给站",
        TITLE: "异世界精灵公主的周年庆典",
        VERSION: "1.0.0",
        CHARACTER: {
            NAME: "桃汽水",
            TITLE: "精灵公主",
            DESCRIPTION: "来自异世界的调皮精灵公主，最爱喝汽水和收集快乐能量"
        }
    },
    
    // 时间配置
    TIME: {
        EVENT_START: "2024-12-25T19:00:00",
        COUNTDOWN_TARGET: "2024-12-25T19:00:00"
    },
    
    // 颜色主题
    COLORS: {
        // 彩虹色
        RAINBOW: [
            "#FF6B6B", // 红
            "#FF9F43", // 橙
            "#FFD93D", // 黄
            "#6BCF7F", // 绿
            "#4D96FF", // 蓝
            "#9B51E0"  // 紫
        ],
        
        // 粉色系
        PINK: {
            LIGHT: "#FFC8E8",
            MEDIUM: "#FF8EAF",
            DARK: "#FF6BAC",
            BRIGHT: "#FF4D8A"
        },
        
        // 渐变
        GRADIENTS: {
            RAINBOW: "linear-gradient(90deg, #FF6B6B, #FF9F43, #FFD93D, #6BCF7F, #4D96FF, #9B51E0)",
            PINK: "linear-gradient(135deg, #FFC8E8, #FF8EAF, #FF6BAC)",
            SUNSET: "linear-gradient(135deg, #FF9AC8, #FFB347, #FFD700)"
        }
    },
    
    // 游戏配置
    GAMES: [
        {
            id: "bubble",
            name: "魔力泡泡",
            icon: "fa-cloud",
            color: "#FF6B6B",
            pointsPerGame: 200,
            cooldown: 60
        },
        {
            id: "rune",
            name: "符文快闪",
            icon: "fa-clone",
            color: "#6BCF7F",
            pointsPerGame: 500,
            cooldown: 180
        },
        {
            id: "energy",
            name: "能量蓄力",
            icon: "fa-bolt",
            color: "#4D96FF",
            pointsPerGame: 300,
            cooldown: 120
        }
    ],
    
    // 抽奖配置
    LOTTERY: {
        COST: 500,
        PRIZES: [
            { name: "公主的语音祝福", probability: 5, color: "#FF6B6B" },
            { name: "限定数字徽章", probability: 10, color: "#FF9F43" },
            { name: "舰长续费红包", probability: 15, color: "#FFD93D" },
            { name: "实体周边", probability: 2, color: "#6BCF7F" },
            { name: "魔力翻倍卡", probability: 30, color: "#4D96FF" },
            { name: "亲笔签名照", probability: 3, color: "#9B51E0" },
            { name: "精灵的感谢", probability: 35, color: "#9D8BB5" }
        ]
    },
    
    // 功能开关
    FEATURES: {
        COUNTDOWN: true,
        GAMES: true,
        LOTTERY: true,
        RANKING: true,
        MESSAGES: true
    },
    
    // 存储配置
    STORAGE: {
        PREFIX: "taoci_",
        USER_DATA_EXPIRY: 30 // 天
    }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}
