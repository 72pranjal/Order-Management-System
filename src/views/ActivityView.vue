<script setup>
import { computed } from 'vue'
import { formatRelativeTime } from '../data/helpers'
import { useOrdersStore } from '../stores/orders'
import { useUiStore } from '../stores/ui'
import BaseBadge from '../components/BaseBadge.vue'
import BaseCard from '../components/BaseCard.vue'
import StateDisplay from '../components/StateDisplay.vue'

const ordersStore = useOrdersStore()
const { state, isPageLoading } = useUiStore()

const activities = computed(() => ordersStore.activities)
const unreadCount = computed(() => ordersStore.unreadCount)
const grouped = computed(() => ({
  updates: activities.value.filter((item) => item.type === 'update'),
  statusChanges: activities.value.filter((item) => item.type === 'status'),
  alerts: activities.value.filter((item) => item.type === 'alert'),
}))
const summary = computed(() => [
  { label: 'Recent updates', value: grouped.value.updates.length, tone: 'update' },
  { label: 'Status changes', value: grouped.value.statusChanges.length, tone: 'status' },
  { label: 'Alerts', value: grouped.value.alerts.length, tone: 'alert' },
  { label: 'Unread', value: unreadCount.value, tone: 'subtle' },
])
const sections = computed(() => [
  {
    key: 'updates',
    eyebrow: 'Recent updates',
    title: 'Operational changes',
    items: grouped.value.updates,
    badge: 'subtle',
    emptyMessage: 'No update events yet.',
  },
  {
    key: 'statusChanges',
    eyebrow: 'Order status changes',
    title: 'Tracking movement',
    items: grouped.value.statusChanges,
    badge: 'status',
    emptyMessage: 'Status changes will appear here when orders move between stages.',
  },
  {
    key: 'alerts',
    eyebrow: 'Alerts',
    title: 'Needs attention',
    items: grouped.value.alerts,
    badge: 'alert',
    emptyMessage: 'No active alerts right now.',
  },
])

function readState(item) {
  return item.unread ? 'Unread' : 'Read'
}

function badgeVariant(item) {
  if (!item.unread) {
    return 'completed'
  }

  return item.type === 'alert' ? 'alert' : 'subtle'
}

function displayTime(item) {
  return formatRelativeTime(item.createdAt)
}

function markAsRead(id) {
  ordersStore.markActivityRead(id)
}

function markAllAsRead() {
  ordersStore.markAllActivitiesRead()
}
</script>

<template>
  <StateDisplay
    v-if="isPageLoading"
    mode="loading"
    eyebrow="Activity loading"
    title="Preparing updates"
    message="Recent alerts, updates, and status changes are loading."
  />

  <StateDisplay
    v-else-if="state.viewState === 'error'"
    mode="error"
    eyebrow="Activity unavailable"
    title="Notification stream is temporarily offline."
    message="Restore the events pipeline to review recent updates, order status changes, and alerts."
  />

  <StateDisplay
    v-else-if="state.viewState === 'empty' || !activities.length"
    mode="empty"
    eyebrow="All clear"
    title="No new notifications right now."
    message="Unread items and grouped order updates will appear here automatically."
  />

  <section v-else class="activity-layout">
    <BaseCard class="activity-summary-card">
      <div class="section-head">
        <div>
          <p class="eyebrow">Notification center</p>
          <h3>Recent updates, status changes, and alerts</h3>
        </div>
        <div class="activity-toolbar">
          <BaseBadge variant="alert">{{ unreadCount }} unread</BaseBadge>
          <button v-if="unreadCount" type="button" class="button-like" @click="markAllAsRead">Mark all read</button>
        </div>
      </div>

      <div class="activity-summary-grid">
        <div v-for="item in summary" :key="item.label" class="activity-summary-item">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
        </div>
      </div>
    </BaseCard>

    <BaseCard v-for="section in sections" :key="section.key" class="activity-section-card">
      <div class="section-head">
        <div>
          <p class="eyebrow">{{ section.eyebrow }}</p>
          <h3>{{ section.title }}</h3>
        </div>
        <BaseBadge :variant="section.badge">{{ section.items.length }} items</BaseBadge>
      </div>

      <p v-if="!section.items.length" class="muted">{{ section.emptyMessage }}</p>

      <div v-for="item in section.items" :key="item.id" class="activity-feed-item" :class="{ unread: item.unread }">
        <div class="dot" :class="item.type"></div>
        <div>
          <div class="activity-title-row">
            <strong>{{ item.title }}</strong>
            <div class="activity-item-actions">
              <BaseBadge :variant="badgeVariant(item)">{{ readState(item) }}</BaseBadge>
              <button v-if="item.unread" type="button" class="button-like" @click="markAsRead(item.id)">Mark read</button>
            </div>
          </div>
          <p>{{ item.detail }}</p>
          <div class="activity-meta-row">
            <span>{{ item.orderId }}</span>
            <span>{{ displayTime(item) }}</span>
          </div>
        </div>
      </div>
    </BaseCard>
  </section>
</template>
