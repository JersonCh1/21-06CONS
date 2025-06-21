<template>
  <v-app>
    <!-- App Bar - Solo mostrar si no es una página de auth -->
    <v-app-bar 
      v-if="!hideNavigation" 
      color="primary" 
      prominent
      elevation="2"
    >
      <v-app-bar-nav-icon 
        v-if="isMobile" 
        @click="drawer = !drawer"
      ></v-app-bar-nav-icon>
      
      <v-toolbar-title @click="$router.push('/')" class="cursor-pointer">
        <v-icon class="mr-2">mdi-briefcase</v-icon>
        Plataforma de Empleo
      </v-toolbar-title>
      
      <!-- Navegación desktop -->
      <div v-if="!isMobile" class="ml-8">
        <v-btn
          v-for="item in mainMenuItems"
          :key="item.route"
          :to="item.route"
          variant="text"
          class="mr-2"
        >
          <v-icon left>{{ item.icon }}</v-icon>
          {{ item.title }}
        </v-btn>
      </div>
      
      <v-spacer></v-spacer>
      
      <!-- Acciones de usuario -->
      <div class="d-flex align-center">
        <!-- Notificaciones (solo si está autenticado) -->
        <v-btn
          v-if="isAuthenticated"
          icon
          @click="$router.push('/notificaciones')"
          class="mr-2"
        >
          <v-badge
            :content="unreadNotifications"
            :value="unreadNotifications > 0"
            color="error"
          >
            <v-icon>mdi-bell</v-icon>
          </v-badge>
        </v-btn>
        
        <!-- Mensajes (solo si está autenticado) -->
        <v-btn
          v-if="isAuthenticated"
          icon
          @click="$router.push('/mensajes')"
          class="mr-2"
        >
          <v-icon>mdi-message</v-icon>
        </v-btn>
        
        <!-- Menú de usuario o botones de auth -->
        <div v-if="isAuthenticated">
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn
                icon
                v-bind="props"
              >
                <v-avatar size="36">
                  <v-icon>mdi-account-circle</v-icon>
                </v-avatar>
              </v-btn>
            </template>
            
            <v-list>
              <v-list-item>
                <v-list-item-title class="font-weight-bold">
                  {{ user?.nombre || user?.email }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ user?.user_type || user?.rol }}
                </v-list-item-subtitle>
              </v-list-item>
              
              <v-divider></v-divider>
              
              <v-list-item
                v-for="item in userMenuItems"
                :key="item.route"
                :to="item.route"
                @click="item.action && item.action()"
              >
                <template v-slot:prepend>
                  <v-icon>{{ item.icon }}</v-icon>
                </template>
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
        
        <div v-else class="d-flex gap-2">
          <v-btn
            color="white"
            variant="outlined"
            @click="$router.push('/login')"
            size="small"
          >
            Iniciar Sesión
          </v-btn>
          <v-btn
            color="secondary"
            @click="$router.push('/register')"
            size="small"
          >
            Registro
          </v-btn>
        </div>
      </div>
    </v-app-bar>
    
    <!-- Navigation Drawer para móvil -->
    <v-navigation-drawer 
      v-if="!hideNavigation && isMobile"
      v-model="drawer" 
      temporary
    >
      <v-list>
        <v-list-item
          v-if="isAuthenticated"
          class="px-2"
        >
          <div class="d-flex align-center">
            <v-avatar class="mr-3">
              <v-icon>mdi-account-circle</v-icon>
            </v-avatar>
            <div>
              <div class="font-weight-bold">{{ user?.nombre || user?.email }}</div>
              <div class="text-caption text-grey">{{ user?.user_type || user?.rol }}</div>
            </div>
          </div>
        </v-list-item>
        
        <v-divider v-if="isAuthenticated" class="my-2"></v-divider>
        
        <v-list-item
          v-for="item in allMenuItems"
          :key="item.route || item.title"
          :to="item.route"
          @click="item.action && item.action()"
        >
          <template v-slot:prepend>
            <v-icon>{{ item.icon }}</v-icon>
          </template>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
        
        <!-- Botones de auth para móvil si no está autenticado -->
        <div v-if="!isAuthenticated" class="pa-4">
          <v-btn
            color="primary"
            block
            @click="$router.push('/login')"
            class="mb-2"
          >
            Iniciar Sesión
          </v-btn>
          <v-btn
            color="secondary"
            variant="outlined"
            block
            @click="$router.push('/register')"
          >
            Registro
          </v-btn>
        </div>
      </v-list>
    </v-navigation-drawer>
    
    <!-- Contenido principal -->
    <v-main>
      <router-view />
    </v-main>
    
    <!-- Footer simplificado - SIN ENLACES PROBLEMÁTICOS -->
    <v-footer 
      v-if="!hideNavigation" 
      app 
      color="primary" 
      class="text-white"
    >
      <v-container>
        <div class="text-center">
          <span>Plataforma de Empleo &copy; {{ new Date().getFullYear() }}</span>
        </div>
      </v-container>
    </v-footer>
    
    <!-- Snackbar para notificaciones -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      location="top right"
    >
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="snackbar.show = false"
        >
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import api from '/src/api/api'

const route = useRoute()
const router = useRouter()
const { mobile } = useDisplay()

// Estados reactivos
const drawer = ref(false)
const user = ref(null)
const unreadNotifications = ref(0)

// Snackbar para notificaciones
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
  timeout: 4000
})

// Computadas
const isMobile = computed(() => mobile.value)
const hideNavigation = computed(() => route.meta?.hideNavigation || false)
const isAuthenticated = computed(() => {
  const token = localStorage.getItem('token')
  const userData = localStorage.getItem('user')
  return !!(token && userData)
})

// Menús de navegación
const mainMenuItems = computed(() => [
  { title: 'Ofertas', route: '/ofertas', icon: 'mdi-briefcase' },
  { title: 'Empresas', route: '/empresas', icon: 'mdi-domain' },
  { title: 'Postulantes', route: '/postulantes', icon: 'mdi-account-group' }
])

const userMenuItems = computed(() => {
  const baseItems = [
    { title: 'Mi Perfil', route: '/mi-perfil', icon: 'mdi-account' },
    { title: 'Configuración', route: '/configuracion', icon: 'mdi-cog' }
  ]
  
  if (user.value?.user_type === 'postulante' || user.value?.rol === 'usuario') {
    baseItems.unshift(
      { title: 'Mi Currículum', route: '/curriculum', icon: 'mdi-file-document' },
      { title: 'Mis Postulaciones', route: '/mis-postulaciones', icon: 'mdi-file-send' }
    )
  }
  
  if (user.value?.user_type === 'empresa' || user.value?.rol === 'admin') {
    baseItems.unshift(
      { title: 'Mis Ofertas', route: '/mis-ofertas', icon: 'mdi-briefcase-plus' },
      { title: 'Dashboard', route: '/dashboard', icon: 'mdi-view-dashboard' }
    )
  }
  
  baseItems.push(
    { title: 'Cerrar Sesión', action: logout, icon: 'mdi-logout' }
  )
  
  return baseItems
})

const allMenuItems = computed(() => {
  if (!isAuthenticated.value) {
    return mainMenuItems.value
  }
  
  return [
    ...mainMenuItems.value,
    { title: 'Notificaciones', route: '/notificaciones', icon: 'mdi-bell' },
    { title: 'Mensajes', route: '/mensajes', icon: 'mdi-message' },
    ...userMenuItems.value
  ]
})

// Métodos
const loadUser = () => {
  const userData = localStorage.getItem('user')
  if (userData) {
    user.value = JSON.parse(userData)
  }
}

const logout = async () => {
  try {
    // Añadir token a blacklist si es necesario
    const token = localStorage.getItem('token')
    if (token) {
      await api.addTokenToBlacklist(token)
    }
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  } finally {
    // Limpiar datos locales
    api.logout()
    user.value = null
    unreadNotifications.value = 0
    
    // Mostrar mensaje y redirigir
    showSnackbar('Sesión cerrada correctamente', 'info')
    router.push('/login')
  }
}

const loadNotifications = async () => {
  if (!isAuthenticated.value || !user.value?.id) return
  
  try {
    const response = await api.getNotificacionesByUsuario(user.value.id, false)
    unreadNotifications.value = response.data.length
  } catch (error) {
    console.error('Error cargando notificaciones:', error)
  }
}

const showSnackbar = (message, color = 'success', timeout = 4000) => {
  snackbar.value = {
    show: true,
    message,
    color,
    timeout
  }
}

// Watchers
watch(() => route.path, () => {
  // Cerrar drawer en móvil al cambiar de ruta
  if (isMobile.value) {
    drawer.value = false
  }
})

watch(isAuthenticated, (newVal) => {
  if (newVal) {
    loadUser()
    loadNotifications()
  } else {
    user.value = null
    unreadNotifications.value = 0
  }
})

// Lifecycle
onMounted(() => {
  loadUser()
  if (isAuthenticated.value) {
    loadNotifications()
    
    // Actualizar notificaciones cada 30 segundos
    setInterval(() => {
      if (isAuthenticated.value) {
        loadNotifications()
      }
    }, 30000)
  }
})

// Exponer métodos globalmente para uso en otros componentes
window.showSnackbar = showSnackbar
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.gap-2 > * {
  margin-left: 8px;
}

.v-toolbar-title {
  font-weight: bold;
  font-size: 1.25rem;
}

.v-app-bar {
  backdrop-filter: blur(10px);
}

.v-footer {
  margin-top: auto;
}
</style>