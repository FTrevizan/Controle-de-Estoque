import { createRouter, createWebHistory } from 'vue-router';
import Login from './views/Login.vue';
import Home from './views/Home.vue';
import Funcionarios from './views/Funcionarios.vue';
import FuncionarioForm from './views/FuncionarioForm.vue';

const perfisGestao = ['ADMINISTRADOR', 'ALMOXARIFADO'];

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: Login },
    { path: '/', name: 'home', component: Home, meta: { requerLogin: true } },
    {
      path: '/funcionarios',
      name: 'funcionarios',
      component: Funcionarios,
      meta: { requerLogin: true, perfis: perfisGestao },
    },
    {
      path: '/funcionarios/novo',
      name: 'funcionario-novo',
      component: FuncionarioForm,
      meta: { requerLogin: true, perfis: perfisGestao },
    },
    {
      path: '/funcionarios/:id',
      name: 'funcionario-editar',
      component: FuncionarioForm,
      meta: { requerLogin: true, perfis: perfisGestao },
    },
  ],
});

router.beforeEach((to) => {
  const logado = !!localStorage.getItem('token');
  if (to.meta.requerLogin && !logado) return { name: 'login' };
  if (to.name === 'login' && logado) return { name: 'home' };

  if (to.meta.perfis) {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    if (!to.meta.perfis.includes(usuario.perfil)) return { name: 'home' };
  }
});

export default router;