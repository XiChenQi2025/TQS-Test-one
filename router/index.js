import Router from './Router.js';
import { routes } from '../config/routes.js';

const router = new Router();
routes.forEach(route => router.addRoute(route.path, route));

export default router;
