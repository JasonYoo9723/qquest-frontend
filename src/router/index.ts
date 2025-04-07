// src\router\index.ts
import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import LearnPage from '@/views/LearnPage.vue'
import SolvePage from '@/views/SolvePage.vue'
import NotePage from '@/views/NotePage.vue'
import DashboardPage from '@/views/DashboardPage.vue'
import { useCertificationStore } from '@/stores/certification'

const routes: RouteRecordRaw[] = [
  { path: '/dashboard', component: DashboardPage },
  { path: '/learn', component: LearnPage },
  { path: '/solve', component: SolvePage },
  { path: '/note', component: NotePage },
  { path: '/', redirect: '/dashboard' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const certStore = useCertificationStore()

  const certId = certStore.selectedCert?.id
  const isInvalid = !certId || certId === ''

  const requiresCert = ['/learn', '/solve']

  if (requiresCert.includes(to.path) && isInvalid) {
    window.dispatchEvent(new CustomEvent('show-cert-warning'))
    next('/dashboard') // 또는 next(false)
  } else {
    next()
  }
})

export default router
