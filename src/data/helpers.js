import { teamMembers } from './orders'

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(value) {
  if (!value) {
    return 'Not scheduled'
  }

  const normalizedValue = typeof value === 'string' && value.length === 10 ? `${value}T00:00:00` : value

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(normalizedValue))
}

export function formatRelativeTime(value) {
  if (!value) {
    return 'Just now'
  }

  const diff = Date.now() - new Date(value).getTime()

  if (Number.isNaN(diff) || diff < 60_000) {
    return 'Just now'
  }

  const minutes = Math.round(diff / 60_000)

  if (minutes < 60) {
    return `${minutes} min ago`
  }

  const hours = Math.round(minutes / 60)

  if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`
  }

  const days = Math.round(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

export function getOrderById(orders, id) {
  return orders.find((order) => order.id === id) || null
}

export function getMemberById(id) {
  return teamMembers.find((member) => member.id === id) || null
}

export function getMetrics(orders) {
  const list = Array.isArray(orders) ? orders : []

  return {
    total: list.length,
    pending: list.filter((order) => order.status === 'Pending').length,
    progress: list.filter((order) => order.status === 'In Progress').length,
    completed: list.filter((order) => order.status === 'Completed').length,
    cancelled: list.filter((order) => order.status === 'Cancelled').length,
  }
}

export function getRevenue(orders) {
  const list = Array.isArray(orders) ? orders : []
  return list.reduce((sum, order) => sum + order.value, 0)
}
