<script setup>
import { computed, watch, watchEffect } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useOrdersStore } from './stores/orders'
import { useUiStore } from './stores/ui'
import BaseButton from './components/BaseButton.vue'

const route = useRoute()
const ordersStore = useOrdersStore()
const { state, toggleTheme, setViewState, showRouteLoading } = useUiStore()

const metrics = computed(() => ordersStore.metrics)
const activeAlerts = computed(() => ordersStore.orders.reduce((sum, order) => sum + order.alerts.length, 0))
const unreadCount = computed(() => ordersStore.unreadCount)
const activeTeam = computed(() => ordersStore.teamMembers.filter((member) => member.online).length)
const pageTitles = {
  dashboard: 'Dashboard overview',
  orders: 'Order listing',
  'order-create': 'Create order',
  'order-edit': 'Edit order',
  'order-detail': 'Order detail',
  activity: 'Notifications and activity',
}

const navigation = [
  { name: 'Dashboard', to: '/' },
  { name: 'Orders', to: '/orders' },
  { name: 'Create Order', to: '/orders/new' },
  { name: 'Activity', to: '/activity' },
]

function isNavActive(item) {
  if (item.to === '/') {
    return route.path === '/'
  }

  if (item.to === '/orders') {
    return route.path === '/orders' || (route.path.startsWith('/orders/') && route.path !== '/orders/new')
  }

  return route.path === item.to
}

watchEffect(() => {
  document.documentElement.dataset.theme = state.darkMode ? 'dark' : 'light'
})

watch(
  () => route.fullPath,
  () => {
    showRouteLoading(500)
  },
  { immediate: true },
)
</script>

<template>
  <div class="shell">
    <aside class="sidebar glass-panel">
      <div>
        <p class="eyebrow">Order Command</p>
        <h1>FlowSpace</h1>
        <p class="muted">A dark-first order management workspace built for real order tracking, fulfillment, and team coordination.</p>
      </div>

      <div class="sidebar-orbit">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <nav class="nav-stack">
        <RouterLink
          v-for="item in navigation"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          :class="{ active: isNavActive(item) }"
        >
          <span>{{ item.name }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar-metrics">
        <div class="mini-stat">
          <span>Open volume</span>
          <strong>{{ metrics.pending + metrics.progress }}</strong>
        </div>
        <div class="mini-stat">
          <span>Unread alerts</span>
          <strong>{{ unreadCount }}</strong>
        </div>
        <div class="mini-stat">
          <span>Active team</span>
          <strong>{{ activeTeam }}/{{ ordersStore.teamMembers.length }}</strong>
        </div>
      </div>
    </aside>

    <div class="workspace">
      <header class="topbar glass-panel">
        <div>
          <p class="eyebrow">Operations cockpit</p>
          <h2>{{ pageTitles[route.name] || 'Workspace' }}</h2>
        </div>

        <div class="topbar-actions">
          <div class="state-switcher">
            <BaseButton
              v-for="mode in ['live', 'loading', 'empty', 'error']"
              :key="mode"
              variant="ghost"
              :class="{ active: state.viewState === mode }"
              @click="setViewState(mode)"
            >
              {{ mode }}
            </BaseButton>
          </div>

          <BaseButton @click="toggleTheme()">
            {{ state.darkMode ? 'Switch to light' : 'Switch to dark' }}
          </BaseButton>
        </div>
      </header>

      <section class="hero-strip glass-panel">
        <div>
          <p class="eyebrow">Live pulse</p>
          <h3>{{ metrics.total }} active sample orders with {{ activeAlerts }} operational flags</h3>
          <p class="muted">Every major screen includes loading, empty, and error previews so the UX behaves like a real product system.</p>
        </div>
        <div class="hero-badges">
          <span class="hero-pill">Pending {{ metrics.pending }}</span>
          <span class="hero-pill">In Progress {{ metrics.progress }}</span>
          <span class="hero-pill">Completed {{ metrics.completed }}</span>
        </div>
      </section>

      <main class="page-stage">
        <RouterView v-slot="{ Component }">
          <Transition name="page-slide" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>
