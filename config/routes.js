export default [
    {
        path: '/',
        component: () => import('../pages/HomePage.js'),
        title: '首页',
        meta: { requiresAuth: false }
    },
    {
        path: '/games',
        component: () => import('../pages/GamePage.js'),
        title: '游戏大厅',
        meta: { requiresAuth: true }
    },
    {
        path: '/lottery',
        component: () => import('../pages/LotteryPage.js'),
        title: '幸运大转盘',
        meta: { requiresAuth: true }
    },
    {
        path: '/rank',
        component: () => import('../pages/RankPage.js'),
        title: '魔力排行榜',
        meta: { requiresAuth: true }
    },
    {
        path: '/404',
        component: () => import('../pages/NotFoundPage.js'),
        title: '页面未找到',
        meta: { requiresAuth: false }
    }
];
