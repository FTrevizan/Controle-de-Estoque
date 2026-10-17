<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api.js';

const router = useRouter();
const login = ref('');
const senha = ref('');
const erro = ref('');
const carregando = ref(false);

async function entrar() {
  erro.value = '';
  carregando.value = true;
  try {
    const { data } = await api.post('/auth/login', {
      login: login.value,
      senha: senha.value,
    });
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    router.push({ name: 'home' });
  } catch (e) {
    erro.value = e.response?.data?.erro || 'Não foi possível conectar ao servidor.';
  } finally {
    carregando.value = false;
  }
}
</script>

<template>
  <div class="tela">
    <form class="cartao" @submit.prevent="entrar">
      <h1>Controle de Estoque</h1>
      <p class="sub">Materiais e EPIs</p>

      <label>Login
        <input v-model.trim="login" autocomplete="username" autofocus />
      </label>

      <label>Senha
        <input v-model="senha" type="password" autocomplete="current-password" />
      </label>

      <p v-if="erro" class="erro">{{ erro }}</p>

      <button :disabled="carregando || !login || !senha">
        {{ carregando ? 'Entrando...' : 'Entrar' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.tela {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 16px;
}

.cartao {
  width: 100%;
  max-width: 360px;
  background: #fff;
  padding: 28px;
  border-radius: 12px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, .08);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

h1 {
  margin: 0;
  font-size: 1.4rem;
}

.sub {
  margin: -8px 0 4px;
  color: #6b7280;
  font-size: .9rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: .9rem;
  font-weight: 600;
}

input {
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 1rem;
}

input:focus {
  outline: 2px solid #2563a8;
  border-color: transparent;
}

button {
  padding: 11px;
  border: 0;
  border-radius: 8px;
  background: #2563a8;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

button:disabled {
  opacity: .5;
  cursor: not-allowed;
}

.erro {
  margin: 0;
  color: #b91c1c;
  font-size: .9rem;
}
</style>