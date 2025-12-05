/**
 * 动画工具类
 * 提供基础UI动画效果
 * 使用CSS过渡和关键帧动画
 */
class Animation {
    /**
     * 脉冲动画
     * @param {HTMLElement} element - 目标元素
     * @param {number} duration - 动画时长（毫秒）
     */
    static pulse(element, duration = 500) {
        element.style.transform = 'scale(1.1)';
        element.style.transition = `transform ${duration}ms ease`;
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, duration);
    }

    /**
     * 震动动画
     * @param {HTMLElement} element - 目标元素
     * @param {number} duration - 动画时长（毫秒）
     */
    static shake(element, duration = 500) {
        element.style.animation = `shake ${duration}ms`;
        setTimeout(() => {
            element.style.animation = '';
        }, duration);
    }

    /**
     * 闪烁动画
     * @param {HTMLElement} element - 目标元素
     * @param {string} color - 闪烁颜色
     * @param {number} duration - 动画时长（毫秒）
     */
    static flash(element, color = '#FF6EFF', duration = 200) {
        element.style.backgroundColor = color;
        setTimeout(() => {
            element.style.backgroundColor = '';
        }, duration);
    }

    /**
     * 淡入动画
     * @param {HTMLElement} element - 目标元素
     * @param {number} duration - 动画时长（毫秒）
     */
    static fadeIn(element, duration = 500) {
        element.style.opacity = 0;
        element.style.transition = `opacity ${duration}ms`;
        setTimeout(() => {
            element.style.opacity = 1;
        }, 100);
    }

    /**
     * 淡出动画
     * @param {HTMLElement} element - 目标元素
     * @param {number} duration - 动画时长（毫秒）
     */
    static fadeOut(element, duration = 500) {
        element.style.opacity = 1;
        element.style.transition = `opacity ${duration}ms`;
        setTimeout(() => {
            element.style.opacity = 0;
        }, 100);
    }

    /**
     * 旋转动画
     * @param {HTMLElement} element - 目标元素
     * @param {number} degrees - 旋转角度
     * @param {number} duration - 动画时长（毫秒）
     */
    static rotate(element, degrees = 360, duration = 1000) {
        element.style.transform = `rotate(${degrees}deg)`;
        element.style.transition = `transform ${duration}ms linear`;
    }
}

export default Animation;
