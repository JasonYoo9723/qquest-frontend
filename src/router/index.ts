// src\router\index.ts
import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import LearnPage from '@/views/LearnPage.vue'
import SolvePage from '@/views/SolvePage.vue'
import NotePage from '@/views/NotePage.vue'
import DashboardPage from '@/views/DashboardPage.vue'
import UploadPage from '@/views/UploadPage.vue'
import { useCertificationStore } from '@/stores/certification'

const routes: RouteRecordRaw[] = [
  { path: '/dashboard', component: DashboardPage },
  { path: '/learn', component: LearnPage, meta: { requiresCert: true } },
  { path: '/solve', component: SolvePage, meta: { requiresCert: true } },
  { path: '/note', component: NotePage },
  { path: '/upload', component: UploadPage },
  { path: '/', redirect: '/dashboard' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const certStore = useCertificationStore()

  // 인증이 필요한 라우트인지 확인
  const needsCert = to.meta.requiresCert === true
  const selectedCert = certStore.selectedCert

  if (needsCert && (!selectedCert || !selectedCert.exam_code)) {
    window.dispatchEvent(new CustomEvent('show-cert-warning'))
    return next('/dashboard')
  }

  next()
})

export default router
