import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import OrdersView from '../views/OrdersView.vue'
import OrderDetailView from '../views/OrderDetailView.vue'
import OrderFormView from '../views/OrderFormView.vue'
import ActivityView from '../views/ActivityView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: DashboardView },
    { path: '/orders', name: 'orders', component: OrdersView },
    { path: '/orders/new', name: 'order-create', component: OrderFormView },
    { path: '/orders/:id/edit', name: 'order-edit', component: OrderFormView },
    { path: '/orders/:id', name: 'order-detail', component: OrderDetailView },
    { path: '/activity', name: 'activity', component: ActivityView },
  ],
})

export default router
