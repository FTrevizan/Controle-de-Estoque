<script setup>
import { ref, watch, onMounted } from 'vue';
import api from '../api.js';
import Topo from '../components/Topo.vue';

const grupos = ref([]);
const busca = ref('');
const erro = ref('');
const carregando = ref(false);

const abertos = ref({});

async function carregar() {
    erro.value = '';
    carregando.value = true;
    abertos.value = {};
    try {
        const params = busca.value.trim() ? { busca: busca.value.trim() } : {};
        const { data } = await api.get('/grupos', { params });
        grupos.value = data;
    } catch (e) {
        erro.value = e.response?.data?.erro || 'Não foi possível carregar os grupos.';
    } finally {
        carregando.value = false;
    }
}

async function alternar(g) {
    if (abertos.value[g.id_grupo]) {
        delete abertos.value[g.id_grupo];
        return;
    }
    abertos.value[g.id_grupo] = { carregando: true, produtos: [] };
    try {
        const { data } = await api.get('/produtos', { params: { grupo: g.id_grupo } });
        abertos.value[g.id_grupo] = { carregando: false, produtos: data };
    } catch (e) {
        delete abertos.value[g.id_grupo];
        erro.value = e.response?.data?.erro || 'Não foi possível carregar os produtos do grupo.';
    }
}

async function excluir(grupo) {
    if (!confirm(`Deseja excluir o grupo "${grupo.nome}"?`)) return;
    erro.value = '';
    try {
        await api.delete(`/grupos/${grupo.id_grupo}`);
        await carregar();
    } catch (e) {
        erro.value = e.response?.data?.erro || 'Não foi possível excluir o grupo.';
    }
}

let espera;
watch(busca, () => {
    clearTimeout(espera);
    espera = setTimeout(carregar, 300);
});

onMounted(carregar);
</script>

<template>
    <Topo />

    <main class="conteudo">
        <div class="titulo">
            <h2>Grupos de produtos</h2>
            <router-link to="/grupos/novo" class="botao">+ Novo grupo</router-link>
        </div>

        <div class="filtros">
            <input v-model="busca" placeholder="Buscar por nome do grupo" />
        </div>

        <p v-if="erro" class="erro">{{ erro }}</p>

        <div class="tabela-area">
            <table>
                <thead>
                    <tr>
                        <th></th>
                        <th>Nome</th>
                        <th>Descrição</th>
                        <th>Produtos</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="g in grupos" :key="g.id_grupo">
                        <tr>
                            <td class="seta">
                                <button class="link" :disabled="g.total_produtos === 0"
                                    :title="g.total_produtos === 0 ? 'Grupo sem produtos' : 'Ver produtos do grupo'"
                                    @click="alternar(g)">
                                    {{ abertos[g.id_grupo] ? '▼' : '▶' }}
                                </button>
                            </td>
                            <td>{{ g.nome }}</td>
                            <td>{{ g.descricao || '—' }}</td>
                            <td>
                                <router-link :to="{ name: 'produtos', query: { grupo: g.id_grupo } }" class="link">
                                    {{ g.total_produtos }}
                                </router-link>
                                <span v-if="g.total_baixo > 0" class="alerta">
                                    {{ g.total_baixo }} com estoque baixo
                                </span>
                            </td>
                            <td class="acoes">
                                <router-link :to="`/grupos/${g.id_grupo}`" class="link">Editar</router-link>
                                <button class="link" @click="excluir(g)">Excluir</button>
                            </td>
                        </tr>


                        <tr v-if="abertos[g.id_grupo]" class="detalhe">
                            <td colspan="5">
                                <p v-if="abertos[g.id_grupo].carregando" class="vazio">Carregando...</p>
                                <table v-else class="interna">
                                    <thead>
                                        <tr>
                                            <th>Código</th>
                                            <th>Nome</th>
                                            <th>Tamanho</th>
                                            <th>Estoque</th>
                                            <th>Situação</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="p in abertos[g.id_grupo].produtos" :key="p.id_produto">
                                            <td>{{ p.codigo }}</td>
                                            <td>{{ p.nome }}</td>
                                            <td>{{ p.tamanho || '—' }}</td>
                                            <td :class="{ baixo: p.estoque_baixo && p.ativo }">
                                                {{ p.estoque_atual }} {{ p.unidade_medida }}
                                                <small v-if="p.estoque_baixo && p.ativo"> (mín. {{ p.estoque_min
                                                }})</small>
                                            </td>
                                            <td>{{ p.ativo ? 'Ativo' : 'Inativo' }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </template>

                    <tr v-if="!carregando && grupos.length === 0">
                        <td colspan="5" class="vazio">Nenhum grupo encontrado.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </main>
</template>

<style scoped>
.conteudo {
    padding: 24px 20px;
    max-width: 1000px;
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
}

input {
    flex: 1;
    min-width: 220px;
    padding: 9px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: .95rem;
    background: #fff;
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

.seta {
    width: 40px;
    padding-right: 0;
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

button.link:disabled {
    color: #cbd5e1;
    cursor: default;
    text-decoration: none;
}

.alerta {
    margin-left: 8px;
    color: #b91c1c;
    background: #fee2e2;
    font-size: .78rem;
    font-weight: 600;
    padding: 3px 9px;
    border-radius: 999px;
}

.detalhe>td {
    background: #f8fafc;
    padding: 8px 14px 14px 54px;
}

.interna {
    background: #fff;
    border-radius: 8px;
    overflow: hidden;
}

.interna th,
.interna td {
    padding: 8px 12px;
    font-size: .88rem;
}

td.baixo {
    color: #b91c1c;
    font-weight: 600;
}

small {
    font-weight: 400;
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