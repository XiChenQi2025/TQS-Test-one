// 初始化加载动画
document.getElementById('loading-spinner').classList.add('hidden');

// 导入模块
import { Router } from './router';
import { UserManager } from './modules/auth/UserManager.js';
import { GameManager } from './modules/game/GameManager.js';
import { TouchOptimizer } from './modules/utils/TouchOptimizer.js';
import { config } from './config/config.js';
import { RankTable } from './modules/rank/RankTable.js';

// 初始化系统
const userManager = new UserManager();
const gameManager = new GameManager();
const router = new Router();

// 初始化触摸优化
TouchOptimizer.enhanceTouchElements('.game-card, button');

// 初始化排行榜
new RankTable('rank-table');

// 路由守卫
router.beforeEach((to, from) => {
    // 权限验证
    if (to.meta.requiresAuth && !userManager.currentUser) {
        router.navigate('/');
        return false;
    }
    
    // 更新页面标题
    document.title = `桃汽水 - ${to.meta.title}`;
});

// 初始化路由
router.init();

// 游戏大厅事件绑定（由GamePage组件处理）
// 原代码中的游戏卡片渲染已移至GamePage组件

// 游戏结束处理
function showGameOver(score) {
    document.getElementById('final-score').textContent = score;
    document.getElementById('game-over-modal').style.display = 'block';
}

function closeGameOverModal() {
    document.getElementById('game-over-modal').style.display = 'none';
}

function restartGame() {
    gameManager.startGame(gameManager.currentGame);
    closeGameOverModal();
}
