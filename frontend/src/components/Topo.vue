<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
const podeGerenciar = ['ADMINISTRADOR', 'ALMOXARIFADO'].includes(usuario.perfil);

function sair() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    router.push({ name: 'login' });
}
</script>

<template>
    <header class="topo">
        <strong>Controle de Estoque</strong>

        <nav>
            <router-link to="/">Início</router-link>
            <router-link v-if="podeGerenciar" to="/funcionarios">Funcionários</router-link>
            <router-link v-if="podeGerenciar" to="/grupos">Grupos</router-link>
            <router-link v-if="podeGerenciar" to="/produtos">Produtos</router-link>
        </nav>

        <span class="quem">{{ usuario.nome }} · {{ usuario.perfil }}</span>
        <button @click="sair">Sair</button>
    </header>
</template>

<style scoped>
.topo {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 12px 20px;
    background: #1f2937;
    color: #fff;
}

nav {
    display: flex;
    gap: 6px;
}

nav a {
    color: #cbd5e1;
    text-decoration: none;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: .95rem;
}

nav a:hover {
    background: rgba(255, 255, 255, .1);
}

nav a.router-link-active {
    background: #2563a8;
    color: #fff;
}

.quem {
    margin-left: auto;
    font-size: .9rem;
    opacity: .85;
}

button {
    padding: 6px 14px;
    border: 1px solid #94a3b8;
    border-radius: 6px;
    background: transparent;
    color: #fff;
    cursor: pointer;
}

button:hover {
    background: rgba(255, 255, 255, .12);
}
</style>