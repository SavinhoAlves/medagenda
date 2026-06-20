<template>
  <header class="navbar-fixed">
    <div class="navbar-inner">

      <!-- Esquerda: marca -->
      <div class="navbar-left">
        <NuxtLink to="/dashboard" class="nav-brand">
          <div class="brand-icon">+</div>
          <span class="brand-name">MedAgenda</span>
        </NuxtLink>
      </div>

      <!-- Centro: links de navegação -->
      <nav class="nav-links">
        <NuxtLink
          v-for="item in navItems"
          :key="item.rota"
          :to="item.rota"
          class="nav-link"
          :class="{ active: isActive(item.rota) }"
        >
          <component :is="item.icon" :size="14" class="nav-icon" />
          {{ item.nome }}
        </NuxtLink>
        <NuxtLink
          v-if="isAdmin"
          to="/solicitacoes"
          class="nav-link"
          :class="{ active: isActive('/solicitacoes') }"
        >
          <FileText :size="14" class="nav-icon" />
          Solicitações
        </NuxtLink>
      </nav>

      <!-- Ações direitas -->
      <div class="nav-actions">
        <LayoutNotificacaoBell />

        <button class="icon-btn" @click="toggleTheme" :title="isDark ? 'Modo claro' : 'Modo escuro'">
          <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="theme-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="theme-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
          </svg>
        </button>

        <div class="nav-profile-zone" ref="profileMenuRef">
          <button class="profile-trigger" @click="toggleDropdown" :aria-expanded="dropdownAberto" aria-haspopup="true">
            <div class="user-avatar">
              <span>{{ letraAvatar }}</span>
            </div>
            <div class="user-info">
              <span class="user-name-sm">{{ nomeExibido }}</span>
              <span class="user-cargo-sm">{{ cargoExibido }}</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="chevron-icon" :class="{ rotate: dropdownAberto }">
              <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          <Transition name="dropdown-fade">
            <div v-if="dropdownAberto" class="profile-dropdown">
              <div class="dropdown-header">
                <span class="dd-name">{{ nomeExibido }}</span>
                <span class="dd-cargo">{{ cargoExibido }}</span>
                <span class="dd-email">{{ emailExibido }}</span>
              </div>

              <div class="dropdown-divider" />

              <NuxtLink to="/configuracoes" class="dropdown-item" @click="dropdownAberto = false">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="dd-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
                Configurações
              </NuxtLink>

              <div class="dropdown-divider" />

              <button @click="efetuarLogout" class="dropdown-item logout-btn">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="dd-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                </svg>
                Sair da conta
              </button>
            </div>
          </Transition>
        </div>
      </div>

    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  LayoutDashboard, CalendarDays, Users, Clipboard,
  UserCog, Stethoscope, CreditCard, FileText
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useTheme } from '@/composables/useTheme'

const route     = useRoute()
const authStore = useAuthStore()
const { isDark, toggleTheme } = useTheme()

const dropdownAberto = ref(false)
const profileMenuRef = ref(null)

const usuario      = computed(() => authStore.usuario)
const nomeExibido  = computed(() => usuario.value?.nome  || 'Usuário')
const emailExibido = computed(() => usuario.value?.email || '')
const cargoExibido = computed(() => {
  const c = usuario.value?.cargo || ''
  return c.charAt(0).toUpperCase() + c.slice(1).toLowerCase()
})
const letraAvatar = computed(() => nomeExibido.value.charAt(0).toUpperCase())
const isAdmin     = computed(() => usuario.value?.cargo === 'admin')

const navItems = [
  { nome: 'Dashboard',    rota: '/dashboard',     icon: LayoutDashboard },
  { nome: 'Agenda',       rota: '/agenda',         icon: CalendarDays },
  { nome: 'Pacientes',    rota: '/pacientes',      icon: Users },
  { nome: 'Consultas',    rota: '/consultas',      icon: Clipboard },
  { nome: 'Profissionais',rota: '/profissionais',  icon: UserCog },
  { nome: 'Especialidades',rota: '/especialidades',icon: Stethoscope },
  { nome: 'Convênios',    rota: '/convenios',      icon: CreditCard },
]

function isActive(rota) {
  return route.path === rota || route.path.startsWith(rota + '/')
}

const toggleDropdown = () => { dropdownAberto.value = !dropdownAberto.value }

const efetuarLogout = () => {
  dropdownAberto.value = false
  authStore.logout()
}

const fecharAoClicarFora = (e) => {
  if (profileMenuRef.value && !profileMenuRef.value.contains(e.target)) {
    dropdownAberto.value = false
  }
}

onMounted(() => document.addEventListener('click', fecharAoClicarFora))
onUnmounted(() => document.removeEventListener('click', fecharAoClicarFora))
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;500;600&display=swap');

.navbar-fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--topbar-h, 64px);
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  z-index: 200;
}

.navbar-inner {
  height: 100%;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
}

/* ── Esquerda ── */
.navbar-left {
  display: flex;
  align-items: center;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 9px;
  text-decoration: none;
}

.brand-icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: linear-gradient(135deg, #10b981, #059669);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 800;
  font-size: 17px;
  flex-shrink: 0;
}

.brand-name {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 15px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.2px;
  white-space: nowrap;
}

/* ── Centro: links de navegação ── */
.nav-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1px;
  overflow-x: auto;
  scrollbar-width: none;
}

.nav-links::-webkit-scrollbar { display: none; }

.nav-link {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s;
}

.nav-link:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.nav-link.active {
  background: #f0fdf4;
  color: #059669;
  font-weight: 600;
}

.nav-icon { flex-shrink: 0; }

/* ── Direita: ações ── */
.nav-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 2px;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: none;
  border-radius: 9px;
  color: #64748b;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.icon-btn:hover { background: #f0fdf4; color: #059669; }
.theme-icon { width: 18px; height: 18px; }

/* ── Perfil ── */
.nav-profile-zone {
  position: relative;
  margin-left: 4px;
}

.profile-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  padding: 4px 8px 4px 4px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s;
}

.profile-trigger:hover { background: #f8fafc; }

.user-avatar {
  width: 30px;
  height: 30px;
  background: #e2e8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px #cbd5e1;
  flex-shrink: 0;
}

.user-avatar span {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700;
  font-size: 12px;
  color: #475569;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.2;
}

.user-name-sm  { font-size: 12.5px; font-weight: 600; color: #0f172a; white-space: nowrap; }
.user-cargo-sm { font-size: 10.5px; color: #64748b; white-space: nowrap; }

.chevron-icon { width: 12px; height: 12px; color: #94a3b8; transition: transform 0.2s; }
.chevron-icon.rotate { transform: rotate(180deg); }

/* ── Dropdown perfil ── */
.profile-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 240px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  box-shadow: 0 10px 30px -8px rgba(15, 23, 42, 0.12);
  padding: 8px;
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

.dropdown-header {
  padding: 10px 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dd-name  { font-weight: 700; font-size: 13.5px; color: #0f172a; }
.dd-cargo {
  display: inline-block;
  font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px;
  color: #059669; background: #f0fdf4; border: 1px solid #bbf7d0;
  border-radius: 4px; padding: 2px 7px; margin-top: 3px; width: fit-content;
}
.dd-email { font-size: 11.5px; color: #94a3b8; margin-top: 2px; }

.dropdown-divider { height: 1px; background: #f1f5f9; margin: 5px 4px; }

.dropdown-item {
  display: flex; align-items: center; gap: 10px;
  width: 100%; padding: 9px 12px;
  background: none; border: none; border-radius: 8px;
  font-family: 'Inter', sans-serif; font-size: 13.5px; font-weight: 600;
  color: #475569; text-decoration: none; cursor: pointer; text-align: left;
  transition: background 0.15s, color 0.15s;
}

.dropdown-item:hover { background: #f8fafc; color: #0f172a; }
.logout-btn          { color: #ef4444; }
.logout-btn:hover    { background: #fef2f2; color: #dc2626; }

.dd-icon { width: 15px; height: 15px; flex-shrink: 0; }

/* ── Transições ── */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.dropdown-fade-enter-from,
.dropdown-fade-leave-to     { opacity: 0; transform: translateY(-6px); }
</style>
