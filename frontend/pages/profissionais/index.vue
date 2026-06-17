<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const authStore = useAuthStore()
const profissionais = ref([])
const carregando = ref(true)
const busca = ref('')

const { listarProfissionais } = useProfissionais()

async function carregar() {
  try {
    authStore.carregarUsuario()
    await new Promise(resolve => setTimeout(resolve, 50)); 
    profissionais.value = await listarProfissionais()
  } catch (error) {
    console.error('Erro ao carregar profissionais:', error)
  } finally {
    carregando.value = false
  }
}

// Filtro idêntico ao de pacientes
const profissionaisFiltrados = computed(() => {
  if (!busca.value) return profissionais.value
  const termo = busca.value.toLowerCase().trim()
  return profissionais.value.filter(p => {
    return (
      p.nome?.toLowerCase().includes(termo) ||
      p.cpf?.includes(termo) ||
      p.telefone?.includes(termo)
    )
  })
})

onMounted(carregar)
</script>

<template>
  <div class="page-wrapper">
    <div class="page-header">
      <div>
        <h1>Profissionais</h1>
        <p>Gerencie os profissionais cadastrados na plataforma</p>
      </div>

      <NuxtLink to="/profissionais/novo" class="new-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Novo Profissional
      </NuxtLink>
    </div>

    <div class="toolbar">
      <div class="search-wrap">
        <svg class="search-icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 17A8 8 0 109 1a8 8 0 000 16zM15 15l4.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <input v-model="busca" type="text" placeholder="Buscar por nome, CPF ou telefone..." class="search-input" />
      </div>
    </div>

    <div v-if="carregando" class="state-card">
      <div class="spinner"></div>
      <p>Carregando profissionais...</p>
    </div>

    <div v-else-if="profissionaisFiltrados.length === 0" class="state-card empty">
      <p>Nenhum profissional encontrado.</p>
    </div>

    <div v-else class="table-card">
      <table class="clinical-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Telefone</th>
            <th>CPF</th>
            <th>Especialidade</th>
            <th class="text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in profissionaisFiltrados" :key="p.id">
            <td>
              <div class="patient-profile">
                <div class="patient-avatar">{{ p.nome.charAt(0).toUpperCase() }}</div>
                <span class="patient-name">{{ p.nome }}</span>
              </div>
            </td>
            <td class="text-muted">{{ p.telefone }}</td>
            <td class="text-muted">{{ p.cpf }}</td>
            <td class="text-muted">{{ p.especialidade?.nome || '-' }}</td>
            <td class="text-right">
              <NuxtLink :to="`/profissionais/${p.id}`" class="action-link">
                Ver detalhes
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
/* Importação e estilos copiados integralmente do arquivo de pacientes para uniformidade */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;500;600&display=swap');

.page-wrapper { padding: 40px; background-color: #f8fafc; min-height: 100vh; font-family: 'Inter', sans-serif; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
.page-header h1 { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 28px; color: #0f172a; margin: 0 0 4px 0; }
.page-header p { color: #64748b; margin: 0; font-size: 14.5px; }

.new-button { background: #059669; color: #ffffff; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; font-size: 14.5px; display: flex; align-items: center; gap: 8px; transition: all 0.2s ease; }
.new-button:hover { background: #047857; }

.toolbar { margin-bottom: 24px; }
.search-wrap { display: flex; align-items: center; position: relative; max-width: 480px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; }
.search-icon { position: absolute; left: 14px; width: 18px; color: #94a3b8; }
.search-input { width: 100%; border: none; background: transparent; padding: 13px 14px 13px 44px; font-size: 14px; outline: none; }

.table-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; }
.clinical-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14.5px; }
.clinical-table th { background-color: #f8fafc; padding: 16px 24px; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-transform: uppercase; }
.clinical-table td { padding: 16px 24px; border-bottom: 1px solid #f1f5f9; color: #1e293b; }
.patient-profile { display: flex; align-items: center; gap: 12px; }
.patient-avatar { width: 36px; height: 36px; border-radius: 10px; background-color: rgba(5, 150, 105, 0.08); color: #059669; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; }
.text-muted { color: #64748b; }
.text-right { text-align: right; }
.action-link { color: #059669; font-weight: 600; text-decoration: none; }
.action-link:hover { color: #047857; text-decoration: underline; }

.state-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 48px; text-align: center; color: #64748b; }
.spinner { width: 28px; height: 28px; border: 3px solid rgba(5, 150, 105, 0.1); border-radius: 50%; border-top-color: #059669; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>