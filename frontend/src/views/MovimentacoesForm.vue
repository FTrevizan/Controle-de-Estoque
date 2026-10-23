<template>
    <div class="container">
        <h1>Nova movimentação</h1>

        <form @submit.prevent="salvar">
            <div>
                <label for="tipo">Tipo de movimentação</label>
                <select id="tipo" v-model="form.tipo" required>
                    <option value="">Selecione</option>
                    <option value="ENTRADA">Entrada</option>
                    <option value="SAIDA">Saída</option>
                </select>
            </div>

            <div>
                <label for="produto">ID do produto</label>
                <input id="produto" v-model="form.produtoId" type="number" min="1" required />
            </div>

            <div>
                <label for="quantidade">Quantidade</label>
                <input id="quantidade" v-model.number="form.quantidade" type="number" min="1" required />
            </div>

            <div>
                <label for="observacao">Observação</label>
                <textarea id="observacao" v-model="form.observacao"></textarea>
            </div>

            <button type="submit">Salvar movimentação</button>
            <button type="button" @click="$router.push('/movimentacoes')">
                Cancelar
            </button>
        </form>
    </div>
</template>

<script>
export default {
    name: 'MovimentacaoForm',

    data() {
        return {
            form: {
                tipo: '',
                produtoId: '',
                quantidade: 1,
                observacao: ''
            }
        };
    },

    methods: {
        salvar() {
            alert('Formulário preenchido. Falta integrar com a API.');
        }
    }
};
</script>
