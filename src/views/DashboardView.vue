<script setup>
import { computed } from 'vue'
import { formatCurrency } from '../data/helpers'
import { useOrdersStore } from '../stores/orders'
import { useUiStore } from '../stores/ui'
import BaseBadge from '../components/BaseBadge.vue'
import BaseCard from '../components/BaseCard.vue'
import StateDisplay from '../components/StateDisplay.vue'

const ordersStore = useOrdersStore()
const { state, isPageLoading } = useUiStore()
const metrics = computed(() => ordersStore.metrics)
const revenue = computed(() => formatCurrency(ordersStore.revenue))
const completionAverage = computed(() => (
  ordersStore.orders.length
    ? Math.round(ordersStore.orders.reduce((sum, order) => sum + order.completion, 0) / ordersStore.orders.length)
    : 0
))
const chartBars = computed(() => [
  { label: 'Pending', value: metrics.value.pending, tone: 'pending' },
  { label: 'In Progress', value: metrics.value.progress, tone: 'progress' },
  { label: 'Completed', value: metrics.value.completed, tone: 'completed' },
  { label: 'Cancelled', value: metrics.value.cancelled, tone: 'cancelled' },
])
const recentOrders = computed(() => ordersStore.orders.slice(0, 3))
</script>

<template>
  <StateDisplay
    v-if="isPageLoading"
    mode="loading"
    eyebrow="Dashboard loading"
    title="Preparing dashboard"
    message="Metrics cards and visual indicators are being assembled."
  />

  <StateDisplay
    v-else-if="state.viewState === 'error'"
    mode="error"
    eyebrow="Dashboard error"
    title="Analytics feed could not be loaded."
    message="Reconnect metrics service or retry the sample data stream."
  />

  <StateDisplay
    v-else-if="state.viewState === 'empty'"
    mode="empty"
    eyebrow="No orders yet"
    title="Your dashboard will light up when the first order arrives."
    message="Use the Create Order screen to add the first record and test the workflow."
  />

  <section v-else class="dashboard-grid">
    <BaseCard class="stat-card accent">
      <span>Total orders</span>
      <strong>{{ metrics.total }}</strong>
      <small>{{ revenue }} total booked value</small>
    </BaseCard>
    <BaseCard class="stat-card">
      <span>Pending</span>
      <strong>{{ metrics.pending }}</strong>
      <small>Needs confirmation or stock release</small>
    </BaseCard>
    <BaseCard class="stat-card">
      <span>In progress</span>
      <strong>{{ metrics.progress }}</strong>
      <small>Orders moving through pick and pack</small>
    </BaseCard>
    <BaseCard class="stat-card">
      <span>Completed</span>
      <strong>{{ metrics.completed }}</strong>
      <small>{{ completionAverage }}% average completion score</small>
    </BaseCard>
    <BaseCard class="stat-card warn">
      <span>Cancelled</span>
      <strong>{{ metrics.cancelled }}</strong>
      <small>Monitor refund and churn reasons</small>
    </BaseCard>

    <BaseCard class="chart-card">
      <div class="section-head">
        <div>
          <p class="eyebrow">Status mix</p>
          <h3>Operational distribution</h3>
        </div>
        <BaseBadge variant="subtle">Live visual indicator</BaseBadge>
      </div>

      <div class="bar-chart">
        <div v-for="item in chartBars" :key="item.label" class="bar-row">
          <div class="bar-meta">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </div>
          <div class="bar-track">
            <div
              class="bar-fill"
              :class="item.tone"
              :style="{ width: `${metrics.total ? (item.value / metrics.total) * 100 : 0}%` }"
            ></div>
          </div>
        </div>
      </div>
    </BaseCard>

    <BaseCard class="list-card">
      <div class="section-head">
        <div>
          <p class="eyebrow">Recent orders</p>
          <h3>Priority queue</h3>
        </div>
      </div>
      <div class="order-brief" v-for="order in recentOrders" :key="order.id">
        <div>
          <strong>{{ order.id }}</strong>
          <p>{{ order.customer }}</p>
        </div>
        <div>
          <BaseBadge :variant="order.status">{{ order.status }}</BaseBadge>
          <p>{{ order.priority }} priority</p>
        </div>
      </div>
    </BaseCard>
  </section>
</template>
