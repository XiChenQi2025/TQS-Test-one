import { Animation } from '../modules/utils/Animation.js';

class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.history = [];
        this.isNavigating = false;
    }

    addRoute(path, config) {
        this.routes.set(path, {
            path,
            component: config.component,
            title: config.title || '桃汽水',
            meta: config.meta || {}
        });
    }

    beforeEach(callback) {
        this.beforeEachCallback = callback;
    }

    init() {
        // 监听路由变化
        window.addEventListener('popstate', (e) => this.#handlePopstate(e.state));
        
        // 初始化当前路由
        this.#navigate(window.location.pathname || '/', { replace: true });
    }

    navigate(path, options = {}) {
        if (this.isNavigating) return;
        
        const route = this.#getRoute(path);
        if (!route) return this.navigate('/404');

        this.isNavigating = true;
        Animation.fadeOut(document.getElementById('app'), 300);
        
        setTimeout(() => {
            this.#navigate(route.path, options);
            Animation.fadeIn(document.getElementById('app'), 300);
            this.isNavigating = false;
        }, 300);
    }

    back() {
        window.history.back();
    }

    forward() {
        window.history.forward();
    }

    #navigate(path, options = {}) {
        const route = this.#getRoute(path);
        if (!route) return;

        if (this.beforeEachCallback) {
            this.beforeEachCallback(route, this.currentRoute);
        }

        // 加载组件
        route.component().then(Module => {
            const PageClass = Module.default;
            const page = new PageClass();
            
            // 清理旧路由
            if (this.currentRoute?.element) {
                this.currentRoute.element.remove();
            }

            this.currentRoute = {
                element: page.element,
                route: route
            };

            // 更新DOM
            document.getElementById('app').innerHTML = '';
            document.getElementById('app').appendChild(page.element);

            // 更新历史记录
            if (options.replace) {
                window.history.replaceState(route, route.meta.title, route.path);
            } else {
                window.history.pushState(route, route.meta.title, route.path);
            }
        });
    }

    #getRoute(path) {
        const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path;
        return this.routes.get(normalizedPath) || this.routes.get('/404');
    }

    #handlePopstate(state) {
        if (state) {
            this.navigate(state.path, { replace: true });
        }
    }
}

export default Router;
