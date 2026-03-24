<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { formatCurrency, formatDate, getMemberById } from '../data/helpers'
import { useOrdersStore } from '../stores/orders'
import { useUiStore } from '../stores/ui'
import BaseBadge from '../components/BaseBadge.vue'
import BaseButton from '../components/BaseButton.vue'
import BaseCard from '../components/BaseCard.vue'
import BaseInput from '../components/BaseInput.vue'
import BaseModal from '../components/BaseModal.vue'
import StateDisplay from '../components/StateDisplay.vue'

const ordersStore = useOrdersStore()
const { state, isPageLoading } = useUiStore()
const search = ref('')
const statusFilter = ref('All')
const priorityFilter = ref('All')
const dateFilter = ref('All')
const viewMode = ref('grid')
const activePreviewId = ref(null)

const activePreview = computed(() => (
  activePreviewId.value ? ordersStore.getOrderById(activePreviewId.value) : null
))

const filteredOrders = computed(() => {
  return ordersStore.orders.filter((order) => {
    const matchSearch = [order.id, order.customer, order.contact].join(' ').toLowerCase().includes(search.value.toLowerCase())
    const matchStatus = statusFilter.value === 'All' || order.status === statusFilter.value
    const matchPriority = priorityFilter.value === 'All' || order.priority === priorityFilter.value
    const matchDate =
      dateFilter.value === 'All' ||
      (dateFilter.value === 'Today' && isToday(order.date)) ||
      (dateFilter.value === 'This Week' && isThisWeek(order.date))

    return matchSearch && matchStatus && matchPriority && matchDate
  })
})

function parseDate(value) {
  return new Date(`${value}T00:00:00`)
}

function isToday(value) {
  const selectedDate = parseDate(value)
  const today = new Date()

  return selectedDate.getFullYear() === today.getFullYear()
    && selectedDate.getMonth() === today.getMonth()
    && selectedDate.getDate() === today.getDate()
}

function isThisWeek(value) {
  const selectedDate = parseDate(value)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffInDays = (today.getTime() - selectedDate.getTime()) / 86_400_000

  return diffInDays >= 0 && diffInDays < 7
}

function openPreview(order) {
  activePreviewId.value = order.id
}
</script>

<template>
  <StateDisplay
    v-if="isPageLoading"
    mode="loading"
    eyebrow="Order listing loading"
    title="Preparing orders"
    message="Search, filters, and quick actions are loading."
  />

  <StateDisplay
    v-else-if="state.viewState === 'error'"
    mode="error"
    eyebrow="Orders unavailable"
    title="The listing service failed to respond."
    message="Filters, search, and quick actions will return once the feed recovers."
  />

  <section v-else>
    <BaseCard class="filter-bar" as="article">
      <BaseInput v-model="search" placeholder="Search by order id, customer, or contact" />
      <BaseInput v-model="statusFilter" as="select" :options="['All', 'Pending', 'In Progress', 'Completed', 'Cancelled']" />
      <BaseInput v-model="priorityFilter" as="select" :options="['All', 'Critical', 'High', 'Medium', 'Low']" />
      <BaseInput v-model="dateFilter" as="select" :options="['All', 'Today', 'This Week']" />
      <div class="view-switcher">
        <BaseButton variant="ghost" :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'">Grid</BaseButton>
        <BaseButton variant="ghost" :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">List</BaseButton>
      </div>
    </BaseCard>

    <StateDisplay
      v-if="state.viewState === 'empty' || filteredOrders.length === 0"
      mode="empty"
      eyebrow="No matching orders"
      title="Try broadening your filters or create a new order."
      message="Search, date, status, and priority controls are wired for real workflow testing."
    />

    <section v-else class="orders-grid" :class="viewMode">
      <BaseCard v-for="order in filteredOrders" :key="order.id" class="order-card">
        <div class="order-card-head">
          <div>
            <p class="eyebrow">{{ order.id }}</p>
            <h3>{{ order.customer }}</h3>
          </div>
          <BaseBadge :variant="order.status">{{ order.status }}</BaseBadge>
        </div>

        <div class="order-card-meta">
          <span class="priority-chip" :class="order.priority.toLowerCase()">{{ order.priority }}</span>
          <span>{{ formatDate(order.date) }}</span>
          <span>{{ formatCurrency(order.value) }}</span>
        </div>

        <div class="order-card-body">
          <p><strong>Assigned:</strong> {{ getMemberById(order.assignedTo)?.name }}</p>
          <p><strong>Channel:</strong> {{ order.channel }}</p>
          <p><strong>Items:</strong> {{ order.items }}</p>
        </div>

        <div class="progress-rail">
          <div class="progress-fill" :style="{ width: order.completion + '%' }"></div>
        </div>

        <div class="quick-actions">
          <RouterLink class="ghost-link" :to="'/orders/' + order.id">Open detail</RouterLink>
          <RouterLink class="ghost-link" :to="'/orders/' + order.id + '/edit'">Edit order</RouterLink>
          <button class="ghost-link" @click="openPreview(order)">Quick preview</button>
        </div>
      </BaseCard>
    </section>

    <BaseModal :open="activePreview !== null" :title="activePreview ? activePreview.id + ' overview' : ''" @close="activePreviewId = null">
      <div v-if="activePreview" class="modal-content">
        <div class="modal-summary-grid">
          <div>
            <span>Customer</span>
            <strong>{{ activePreview.customer }}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>{{ activePreview.status }}</strong>
          </div>
          <div>
            <span>Priority</span>
            <strong>{{ activePreview.priority }}</strong>
          </div>
          <div>
            <span>Assigned</span>
            <strong>{{ getMemberById(activePreview.assignedTo)?.name }}</strong>
          </div>
        </div>
        <div class="quick-actions">
          <RouterLink class="ghost-link" :to="'/orders/' + activePreview.id">Open detail</RouterLink>
          <RouterLink class="ghost-link" :to="'/orders/' + activePreview.id + '/edit'">Edit order</RouterLink>
        </div>
        <p class="muted">{{ activePreview.notes }}</p>
      </div>
    </BaseModal>
  </section>
</template>
