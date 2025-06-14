import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import LearnPage from '@/views/LearnPage.vue'
import ExamPage from '@/views/ExamPage.vue'
import ExamHistoryPage from '@/views/ExamHistoryPage.vue'
import ExamResultPage from '@/views/ExamResultPage.vue'
import WrongNotePage from '@/views/WrongNotePage.vue'
import DashboardPage from '@/views/DashboardPage.vue'
import UploadPage from '@/views/UploadPage.vue'
import ModifyPage from '@/views/ModifyPage.vue'
import AnswerUploader from '@/views/AnswerUploader.vue'


import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  { path: '/home', component: HomePage }, 
  { path: '/learn', component: LearnPage },
  { path: '/exam',
    component: ExamPage, 
    meta: { requiresAuth: true } 
  },
  { path: '/exam/history',
    component: ExamHistoryPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/exam/result/:id',
    name: 'ExamResult',
    component: ExamResultPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/wrong',
    component: WrongNotePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard',
    component: DashboardPage,
    meta: { requiresAdmin: true }
  },
  {
    path: '/upload',
    component: UploadPage,
    meta: { requiresAdmin: true }
  },
  {
    path: '/answers',
    name: 'AnswerUploader',
    component: AnswerUploader,
    meta: { requiresAdmin: true }
  },
  {
    path: '/modify',
    component: ModifyPage,
    meta: { requiresAdmin: true }
  },
  { path: '/', redirect: '/home' },
  {
    path: '/visit-stats',
    name: 'VisitStatsPage',
    component: () => import('@/views/VisitStatsPage.vue'),
    meta: { requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// ✅ 로그인 및 관리자 권한 체크
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const user = userStore.user

  // 로그인 여부 검사
  if (to.meta.requiresAuth && !user) {
    alert('로그인이 필요합니다.')
    return next('/')
  }

  // 관리자 권한 검사
  if (to.meta.requiresAdmin && !user?.is_admin) {
    alert('접근 권한이 없습니다. 관리자만 접근할 수 있습니다.')
    return next('/')
  }

  next()
})

export default router
