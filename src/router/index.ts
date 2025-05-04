// src/router/index.ts
import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import LearnPage from '@/views/LearnPage.vue'
import SolvePage from '@/views/SolvePage.vue'
import NotePage from '@/views/NotePage.vue'
import DashboardPage from '@/views/DashboardPage.vue'
import UploadPage from '@/views/UploadPage.vue'
import ModifyPage from '@/views/ModifyPage.vue'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  { path: '/learn', component: LearnPage },
  { path: '/solve', component: SolvePage },
  { path: '/note', component: NotePage },
  
  { 
    path: '/dashboard',
    component: DashboardPage,
    meta: { requiresAdmin: true },
  },
  {
    path: '/upload',
    component: UploadPage,
    meta: { requiresAdmin: true }
  },
  {
    path: '/modify',
    component: ModifyPage,
    meta: { requiresAdmin: true }
  },
  { path: '/', redirect: '/learn' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// ✅ admin 권한 체크용 글로벌 가드 추가
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const user = userStore.user

  if (to.meta.requiresAdmin && !user?.is_admin) {
    alert('접근 권한이 없습니다. 관리자만 접근할 수 있습니다.')
    return next('/')
  }

  next()
})

export default router
