<script setup>
import Topo from '../components/Topo.vue';

const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
</script>

<template>
  <Topo />

  <main class="conteudo">
    <h2>Bem-vindo, {{ usuario.nome }}!</h2>
    <p></p>
  </main>
</template>

<style scoped>
.conteudo {
  padding: 24px 20px;
}
</style>