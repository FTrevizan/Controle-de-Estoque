<script setup>
import { ref, watch, onMounted } from 'vue';
import api from '../api.js';
import Topo from '../components/Topo.vue';

const movimentacoes = ref([]);
const busca = ref('');
const filtro = ref('todas');
const erro = ref('');
const carregando = ref(false);

async function carregar() {
    erro.value = '';
    carregando.value = true;

    try {
        const params = {};

        if (busca.value.trim()) {
            params.busca = busca.value.trim();
        }

        if (filtro.value !== 'todas') {
            params.tipo = filtro.value;
        }

        const { data } = await api.get('/movimentacoes', { params });
        movimentacoes.value = data;
    } catch (e) {
        erro.value =
            e.response?.data?.erro ||
            'Não foi possível carregar as movimentações.';
    } finally {
        carregando.value = false;
    }
}

function nomeProduto(m) {
    return m.produto?.nome
        || m.nome_produto
        || m.produto_nome
        || (m.produtoId ? `Produto #${m.produtoId}` : '—');
}

function nomeFuncionario(m) {
    return m.funcionario?.nome
        || m.nome_funcionario
        || m.funcionario_nome
        || '—';
}

function dataFormatada(data) {
    if (!data) return '—';

    const valor = new Date(data);

    if (Number.isNaN(valor.getTime())) return data;

    return valor.toLocaleString('pt-BR');
}

let espera;

watch(busca, () => {
    clearTimeout(espera);
    espera = setTimeout(carregar, 300);
});

watch(filtro, carregar);

onMounted(carregar);
</script>

<template>
    <Topo />

    <main class="conteudo">
        <div class="titulo">
            <h2>Movimentações</h2>

            <router-link to="/movimentacoes/novo" class="botao">
                + Nova movimentação
            </router-link>
        </div>

        <div class="filtros">
            <input v-model="busca" placeholder="Buscar produto ou funcionário" />

            <select v-model="filtro">
                <option value="todas">Todas</option>
                <option value="ENTRADA">Somente entradas</option>
                <option value="SAIDA">Somente saídas</option>
            </select>
        </div>

        <p v-if="erro" class="erro">{{ erro }}</p>

        <div class="tabela-area">
            <table>
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Produto</th>
                        <th>Tipo</th>
                        <th>Quantidade</th>
                        <th>Funcionário</th>
                        <th>Observação</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="m in movimentacoes" :key="m.id_movimentacao ?? m.id">
                        <td>
                            {{ dataFormatada(
                                m.data_movimentacao || m.data || m.created_at
                            ) }}
                        </td>

                        <td>{{ nomeProduto(m) }}</td>

                        <td>
                            <span :class="[
                                'selo',
                                m.tipo === 'ENTRADA' ? 'entrada' : 'saida'
                            ]">
                                {{ m.tipo || '—' }}
                            </span>
                        </td>

                        <td>{{ m.quantidade }}</td>

                        <td>{{ nomeFuncionario(m) }}</td>

                        <td>{{ m.observacao || '—' }}</td>
                    </tr>

                    <tr v-if="!carregando && movimentacoes.length === 0">
                        <td colspan="6" class="vazio">
                            Nenhuma movimentação encontrada.
                        </td>
                    </tr>

                    <tr v-if="carregando">
                        <td colspan="6" class="vazio">
                            Carregando movimentações...
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </main>
</template>

<style scoped>
.conteudo {
    padding: 24px 20px;
    max-width: 1100px;
    margin: 0 auto;
}

.titulo {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 16px;
}

h2 {
    margin: 0;
}

.filtros {
    display: flex;
    gap: 10px;
    margin-bottom: 14px;
    flex-wrap: wrap;
}

input,
select {
    padding: 9px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: .95rem;
    background: #fff;
}

input {
    flex: 1;
    min-width: 220px;
}

.erro {
    color: #b91c1c;
    margin: 0 0 12px;
}

.tabela-area {
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, .06);
    overflow-x: auto;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th,
td {
    text-align: left;
    padding: 11px 14px;
    font-size: .92rem;
}

th {
    background: #f1f5f9;
    color: #475569;
    font-weight: 600;
}

tr+tr td {
    border-top: 1px solid #e5e7eb;
}

.selo {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: .8rem;
    font-weight: 600;
}

.selo.entrada {
    background: #dcfce7;
    color: #166534;
}

.selo.saida {
    background: #fee2e2;
    color: #991b1b;
}

.vazio {
    text-align: center;
    color: #6b7280;
    padding: 24px;
}

.botao {
    background: #2563a8;
    color: #fff;
    text-decoration: none;
    padding: 9px 16px;
    border-radius: 8px;
    font-size: .92rem;
    font-weight: 600;
}
</style>
