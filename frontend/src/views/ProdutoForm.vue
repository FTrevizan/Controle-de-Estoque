<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../api.js';
import Topo from '../components/Topo.vue';

const route = useRoute();
const router = useRouter();

const id = route.params.id; 
const editando = computed(() => !!id);

const grupos = ref([]);
const estoqueAtual = ref(0);
const form = ref({
    codigo: '', nome: '', descricao: '', id_grupo: '', tipo: 'MATERIAL',
    unidade_medida: '', estoque_min: 0, tamanho: '', validade: '',
});
const erro = ref('');
const salvando = ref(false);

onMounted(async () => {
    try {
        const { data: lista } = await api.get('/grupos');
        grupos.value = lista;

        if (editando.value) {
            const { data } = await api.get(`/produtos/${id}`);
            form.value = {
                codigo: data.codigo,
                nome: data.nome,
                descricao: data.descricao || '',
                id_grupo: data.id_grupo,
                tipo: data.tipo,
                unidade_medida: data.unidade_medida,
                estoque_min: data.estoque_min,
                tamanho: data.tamanho || '',
                validade: data.validade || '',
            };
            estoqueAtual.value = data.estoque_atual;
        }
    } catch (e) {
        erro.value = e.response?.data?.erro || 'Não foi possível carregar os dados.';
    }
});

async function salvar() {
    erro.value = '';
    salvando.value = true;
    try {
        if (editando.value) {
            await api.put(`/produtos/${id}`, form.value);
        } else {
            await api.post('/produtos', form.value);
        }
        router.push({ name: 'produtos' });
    } catch (e) {
        erro.value = e.response?.data?.erro || 'Não foi possível salvar.';
    } finally {
        salvando.value = false;
    }
}
</script>

<template>
    <Topo />

    <main class="conteudo">
        <h2>{{ editando ? 'Editar produto' : 'Novo produto' }}</h2>

        <form class="cartao" @submit.prevent="salvar">
            <label>Código
                <input v-model.trim="form.codigo" required />
            </label>

            <label>Nome
                <input v-model.trim="form.nome" required />
            </label>

            <label>Descrição
                <textarea v-model.trim="form.descricao" rows="2"></textarea>
            </label>

            <label>Grupo
                <select v-model="form.id_grupo" required>
                    <option value="" disabled>Selecione</option>
                    <option v-for="g in grupos" :key="g.id_grupo" :value="g.id_grupo">{{ g.nome }}</option>
                </select>
            </label>

            <label>Tipo
                <select v-model="form.tipo">
                    <option value="MATERIAL">Material</option>
                    <option value="EPI">EPI</option>
                </select>
            </label>

            <label>Unidade de medida
                <input v-model.trim="form.unidade_medida" list="unidades" required />
                <datalist id="unidades">
                    <option value="unidade" />
                    <option value="par" />
                    <option value="caixa" />
                    <option value="pacote" />
                    <option value="kg" />
                    <option value="litro" />
                    <option value="metro" />
                </datalist>
            </label>

            <label>Estoque mínimo
                <input v-model.number="form.estoque_min" type="number" min="0" required />
            </label>

           
            <template v-if="form.tipo === 'EPI'">
                <label>Tamanho
                    <input v-model.trim="form.tamanho" placeholder="Ex.: P, M, G, 42" />
                </label>

                <label>Validade
                    <input v-model="form.validade" type="date" />
                </label>
            </template>

            <p v-if="editando" class="info">
                Estoque atual: <strong>{{ estoqueAtual }}</strong>. Ele só muda por entradas e saídas.
            </p>

            <p v-if="erro" class="erro">{{ erro }}</p>

            <div class="botoes">
                <button type="button" class="secundario" @click="router.push({ name: 'produtos' })">Cancelar</button>
                <button :disabled="salvando">{{ salvando ? 'Salvando...' : 'Salvar' }}</button>
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
select,
textarea {
    padding: 10px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 1rem;
    font-family: inherit;
    background: #fff;
}

input:focus,
select:focus,
textarea:focus {
    outline: 2px solid #2563a8;
    border-color: transparent;
}

.info {
    margin: 0;
    color: #475569;
    font-size: .92rem;
    background: #f1f5f9;
    padding: 10px 12px;
    border-radius: 8px;
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