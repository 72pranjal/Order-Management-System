<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { formatCurrency, formatDate, getMemberById } from '../data/helpers'
import { useOrdersStore } from '../stores/orders'
import { useUiStore } from '../stores/ui'
import BaseBadge from '../components/BaseBadge.vue'
import BaseCard from '../components/BaseCard.vue'
import StateDisplay from '../components/StateDisplay.vue'

const route = useRoute()
const ordersStore = useOrdersStore()
const { state, isPageLoading } = useUiStore()
const order = computed(() => ordersStore.getOrderById(route.params.id))
const assignee = computed(() => (order.value ? getMemberById(order.value.assignedTo) : null))
const progressStyle = computed(() => ({ '--progress-angle': `${order.value ? order.value.completion * 3.6 : 0}deg` }))
</script>

<template>
  <StateDisplay
    v-if="isPageLoading"
    mode="loading"
    eyebrow="Detail loading"
    title="Preparing selected order"
    message="Customer profile, timeline, and status visualization are loading."
  />

  <StateDisplay
    v-else-if="state.viewState === 'error'"
    mode="error"
    eyebrow="Detail unavailable"
    title="We could not load the selected order detail."
    message="Customer profile, timeline, and notes are temporarily unavailable."
  />

  <StateDisplay
    v-else-if="!order"
    mode="empty"
    eyebrow="Order not found"
    title="We could not find the selected order."
    message="Return to the listing page and pick a valid order to continue."
  >
    <RouterLink class="ghost-link" to="/orders">Go to orders</RouterLink>
  </StateDisplay>

  <StateDisplay
    v-else-if="state.viewState === 'empty'"
    mode="empty"
    eyebrow="No order selected"
    title="Pick an order from the listing page to inspect its workflow."
    message="This critical screen focuses on hierarchy, status visibility, and real usability."
  >
    <RouterLink class="ghost-link" to="/orders">Go to orders</RouterLink>
  </StateDisplay>

  <section v-else class="detail-grid">
    <BaseCard class="detail-summary">
      <div class="section-head">
        <div>
          <p class="eyebrow">Order summary</p>
          <h3>{{ order.id }} · {{ order.customer }}</h3>
        </div>
        <div class="detail-actions">
          <BaseBadge :variant="order.status">{{ order.status }}</BaseBadge>
          <RouterLink class="ghost-link" :to="'/orders/' + order.id + '/edit'">Edit order</RouterLink>
        </div>
      </div>

      <div class="detail-kpis">
        <div>
          <span>Order value</span>
          <strong>{{ formatCurrency(order.value) }}</strong>
        </div>
        <div>
          <span>Due date</span>
          <strong>{{ formatDate(order.dueDate) }}</strong>
        </div>
        <div>
          <span>Priority</span>
          <strong>{{ order.priority }}</strong>
        </div>
      </div>

      <div class="status-visual">
        <div class="status-ring" :style="progressStyle">
          <strong>{{ order.completion }}%</strong>
          <span>Complete</span>
        </div>
        <div class="timeline-list">
          <div v-for="step in order.timeline" :key="step.label" class="timeline-item" :class="{ done: step.done }">
            <span class="timeline-bullet"></span>
            <div>
              <strong>{{ step.label }}</strong>
              <p>{{ step.time }}</p>
            </div>
          </div>
        </div>
      </div>
    </BaseCard>

    <BaseCard class="customer-card">
      <p class="eyebrow">Customer details</p>
      <h3>{{ order.contact }}</h3>
      <p>{{ order.email }}</p>
      <p>{{ order.phone }}</p>
      <p>{{ order.city }}</p>
      <div class="assignee-card">
        <div class="avatar-pill">{{ assignee?.avatar }}</div>
        <div>
          <strong>{{ assignee?.name }}</strong>
          <p>{{ assignee?.role }}</p>
        </div>
      </div>
    </BaseCard>

    <BaseCard class="note-card">
      <p class="eyebrow">Notes and remarks</p>
      <h3>Ops context</h3>
      <p>{{ order.notes }}</p>
      <div class="alert-stack">
        <BaseBadge v-for="alert in order.alerts" :key="alert" variant="alert">{{ alert }}</BaseBadge>
      </div>
      <RouterLink class="ghost-link" :to="'/orders/' + order.id + '/edit'">Open editor</RouterLink>
    </BaseCard>
  </section>
</template>
