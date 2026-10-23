<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../api.js';
import Topo from '../components/Topo.vue';

const route = useRoute();
const router = useRouter();

const id = route.params.id;
const editando = computed(() => !!id);

const form = ref({
    produtoId: '',
    tipo: '',
    quantidade: 1,
    observacao: ''
});

const produtos = ref([]);
const erro = ref('');
const salvando = ref(false);

onMounted(async () => {
    try {
        const resposta = await api.get('/produtos');
        produtos.value = resposta.data;

        if (editando.value) {
            const { data } = await api.get(`/movimentacoes/${id}`);

            form.value = {
                produtoId: data.produtoId ?? data.produto_id ?? '',
                tipo: data.tipo || '',
                quantidade: data.quantidade || 1,
                observacao: data.observacao || ''
            };
        }
    } catch (e) {
        erro.value =
            e.response?.data?.erro ||
            'Não foi possível carregar os dados.';
    }
});

async function salvar() {
    erro.value = '';
    salvando.value = true;

    try {
        const dados = {
            ...form.value,
            produtoId: Number(form.value.produtoId),
            quantidade: Number(form.value.quantidade)
        };

        if (editando.value) {
            await api.put(`/movimentacoes/${id}`, dados);
        } else {
            await api.post('/movimentacoes', dados);
        }

        router.push({ name: 'movimentacoes' });
    } catch (e) {
        erro.value =
            e.response?.data?.erro ||
            'Não foi possível salvar a movimentação.';
    } finally {
        salvando.value = false;
    }
}
</script>

<template>
    <Topo />

    <main class="conteudo">
        <h2>
            {{ editando ? 'Editar movimentação' : 'Nova movimentação' }}
        </h2>

        <form class="cartao" @submit.prevent="salvar">
            <label>
                Produto
                <select v-model="form.produtoId" required>
                    <option value="">Selecione um produto</option>

                    <option v-for="produto in produtos" :key="produto.id" :value="produto.id">
                        {{ produto.nome }}
                    </option>
                </select>
            </label>

            <label>
                Tipo de movimentação
                <select v-model="form.tipo" required>
                    <option value="">Selecione o tipo</option>
                    <option value="ENTRADA">Entrada</option>
                    <option value="SAIDA">Saída</option>
                </select>
            </label>

            <label>
                Quantidade
                <input v-model.number="form.quantidade" type="number" min="1" step="1" required />
            </label>

            <label>
                Observação
                <textarea v-model.trim="form.observacao" rows="3"></textarea>
            </label>

            <p v-if="erro" class="erro">{{ erro }}</p>

            <div class="botoes">
                <button type="button" class="secundario" @click="router.push({ name: 'movimentacoes' })">
                    Cancelar
                </button>

                <button :disabled="salvando">
                    {{ salvando ? 'Salvando...' : 'Salvar' }}
                </button>
            </div>
        </form>
    </main>
</template>

<style scoped>
.conteudo {
    padding: 24px 20px;
    max-width: 520px;
    margin: 0 auto;
}

h2 {
    margin: 0 0 16px;
}

.cartao {
    background: #fff;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, .06);
    display: flex;
    flex-direction: column;
    gap: 14px;
}

label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: .9rem;
    font-weight: 600;
}

input,
textarea,
select {
    padding: 10px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 1rem;
    font-family: inherit;
    background: #fff;
}

input:focus,
textarea:focus,
select:focus {
    outline: 2px solid #2563a8;
    border-color: transparent;
}

.botoes {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 6px;
}

button {
    padding: 10px 18px;
    border: 0;
    border-radius: 8px;
    background: #2563a8;
    color: #fff;
    font-size: .95rem;
    font-weight: 600;
    cursor: pointer;
}

button.secundario {
    background: #e5e7eb;
    color: #1f2937;
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
