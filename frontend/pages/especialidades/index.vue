<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const especialidades = ref([])
const loading = ref(true)

async function carregar() {
  loading.value = true
  try {
    const { data } = await api.get('/especialidades')
    especialidades.value = data
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

async function remover(id) {
  if (!confirm('Deseja remover esta especialidade?')) return

  await api.delete(`/especialidades/${id}`)
  await carregar()
}

onMounted(carregar)
</script>

<template>
  <div class="page-wrapper">

    <div class="page-header">
      <div>
        <h1>Especialidades</h1>
        <p>Gerencie as especialidades médicas do sistema</p>
      </div>

      <NuxtLink to="/especialidades/novo" class="new-button">
        Nova especialidade
      </NuxtLink>
    </div>

    <div v-if="loading" class="empty-state">
      Carregando...
    </div>

    <div v-else-if="especialidades.length === 0" class="empty-state">
      Nenhuma especialidade cadastrada.
    </div>

    <table v-else class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nome</th>
          <th>Descrição</th>
          <th>Ações</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="esp in especialidades" :key="esp.id">
          <td>{{ esp.id }}</td>
          <td>{{ esp.nome }}</td>
          <td>{{ esp.descricao }}</td>
          <td>
            <button @click="remover(esp.id)">Excluir</button>
          </td>
        </tr>
      </tbody>
    </table>

  </div>
</template>

<style scoped>
.page-wrapper {
  padding: 40px;
  color: #f0fdf4;
}

/* --- HEADER --- */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.page-header h1 {
  color: #fff;
  font-size: 34px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.page-header p {
  color: rgba(255, 255, 255, 0.45);
  font-size: 14px;
  margin-top: 4px;
}

/* Botão Nova Especialidade */
.new-button {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.new-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
  filter: brightness(1.1);
}

/* --- ESTADO VAZIO / CARREGAMENTO --- */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  color: #ffffff;
  font-size: 15px;
  font-weight: 500;
  text-align: center;
}

/* --- TABELA --- */
.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: rgba(12, 19, 24, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  overflow: hidden;
}

.table th,
.table td {
  padding: 16px 24px;
  text-align: left;
}

.table th {
  background: rgba(255, 255, 255, 0.02);
  color: rgba(255, 255, 255, 0.4);
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.table td {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  vertical-align: middle;
}

.table tr:last-child td {
  border-bottom: none;
}

.table tbody tr {
  transition: background 0.2s ease;
}

.table tbody tr:hover {
  background: rgba(255, 255, 255, 0.02);
}

.table td:first-child {
  color: rgba(255, 255, 255, 0.4);
  font-family: monospace;
}

/* --- BOTÃO EXCLUIR --- */
.table button {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.2);
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.table button:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}
</style>