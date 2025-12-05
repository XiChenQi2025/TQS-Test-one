/**
 * 高精度倒计时工具类
 * 支持暂停/恢复/重置功能
 * 使用requestAnimationFrame实现平滑更新
 */
class Countdown {
    constructor(targetTime, updateCallback, completeCallback) {
        this.targetTime = targetTime; // 总时间（毫秒）
        this.updateCallback = updateCallback; // 时间更新回调
        this.completeCallback = completeCallback; // 倒计时结束回调
        this.startTime = null; // 开始时间戳
        this.elapsedTime = 0; // 已流逝时间
        this.isRunning = false; // 运行状态
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.startTime = Date.now();
        this.#update();
    }

    pause() {
        if (!this.isRunning) return;
        this.isRunning = false;
        this.elapsedTime += Date.now() - this.startTime;
    }

    resume() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.startTime = Date.now();
        this.#update();
    }

    reset() {
        this.elapsedTime = 0;
        this.isRunning = false;
        this.startTime = null;
        this.updateCallback(this.#formatTime(this.targetTime));
    }

    #update() {
        if (!this.isRunning) return;
        
        const currentTime = Date.now();
        const delta = currentTime - this.startTime;
        this.elapsedTime += delta;
        this.startTime = currentTime;

        const remaining = this.targetTime - this.elapsedTime;
        if (remaining <= 0) {
            this.isRunning = false;
            this.completeCallback();
            return;
        }

        this.updateCallback(this.#formatTime(remaining));
        requestAnimationFrame(() => this.#update());
    }

    #formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}

export default Countdown;
