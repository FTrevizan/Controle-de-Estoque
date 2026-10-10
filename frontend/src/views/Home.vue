<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

// encerrar sessão (HU02)
function sair() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  router.push({ name: 'login' });
}
</script>

<template>
  <header class="topo">
    <strong>Controle de Estoque</strong>
    <span class="quem">{{ usuario.nome }} · {{ usuario.perfil }}</span>
    <button @click="sair">Sair</button>
  </header>

  <main class="conteudo">
    <h2>Bem-vindo, {{ usuario.nome }}!</h2>
    <p>Login funcionando. As próximas telas entram nas próximas partes.</p>
  </main>
</template>

<style scoped>
.topo {
  display: flex; align-items: center; gap: 16px; padding: 12px 20px;
  background: #1f2937; color: #fff;
}
.quem { margin-left: auto; font-size: .9rem; opacity: .85; }
button {
  padding: 6px 14px; border: 1px solid #94a3b8; border-radius: 6px;
  background: transparent; color: #fff; cursor: pointer;
}
button:hover { background: rgba(255,255,255,.12); }
.conteudo { padding: 24px 20px; }
</style>