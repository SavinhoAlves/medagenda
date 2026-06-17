<script setup>

const route = useRoute()

const menus = [

  {
    nome: 'Dashboard',
    rota: '/dashboard'
  },

  {
    nome: 'Agenda',
    rota: '/agenda'
  },

  {
    nome: 'Pacientes',
    rota: '/pacientes'
  },

  {
    nome: 'Cadastro de Profissionais',
    children: [
      {
        nome: 'Profissionais',
        rota: '/profissionais'
      },
      {
        nome: 'Especialidades',
        rota: '/especialidades'
      }
    ]
  },

  {
    nome: 'Consultas',
    rota: '/consultas'
  }

]

</script>

<template>

  <aside class="sidebar">

    <div class="sidebar-top">

      <div class="logo-mark">
        +
      </div>

      <span class="brand-name">
        MedAgenda
      </span>

    </div>

    <nav class="sidebar-nav">

      <template v-for="menu in menus" :key="menu.nome">

        <!-- MENU NORMAL -->
        <NuxtLink
          v-if="!menu.children"
          :to="menu.rota"
          class="nav-item"
          :class="{ active: route.path === menu.rota }"
        >
          {{ menu.nome }}
        </NuxtLink>

        <!-- SUBMENU -->
        <div v-else class="menu-group">

          <div class="menu-title">
            {{ menu.nome }}
          </div>

          <NuxtLink
            v-for="child in menu.children"
            :key="child.rota"
            :to="child.rota"
            class="nav-item sub"
            :class="{ active: route.path === child.rota }"
          >
            {{ child.nome }}
          </NuxtLink>

        </div>

      </template>

    </nav>

  </aside>

</template>

<style scoped>
.sidebar {
  width: 250px;
  min-height: 100vh;
  background: rgba(8, 13, 16, 0.94);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  padding: 28px 20px;
  display: flex;
  flex-direction: column;
}

.sidebar-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 42px;
}

.logo-mark {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, #10b981, #059669);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 800;
  font-size: 22px;
}

.brand-name {
  font-size: 22px;
  font-weight: 800;
  color: #f0fdf4;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  padding: 14px 16px;
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  transition: .2s ease;
  font-size: 15px;
  font-weight: 500;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.04);
  color: white;
}

.nav-item.active {
  background: rgba(16, 185, 129, 0.12);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

/* --- AJUSTES DO SUBMENU --- */

.menu-group {
  display: flex;
  flex-direction: column; /* Empilha os itens filhos verticalmente */
  gap: 4px;              /* Espaço entre os links internos */
  margin-top: 4px;       /* Ajusta o espaçamento do bloco inteiro no fluxo */
}

.menu-title {
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.3); /* Opacidade balanceada para o título */
  padding: 10px 16px 4px 16px;     /* Reduzido o padding inferior */
  text-transform: uppercase;
  letter-spacing: 0.05em;          /* Melhora a leitura de textos em caixa alta */
}

.nav-item.sub {
  margin-left: 12px;      /* Identação clara para destacar a hierarquia */
  font-size: 14px;
  padding: 10px 16px;     /* Ajuste fino na altura do item interno */
}
</style>