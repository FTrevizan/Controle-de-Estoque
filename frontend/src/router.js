import { createRouter, createWebHistory } from 'vue-router';
import Login from './views/Login.vue';
import Home from './views/Home.vue';
import Funcionarios from './views/Funcionarios.vue';
import FuncionarioForm from './views/FuncionarioForm.vue';
import Grupos from './views/Grupos.vue';
import GrupoForm from './views/GrupoForm.vue';
import Produtos from './views/Produtos.vue';
import ProdutoForm from './views/ProdutoForm.vue';

const gestao = { requerLogin: true, perfis: ['ADMINISTRADOR', 'ALMOXARIFADO'] };

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: Login },
    { path: '/', name: 'home', component: Home, meta: { requerLogin: true } },

    { path: '/funcionarios', name: 'funcionarios', component: Funcionarios, meta: gestao },
    { path: '/funcionarios/novo', name: 'funcionario-novo', component: FuncionarioForm, meta: gestao },
    { path: '/funcionarios/:id', name: 'funcionario-editar', component: FuncionarioForm, meta: gestao },

    { path: '/grupos', name: 'grupos', component: Grupos, meta: gestao },
    { path: '/grupos/novo', name: 'grupo-novo', component: GrupoForm, meta: gestao },
    { path: '/grupos/:id', name: 'grupo-editar', component: GrupoForm, meta: gestao },

    { path: '/produtos', name: 'produtos', component: Produtos, meta: gestao },
    { path: '/produtos/novo', name: 'produto-novo', component: ProdutoForm, meta: gestao },
    { path: '/produtos/:id', name: 'produto-editar', component: ProdutoForm, meta: gestao },
  ],
});

router.beforeEach((to) => {
  const logado = !!localStorage.getItem('token');
  if (to.meta.requerLogin && !logado) return { name: 'login' };
  if (to.name === 'login' && logado) return { name: 'home' };

  // bloqueia telas que o perfil do usuário não pode acessar
  if (to.meta.perfis) {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    if (!to.meta.perfis.includes(usuario.perfil)) return { name: 'home' };
  }
});

export default router;