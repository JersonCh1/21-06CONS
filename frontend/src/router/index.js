import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import OfertasView from '../views/OfertasView.vue'
import EmpresasView from '../views/EmpresasView.vue'
import PostulantesView from '../views/PostulantesView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { hideNavigation: true }
  },
  {
    path: '/register',
    name: 'register', 
    component: RegisterView,
    meta: { hideNavigation: true }
  },
  {
    path: '/ofertas',
    name: 'ofertas',
    component: OfertasView
  },
  {
    path: '/empresas',
    name: 'empresas',
    component: EmpresasView
  },
  {
    path: '/postulantes',
    name: 'postulantes',
    component: PostulantesView
  },
  {
    path: '/postulantes/:id',
    name: 'postulante-detail',
    component: () => import('../views/PostulanteDetailView.vue')
  },
  {
    path: '/curriculum',
    name: 'curriculum',
    component: () => import('../views/CurriculumView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router