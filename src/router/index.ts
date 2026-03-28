import { createRouter, createWebHistory } from 'vue-router';

import DashboardView from '@/views/DashboardView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: DashboardView,
    },
    {
      path: '/smart-ptc',
      name: 'smart-ptc',
      component: () => import('@/views/SmartPTC/MeetingListView.vue'),
    },
    {
      path: '/smart-ptc/propose',
      name: 'smart-ptc-propose',
      component: () => import('@/views/SmartPTC/AgendaProposalView.vue'),
    },
    {
      path: '/smart-ptc/meeting/:id',
      name: 'smart-ptc-meeting',
      component: () => import('@/views/SmartPTC/MeetingDetailView.vue'),
    },
    {
      path: '/smart-ptc/meeting/:id/print',
      name: 'smart-ptc-meeting-print',
      component: () => import('@/views/SmartPTC/MeetingReportPrint.vue'),
    },
    {
      path: '/smart-ptc/meeting/:id/agenda-print',
      name: 'smart-ptc-agenda-print',
      component: () => import('@/views/SmartPTC/AgendaExportPrint.vue'),
    },
  ],
});

export default router;
