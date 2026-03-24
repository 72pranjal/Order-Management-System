import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { initialActivities, initialOrders, teamMembers } from '../data/orders'
import { getMetrics, getRevenue } from '../data/helpers'

const ORDERS_STORAGE_KEY = 'flowspace.orders.india.v2'
const ACTIVITIES_STORAGE_KEY = 'flowspace.activities.india.v2'
const STATUS_COMPLETION = {
  Pending: 18,
  'In Progress': 68,
  Completed: 100,
  Cancelled: 0,
}

function cloneRecords(value) {
  return JSON.parse(JSON.stringify(value))
}

function readStorage(key, fallback) {
  if (typeof window === 'undefined') {
    return cloneRecords(fallback)
  }

  try {
    const rawValue = window.localStorage.getItem(key)

    if (!rawValue) {
      return cloneRecords(fallback)
    }

    const parsedValue = JSON.parse(rawValue)
    return Array.isArray(parsedValue) ? parsedValue : cloneRecords(fallback)
  } catch {
    return cloneRecords(fallback)
  }
}

function writeStorage(key, value) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

function formatShortDate(value) {
  if (!value) {
    return 'Pending'
  }

  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

function completionForStatus(status, fallback = 0) {
  return STATUS_COMPLETION[status] ?? fallback
}

function createTimeline(order) {
  const orderDate = formatShortDate(order.date)
  const dueDate = formatShortDate(order.dueDate)

  if (order.status === 'Completed') {
    return [
      { label: 'Order Received', time: orderDate, done: true },
      { label: 'Processing Complete', time: orderDate, done: true },
      { label: 'Dispatched', time: dueDate, done: true },
      { label: 'Delivered', time: dueDate, done: true },
    ]
  }

  if (order.status === 'Cancelled') {
    return [
      { label: 'Order Received', time: orderDate, done: true },
      { label: 'Review Complete', time: orderDate, done: true },
      { label: 'Cancellation Confirmed', time: dueDate, done: true },
      { label: 'Refund Follow-up', time: 'Pending finance review', done: false },
    ]
  }

  if (order.status === 'In Progress') {
    return [
      { label: 'Order Received', time: orderDate, done: true },
      { label: 'Inventory Confirmed', time: orderDate, done: true },
      { label: 'Packing in Progress', time: 'Live', done: true },
      { label: 'Dispatch Window', time: `Planned ${dueDate}`, done: false },
    ]
  }

  return [
    { label: 'Order Received', time: orderDate, done: true },
    { label: 'Verification Queue', time: 'Pending review', done: false },
    { label: 'Packing Queue', time: 'Queued', done: false },
    { label: 'Dispatch Window', time: `Planned ${dueDate}`, done: false },
  ]
}

function sanitizeOrder(record, fallback = {}, options = {}) {
  const { refreshWorkflow = false } = options
  const items = Number(record.items)
  const value = Number(record.value)
  const recordCompletion = Number(record.completion)
  const sanitized = {
    id: record.id || fallback.id || '',
    customer: record.customer?.trim() || fallback.customer || 'New customer',
    contact: record.contact?.trim() || fallback.contact || 'Primary contact',
    email: record.email?.trim() || fallback.email || '',
    phone: record.phone?.trim() || fallback.phone || '',
    city: record.city?.trim() || fallback.city || '',
    items: Number.isFinite(items) && items > 0 ? Math.round(items) : Math.max(1, fallback.items ?? 1),
    value: Number.isFinite(value) && value >= 0 ? value : Math.max(0, fallback.value ?? 0),
    status: record.status || fallback.status || 'Pending',
    priority: record.priority || fallback.priority || 'Medium',
    channel: record.channel || fallback.channel || 'Distributor Portal',
    date: record.date || fallback.date || '',
    dueDate: record.dueDate || fallback.dueDate || '',
    assignedTo: Number(record.assignedTo || fallback.assignedTo || 1),
    notes: record.notes?.trim() || fallback.notes || '',
    alerts: Array.isArray(record.alerts) ? [...record.alerts] : Array.isArray(fallback.alerts) ? [...fallback.alerts] : [],
  }

  sanitized.completion = refreshWorkflow
    ? completionForStatus(sanitized.status, fallback.completion ?? 0)
    : Number.isFinite(recordCompletion)
      ? recordCompletion
      : completionForStatus(sanitized.status, fallback.completion ?? 0)
  sanitized.timeline = !refreshWorkflow && Array.isArray(record.timeline)
    ? record.timeline.map((item) => ({ ...item }))
    : createTimeline(sanitized)
  return sanitized
}

function sortOrders(items) {
  return [...items].sort((left, right) => {
    const dateDelta = new Date(right.date).getTime() - new Date(left.date).getTime()

    if (dateDelta !== 0) {
      return dateDelta
    }

    return right.id.localeCompare(left.id)
  })
}

function sortActivities(items) {
  return [...items].sort((left, right) => {
    const leftTime = new Date(left.createdAt || 0).getTime()
    const rightTime = new Date(right.createdAt || 0).getTime()

    if (rightTime !== leftTime) {
      return rightTime - leftTime
    }

    return Number(right.id) - Number(left.id)
  })
}

function nextOrderId(orders) {
  const highestValue = orders.reduce((currentMax, order) => {
    const matchedValue = /ORD-(\d+)/.exec(order.id || '')
    return matchedValue ? Math.max(currentMax, Number(matchedValue[1])) : currentMax
  }, 1023)

  return `ORD-${highestValue + 1}`
}

function nextActivityId(activities) {
  return activities.reduce((currentMax, item) => Math.max(currentMax, Number(item.id) || 0), 0) + 1
}

function createActivityRecord(activities, payload) {
  return {
    id: nextActivityId(activities),
    unread: true,
    createdAt: new Date().toISOString(),
    ...payload,
  }
}

function hasMeaningfulChanges(previousOrder, nextOrder) {
  return [
    'customer',
    'contact',
    'email',
    'phone',
    'city',
    'items',
    'value',
    'status',
    'priority',
    'channel',
    'date',
    'dueDate',
    'assignedTo',
    'notes',
  ].some((field) => previousOrder[field] !== nextOrder[field])
}

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref(sortOrders(readStorage(ORDERS_STORAGE_KEY, initialOrders).map((item) => sanitizeOrder(item))))
  const activities = ref(sortActivities(readStorage(ACTIVITIES_STORAGE_KEY, initialActivities).map((item) => ({
    ...item,
    unread: Boolean(item.unread),
    createdAt: item.createdAt || new Date().toISOString(),
  }))))

  watch(orders, (value) => {
    writeStorage(ORDERS_STORAGE_KEY, value)
  }, { deep: true })

  watch(activities, (value) => {
    writeStorage(ACTIVITIES_STORAGE_KEY, value)
  }, { deep: true })

  const metrics = computed(() => getMetrics(orders.value))
  const revenue = computed(() => getRevenue(orders.value))
  const unreadCount = computed(() => activities.value.filter((item) => item.unread).length)

  function getOrderById(id) {
    return orders.value.find((order) => order.id === id) || null
  }

  function prependActivity(activity) {
    activities.value = sortActivities([activity, ...activities.value])
  }

  function createOrder(payload) {
    const createdOrder = sanitizeOrder({
      ...payload,
      id: nextOrderId(orders.value),
      alerts: Array.isArray(payload.alerts) ? payload.alerts : [],
    }, {}, { refreshWorkflow: true })

    orders.value = sortOrders([createdOrder, ...orders.value])
    prependActivity(createActivityRecord(activities.value, {
      title: `${createdOrder.customer} order created`,
      detail: `${createdOrder.id} was added with ${createdOrder.status.toLowerCase()} status and assigned to the operations queue.`,
      type: 'update',
      orderId: createdOrder.id,
    }))

    return createdOrder
  }

  function updateOrder(id, payload) {
    const existingOrder = getOrderById(id)

    if (!existingOrder) {
      return null
    }

    const updatedOrder = sanitizeOrder({
      ...existingOrder,
      ...payload,
      id: existingOrder.id,
      alerts: Array.isArray(payload.alerts) ? payload.alerts : existingOrder.alerts,
    }, existingOrder, {
      refreshWorkflow:
        (payload.status || existingOrder.status) !== existingOrder.status
        || payload.date !== existingOrder.date
        || payload.dueDate !== existingOrder.dueDate,
    })

    orders.value = sortOrders(orders.value.map((order) => (order.id === id ? updatedOrder : order)))

    if (existingOrder.status !== updatedOrder.status) {
      prependActivity(createActivityRecord(activities.value, {
        title: `${updatedOrder.customer} moved to ${updatedOrder.status}`,
        detail: `${updatedOrder.id} changed from ${existingOrder.status} to ${updatedOrder.status}.`,
        type: 'status',
        orderId: updatedOrder.id,
      }))
    } else if (hasMeaningfulChanges(existingOrder, updatedOrder)) {
      prependActivity(createActivityRecord(activities.value, {
        title: `${updatedOrder.customer} order updated`,
        detail: `${updatedOrder.id} details, schedule, or ownership were updated.`,
        type: 'update',
        orderId: updatedOrder.id,
      }))
    }

    return updatedOrder
  }

  function markActivityRead(id) {
    activities.value = activities.value.map((item) => (
      item.id === id && item.unread ? { ...item, unread: false } : item
    ))
  }

  function markAllActivitiesRead() {
    activities.value = activities.value.map((item) => (
      item.unread ? { ...item, unread: false } : item
    ))
  }

  return {
    orders,
    activities,
    teamMembers,
    metrics,
    revenue,
    unreadCount,
    getOrderById,
    createOrder,
    updateOrder,
    markActivityRead,
    markAllActivitiesRead,
  }
})
