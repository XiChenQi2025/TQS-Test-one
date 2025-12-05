import { Animation } from '../../utils/Animation.js';

/**
 * 魔法转盘类
 * 使用Canvas实现动态抽奖动画
 */
class MagicWheel {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.rewards = [];
        this.rotation = 0;
        this.velocity = 0;
        this.isSpinning = false;
        this.targetAngle = 0;
        this.#init();
    }

    #init() {
        this.canvas.addEventListener('click', () => this.spin());
        window.addEventListener('resize', () => this.#resizeCanvas());
        this.#resizeCanvas();
    }

    #resizeCanvas() {
        this.canvas.width = window.innerWidth * 0.8;
        this.canvas.height = window.innerWidth * 0.8;
        this.#drawWheel();
    }

    spin() {
        if (this.isSpinning) return;
        
        const lotteryManager = new LotteryManager();
        lotteryManager.spin().then(result => {
            if (result.success) {
                this.#startSpinAnimation(result.reward);
            } else {
                Animation.flash(this.canvas, config.theme.danger);
            }
        });
    }

    #startSpinAnimation(reward) {
        this.isSpinning = true;
        this.#calculateTargetAngle(reward);
        this.#animateSpin();
    }

    #calculateTargetAngle(reward) {
        const index = this.rewards.findIndex(r => r.name === reward.name);
        const startAngle = (index * (360 / this.rewards.length)) * (Math.PI / 180);
        this.targetAngle = startAngle + 4 * Math.PI; // 多转两圈
    }

    #animateSpin() {
        this.velocity *= 0.98;
        this.rotation += this.velocity;
        
        if (this.rotation > this.targetAngle) {
            this.rotation = this.targetAngle;
            this.isSpinning = false;
            this.#showResult();
            return;
        }

        this.#drawWheel();
        requestAnimationFrame(() => this.#animateSpin());
    }

    #drawWheel() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制转盘背景
        this.ctx.beginPath();
        this.ctx.arc(this.canvas.width/2, this.canvas.height/2, this.canvas.width/2 - 20, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fill();

        // 绘制奖励扇形
        this.rewards.forEach((reward, index) => {
            const startAngle = (index * (360 / this.rewards.length)) * (Math.PI / 180);
            const endAngle = ((index + 1) * (360 / this.rewards.length)) * (Math.PI / 180);
            
            this.ctx.beginPath();
            this.ctx.moveTo(this.canvas.width/2, this.canvas.height/2);
            this.ctx.arc(this.canvas.width/2, this.canvas.height/2, this.canvas.width/2 - 40, startAngle, endAngle);
            this.ctx.closePath();
            this.ctx.fillStyle = this.#getTierColor(reward.tier);
            this.ctx.fill();
            
            this.#drawText(reward.name, startAngle, endAngle);
        });

        // 绘制指针
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width/2, this.canvas.height/2 - 20);
        this.ctx.lineTo(this.canvas.width/2 + 10, this.canvas.height/2 + 20);
        this.ctx.lineTo(this.canvas.width/2 - 10, this.canvas.height/2 + 20);
        this.ctx.closePath();
        this.ctx.fillStyle = config.theme.primary;
        this.ctx.fill();
    }

    #drawText(text, startAngle, endAngle) {
        const angle = startAngle + (endAngle - startAngle) / 2;
        const radius = this.canvas.width/2 - 60;
        
        const x = Math.cos(angle) * radius + this.canvas.width/2;
        const y = Math.sin(angle) * radius + this.canvas.height/2;
        
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(angle - Math.PI/2);
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = config.theme.text;
        this.ctx.fillText(text, 0, 0);
        this.ctx.restore();
    }

    #getTierColor(tier) {
        switch(tier) {
            case 'legendary': return '#FFD700';
            case 'epic': return '#00FF00';
            case 'rare': return '#0000FF';
            default: return '#CCCCCC';
        }
    }

    updateRewards(rewards) {
        this.rewards = rewards.map(r => ({
            ...r,
            tier: this.#getRewardTier(r)
        }));
        this.#drawWheel();
    }

    #getRewardTier(reward) {
        for (const [tier, items] of Object.entries(config.lottery.rewards)) {
            if (items.includes(reward)) return tier;
        }
        return 'common';
    }

    #showResult() {
        const result = this.rewards.find(r => {
            const startAngle = (this.rewards.indexOf(r) * (360 / this.rewards.length)) * (Math.PI / 180);
            const endAngle = ((this.rewards.indexOf(r) + 1) * (360 / this.rewards.length)) * (Math.PI / 180);
            return this.rotation >= startAngle && this.rotation < endAngle;
        });

        Animation.pulse(this.canvas);
        alert(`恭喜获得：${result.name}\n积分奖励：${result.points}`);
    }
}

export default MagicWheel;
