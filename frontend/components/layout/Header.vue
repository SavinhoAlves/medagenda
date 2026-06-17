<template>
  <header class="navbar-fixed">
    <div class="navbar-inner">
      
      <NuxtLink to="/dashboard" class="nav-logo-zone">
        <div class="logo-icon">+</div>
        <span class="logo-text">MedAgenda</span>
      </NuxtLink>

      <nav class="nav-links-center">
        <NuxtLink 
          to="/dashboard" 
          class="nav-link" 
          :class="{ 'router-link-active': $route.path.startsWith('/dashboard') }"
        >
          Dashboard
        </NuxtLink>
        <NuxtLink 
          to="/agenda" 
          class="nav-link" 
          :class="{ 'router-link-active': $route.path.startsWith('/agenda') }"
        >
          Agenda
        </NuxtLink>
       <NuxtLink 
          to="/pacientes" 
          class="nav-link" 
          :class="{ 'router-link-active': $route.path.startsWith('/pacientes') }"
        >
          Pacientes
        </NuxtLink>
        <NuxtLink 
          to="/profissionais" 
          class="nav-link" 
          :class="{ 'router-link-active': $route.path.startsWith('/profissionais') }"
        >
          Profissionais
        </NuxtLink>
      </nav>

      <div class="nav-profile-zone" ref="profileMenuRef">
        <button 
          class="profile-trigger" 
          @click="toggleDropdown"
          :aria-expanded="dropdownAberto"
          aria-haspopup="true"
        >
          <div class="user-avatar">
            <span>A</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="chevron-icon" :class="{ 'rotate': dropdownAberto }">
            <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        <Transition name="dropdown-fade">
          <div v-if="dropdownAberto" class="profile-dropdown">
            <div class="dropdown-header">
              <span class="user-name">Administrador</span>
              <span class="user-email">admin@medagenda.com</span>
            </div>
            
            <div class="dropdown-divider"></div>

            <button @click="efetuarLogout" class="dropdown-item logout-btn">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="logout-icon">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
              </svg>
              Sair da Conta
            </button>
          </div>
        </Transition>
      </div>

    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
// Alterado de '../stores/auth' para '@/stores/auth' para usar o alias global absoluto do projeto
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const dropdownAberto = ref(false)
const profileMenuRef = ref(null)

const toggleDropdown = () => {
  dropdownAberto.value = !dropdownAberto.value
}

const efetuarLogout = async () => {
  dropdownAberto.value = false
  if (authStore.logout) {
    await authStore.logout()
  } else {
    navigateTo('/login')
  }
}

const fecharAoClicarFora = (event) => {
  if (profileMenuRef.value && !profileMenuRef.value.contains(event.target)) {
    dropdownAberto.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', fecharAoClicarFora)
})

onUnmounted(() => {
  document.removeEventListener('click', fecharAoClicarFora)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@800&family=Inter:wght@500;600;700&display=swap');

.navbar-fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  z-index: 999;
}

.navbar-inner {
  max-width: 1440px;
  height: 100%;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* LOGO */
.nav-logo-zone {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.logo-icon {
  width: 32px;
  height: 32px;
  background: #059669;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 800;
  font-size: 20px;
}

.logo-text {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 800;
  font-size: 20px;
  color: #0f172a;
  letter-spacing: -0.5px;
}

/* LINKS CENTRALIZADOS */
.nav-links-center {
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-link {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  text-decoration: none;
  padding: 10px 16px;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background: #f8fafc;
  color: #0f172a;
}

/* .nav-active {
  background: #f0fdf4 !important;
  color: #059669 !important;
} */

/* Substitua .nav-active por .router-link-active */
.router-link-active {
  background: #f0fdf4 !important;
  color: #059669 !important;
}

/* ZONA DE PERFIL E DROPDOWN */
.nav-profile-zone {
  position: relative;
}

.profile-trigger {
  background: none;
  border: none;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  border-radius: 12px;
  transition: background 0.2s ease;
}

.profile-trigger:hover {
  background: #f8fafc;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: #e2e8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ffffff;
  box-shadow: 0 0 0 1px #cbd5e1;
}

.user-avatar span {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700;
  font-size: 15px;
  color: #475569;
}

.chevron-icon {
  width: 14px;
  height: 14px;
  color: #64748b;
  transition: transform 0.2s ease;
}

.chevron-icon.rotate {
  transform: rotate(180deg);
}

/* BOX DO DROPDOWN */
.profile-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 240px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.03);
  padding: 8px;
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

.dropdown-header {
  padding: 12px 14px 8px;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 14px;
  color: #0f172a;
}

.user-email {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.dropdown-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 6px 6px;
}

.dropdown-item {
  width: 100%;
  background: none;
  border: none;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 13.5px;
  padding: 10px 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
}

.logout-btn {
  color: #ef4444;
}

.logout-btn:hover {
  background: #fef2f2;
}

.logout-icon {
  width: 16px;
  height: 16px;
}

/* TRANSIÇÃO SUAVE */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>