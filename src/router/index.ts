// src\router\index.ts
import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import LearnPage from '@/views/LearnPage.vue'
import SolvePage from '@/views/SolvePage.vue'
import NotePage from '@/views/NotePage.vue'
import DashboardPage from '@/views/DashboardPage.vue'

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

export default router
