<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../api.js';
import Topo from '../components/Topo.vue';

const route = useRoute();

const produtos = ref([]);
const grupos = ref([]);
const busca = ref('');
const grupo = ref(route.query.grupo || ''); 
const tipo = ref('');
const situacao = ref('');
const soBaixo = ref(false);
const erro = ref('');
const carregando = ref(false);

async function carregar() {
    erro.value = '';
    carregando.value = true;
    try {
        const params = {};
        if (busca.value.trim()) params.busca = busca.value.trim();
        if (grupo.value) params.grupo = grupo.value;
        if (tipo.value) params.tipo = tipo.value;
        if (situacao.value) params.ativo = situacao.value;
        if (soBaixo.value) params.baixo = 'true';

        const { data } = await api.get('/produtos', { params });
        produtos.value = data;
    } catch (e) {
        erro.value = e.response?.data?.erro || 'Não foi possível carregar os produtos.';
    } finally {
        carregando.value = false;
    }
}

async function alternarAtivo(prod) {
    const acao = prod.ativo ? 'desativar' : 'reativar';
    if (!confirm(`Deseja ${acao} "${prod.nome}"?`)) return;
    erro.value = '';
    try {
        await api.patch(`/produtos/${prod.id_produto}/ativo`, { ativo: !prod.ativo });
        await carregar();
    } catch (e) {
        erro.value = e.response?.data?.erro || 'Não foi possível alterar a situação.';
    }
}

function formatarData(iso) {
    return iso ? iso.split('-').reverse().join('/') : '—';
}

function situacaoValidade(iso) {
    if (!iso) return '';
    const dias = Math.floor((new Date(iso + 'T00:00:00') - new Date().setHours(0, 0, 0, 0)) / 86400000);
    if (dias < 0) return 'vencido';
    if (dias <= 30) return 'proximo';
    return '';
}

let espera;
watch(busca, () => {
    clearTimeout(espera);
    espera = setTimeout(carregar, 300);
});
watch([grupo, tipo, situacao, soBaixo], carregar);

onMounted(async () => {
    try {
        const { data } = await api.get('/grupos');
        grupos.value = data;
    } catch {
        grupos.value = [];
    }
    carregar();
});
</script>

<template>
    <Topo />

    <main class="conteudo">
        <div class="titulo">
            <h2>Produtos</h2>
            <router-link to="/produtos/novo" class="botao">+ Novo produto</router-link>
        </div>

        <div class="filtros">
            <input v-model="busca" placeholder="Buscar por nome ou código" />
            <select v-model="grupo">
                <option value="">Todos os grupos</option>
                <option v-for="g in grupos" :key="g.id_grupo" :value="g.id_grupo">{{ g.nome }}</option>
            </select>
            <select v-model="tipo">
                <option value="">Todos os tipos</option>
                <option value="MATERIAL">Material</option>
                <option value="EPI">EPI</option>
            </select>
            <select v-model="situacao">
                <option value="">Ativos e inativos</option>
                <option value="true">Somente ativos</option>
                <option value="false">Somente inativos</option>
            </select>
            <label class="check"><input type="checkbox" v-model="soBaixo" /> Estoque baixo</label>
        </div>

        <p v-if="erro" class="erro">{{ erro }}</p>

        <div class="tabela-area">
            <table>
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Nome</th>
                        <th>Grupo</th>
                        <th>Tipo</th>
                        <th>Tamanho</th>
                        <th>Validade</th>
                        <th>Estoque</th>
                        <th>Situação</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="p in produtos" :key="p.id_produto">
                        <td>{{ p.codigo }}</td>
                        <td>{{ p.nome }}</td>
                        <td>{{ p.grupo }}</td>
                        <td>{{ p.tipo === 'EPI' ? 'EPI' : 'Material' }}</td>
                        <td>{{ p.tamanho || '—' }}</td>
                        <td :class="situacaoValidade(p.validade)">
                            {{ formatarData(p.validade) }}
                            <small v-if="situacaoValidade(p.validade) === 'vencido'"> (vencido)</small>
                            <small v-else-if="situacaoValidade(p.validade) === 'proximo'"> (vence em breve)</small>
                        </td>
                        <td :class="{ baixo: p.estoque_baixo }">
                            {{ p.estoque_atual }} {{ p.unidade_medida }}
                            <small v-if="p.estoque_baixo"> (mín. {{ p.estoque_min }})</small>
                        </td>
                        <td>
                            <span :class="['selo', p.ativo ? 'ativo' : 'inativo']">{{ p.ativo ? 'Ativo' : 'Inativo'
                                }}</span>
                        </td>
                        <td class="acoes">
                            <router-link :to="`/produtos/${p.id_produto}`" class="link">Editar</router-link>
                            <button class="link" @click="alternarAtivo(p)">{{ p.ativo ? 'Desativar' : 'Reativar'
                                }}</button>
                        </td>
                    </tr>
                    <tr v-if="!carregando && produtos.length === 0">
                        <td colspan="9" class="vazio">Nenhum produto encontrado.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </main>
</template>

<style scoped>
.conteudo {
    padding: 24px 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.titulo {
    display: flex;
    justify-content: space-between;
    align-items: center;
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
    align-items: center;
}

input,
select {
    padding: 9px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: .95rem;
    background: #fff;
}

.filtros>input:first-child {
    flex: 1;
    min-width: 220px;
}

label.check {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: .92rem;
}

label.check input {
    padding: 0;
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
    white-space: nowrap;
}

tr+tr td {
    border-top: 1px solid #e5e7eb;
}

td.baixo {
    color: #b91c1c;
    font-weight: 600;
}

td.vencido {
    color: #b91c1c;
    font-weight: 600;
}

td.proximo {
    color: #b45309;
    font-weight: 600;
}

small {
    font-weight: 400;
}

.selo {
    padding: 3px 10px;
    border-radius: 999px;
    font-size: .8rem;
    font-weight: 600;
}

.selo.ativo {
    background: #dcfce7;
    color: #166534;
}

.selo.inativo {
    background: #fee2e2;
    color: #991b1b;
}

.acoes {
    text-align: right;
    white-space: nowrap;
}

a.link,
button.link {
    background: none;
    border: 0;
    color: #2563a8;
    cursor: pointer;
    font-size: .9rem;
    padding: 4px 6px;
    text-decoration: none;
}

a.link:hover,
button.link:hover {
    text-decoration: underline;
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

.vazio {
    text-align: center;
    color: #6b7280;
    padding: 24px;
}
</style>