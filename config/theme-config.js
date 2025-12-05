/**
 * 主题配置文件
 * 包含颜色方案、动态样式生成、设备检测
 */
export default {
    // 基础颜色
    primary: '#FF6EFF',    // 主色（桃红色）
    secondary: '#FF99FF',  // 辅助色（淡粉色）
    accent: '#FFEE58',     // 强调色（黄色）
    background: '#FFF9FF', // 背景色（淡粉色渐变基底）
    text: '#222222',       // 主文本色
    success: '#4CAF50',    // 成功色（绿色）
    danger: '#FF5722',     // 危险色（橙色）

    // 动态样式生成函数
    getGradient: () => `linear-gradient(90deg, ${this.primary}, ${this.secondary}, ${this.accent})`,
    getGlow: (color = this.primary) => `0 0 15px ${color}`,

    // 设备检测
    device: {
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        isTablet: /(iPad|tablet|(android(?!.*mobile))|(android 9|10|11|12))/i.test(navigator.userAgent)
    },

    // 字体配置
    fonts: {
        primary: 'Noto Sans SC, sans-serif',
        secondary: 'Dancing Script, cursive'
    }
};
