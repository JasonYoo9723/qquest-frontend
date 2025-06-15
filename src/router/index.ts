// src/router/index.ts
import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import HomePage from "@/views/HomePage.vue";
import LearnPage from "@/views/LearnPage.vue";
import ExamPage from "@/views/ExamPage.vue";
import ExamHistoryPage from "@/views/ExamHistoryPage.vue";
import ExamResultPage from "@/views/ExamResultPage.vue";
import WrongNotePage from "@/views/WrongNotePage.vue";
import VisitStatsPage from "@/views/VisitStatsPage.vue";

// 관리자 페이지 (views/admin/)
import CategoryManagementPage from "@/views/admin/CategoryManagementPage.vue";
import ExamManagementPage from "@/views/admin/ExamManagementPage.vue";
import SubjectManagementPage from "@/views/admin/SubjectManagementPage.vue";
import ExamRoundManagementPage from "@/views/admin/ExamRoundManagementPage.vue";
import RoundSubjectManagementPage from "@/views/admin/RoundSubjectManagementPage.vue";
import QuestionManagementPage from "@/views/admin/QuestionManagementPage.vue";

import { useUserStore } from "@/stores/user";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/home",
    component: HomePage,
  },
  {
    path: "/learn",
    component: LearnPage,
  },
  {
    path: "/exam",
    component: ExamPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/wrong",
    component: WrongNotePage,
    meta: { requiresAuth: true },
  },
  {
    path: "/exam/history",
    component: ExamHistoryPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/exam/result/:id",
    name: "ExamResult",
    component: ExamResultPage,
    meta: { requiresAuth: true },
  },

  // 🔒 관리자 기능
  {
    path: "/admin/category",
    component: CategoryManagementPage,
    meta: { requiresAdmin: true },
  },
  {
    path: "/admin/exam",
    component: ExamManagementPage,
    meta: { requiresAdmin: true },
  },
  {
    path: "/admin/subject",
    component: SubjectManagementPage,
    meta: { requiresAdmin: true },
  },
  {
    path: "/admin/round",
    component: ExamRoundManagementPage,
    meta: { requiresAdmin: true },
  },
  {
    path: "/admin/round-subject",
    component: RoundSubjectManagementPage,
    meta: { requiresAdmin: true },
  },
  {
    path: "/admin/question",
    component: QuestionManagementPage,
    meta: { requiresAdmin: true },
  },
  {
    path: "/visit-stats",
    name: "VisitStatsPage",
    component: VisitStatsPage,
    meta: { requiresAdmin: true },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// 로그인 및 관리자 권한 체크
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  const user = userStore.user;

  if (to.meta.requiresAuth && !user) {
    alert("로그인이 필요합니다.");
    return next("/");
  }

  if (to.meta.requiresAdmin && !user?.is_admin) {
    alert("접근 권한이 없습니다. 관리자만 접근할 수 있습니다.");
    return next("/");
  }

  next();
});

export default router;
