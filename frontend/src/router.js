import { createRouter, createWebHistory } from 'vue-router';
import Login from './views/Login.vue';
import Home from './views/Home.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: Login },
    { path: '/', name: 'home', component: Home, meta: { requerLogin: true } },
  ],
});

router.beforeEach((to) => {
  const logado = !!localStorage.getItem('token');
  if (to.meta.requerLogin && !logado) return { name: 'login' };
  if (to.name === 'login' && logado) return { name: 'home' };
});

export default router;