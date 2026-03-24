<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { formatCurrency, formatDate, getMemberById } from '../data/helpers'
import { useOrdersStore } from '../stores/orders'
import { useUiStore } from '../stores/ui'
import BaseBadge from '../components/BaseBadge.vue'
import BaseButton from '../components/BaseButton.vue'
import BaseCard from '../components/BaseCard.vue'
import BaseInput from '../components/BaseInput.vue'
import StateDisplay from '../components/StateDisplay.vue'

const route = useRoute()
const router = useRouter()
const ordersStore = useOrdersStore()
const { state, isPageLoading } = useUiStore()
const currentStep = ref(1)
const errors = reactive(createEmptyErrors())
const form = reactive(createDefaultForm())

const stepTitles = {
  1: 'Basics',
  2: 'Scheduling',
  3: 'Ownership',
}

const isEditMode = computed(() => route.name === 'order-edit')
const editingOrder = computed(() => (isEditMode.value ? ordersStore.getOrderById(route.params.id) : null))
const assigneeOptions = computed(() => ordersStore.teamMembers.map((member) => member.name))
const visibleErrors = computed(() => Object.values(errors).filter(Boolean))
const assigneeMeta = computed(() => {
  const name = form.assignee || editingOrder.value?.assignedTo
  const member = typeof name === 'string'
    ? ordersStore.teamMembers.find((item) => item.name === name)
    : getMemberById(name)

  return member || ordersStore.teamMembers[0]
})
const formModeLabel = computed(() => (isEditMode.value ? 'Edit order' : 'Create order'))
const formModeChip = computed(() => (isEditMode.value ? 'Edit workflow' : 'Persistent create flow'))
const submitLabel = computed(() => (isEditMode.value ? 'Save changes' : 'Create order'))

watch(
  () => [route.name, route.params.id],
  () => {
    Object.assign(form, createDefaultForm())

    if (editingOrder.value) {
      Object.assign(form, {
        customer: editingOrder.value.customer,
        contact: editingOrder.value.contact,
        email: editingOrder.value.email,
        phone: editingOrder.value.phone,
        city: editingOrder.value.city,
        date: editingOrder.value.date,
        dueDate: editingOrder.value.dueDate,
        status: editingOrder.value.status,
        priority: editingOrder.value.priority,
        channel: editingOrder.value.channel,
        assignee: getMemberById(editingOrder.value.assignedTo)?.name || ordersStore.teamMembers[0].name,
        items: editingOrder.value.items,
        value: editingOrder.value.value,
        notes: editingOrder.value.notes,
      })
    }

    currentStep.value = 1
    clearErrors()
  },
  { immediate: true },
)

function createDefaultForm() {
  return {
    customer: '',
    contact: '',
    email: '',
    phone: '',
    city: '',
    date: formatInputDate(0),
    dueDate: formatInputDate(4),
    status: 'Pending',
    priority: 'Medium',
    channel: 'Distributor Portal',
    assignee: ordersStore.teamMembers[0].name,
    items: 1,
    value: 0,
    notes: '',
  }
}

function createEmptyErrors() {
  return {
    customer: '',
    contact: '',
    email: '',
    date: '',
    dueDate: '',
    items: '',
    value: '',
    assignee: '',
    notes: '',
  }
}

function formatInputDate(offsetDays) {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function clearErrors() {
  Object.assign(errors, createEmptyErrors())
}

function validateStep() {
  clearErrors()

  if (currentStep.value === 1) {
    errors.customer = form.customer.trim() === '' ? 'Customer name is required.' : ''
    errors.contact = form.contact.trim() === '' ? 'Primary contact is required.' : ''
    errors.email = form.email.includes('@') ? '' : 'Add a valid email address.'
  }

  if (currentStep.value === 2) {
    errors.date = form.date.trim() === '' ? 'Order date is required.' : ''
    errors.dueDate = form.dueDate.trim() === '' ? 'Due date is required.' : ''
    errors.items = Number(form.items) > 0 ? '' : 'Items must be at least 1.'
    errors.value = Number(form.value) >= 0 ? '' : 'Order value cannot be negative.'
  }

  if (currentStep.value === 3) {
    errors.assignee = form.assignee.trim() === '' ? 'Assigned person is required.' : ''
    errors.notes = form.notes.trim().length < 12 ? 'Add at least 12 characters of notes.' : ''
  }

  return visibleErrors.value.length === 0
}

function nextStep() {
  if (validateStep() && currentStep.value < 3) {
    currentStep.value += 1
  }
}

function previousStep() {
  if (currentStep.value > 1) {
    currentStep.value -= 1
  }
}

function buildPayload() {
  const assignee = ordersStore.teamMembers.find((item) => item.name === form.assignee) || ordersStore.teamMembers[0]

  return {
    customer: form.customer.trim(),
    contact: form.contact.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    city: form.city.trim(),
    date: form.date,
    dueDate: form.dueDate,
    status: form.status,
    priority: form.priority,
    channel: form.channel,
    assignedTo: assignee.id,
    items: Number(form.items),
    value: Number(form.value),
    notes: form.notes.trim(),
  }
}

async function submitForm() {
  if (!validateStep()) {
    return
  }

  const payload = buildPayload()
  const savedOrder = isEditMode.value
    ? ordersStore.updateOrder(route.params.id, payload)
    : ordersStore.createOrder(payload)

  if (savedOrder) {
    await router.push(`/orders/${savedOrder.id}`)
  }
}
</script>

<template>
  <StateDisplay
    v-if="isPageLoading"
    mode="loading"
    eyebrow="Form loading"
    title="Preparing editor"
    message="Smart inputs, grouped fields, and validation states are loading."
  />

  <StateDisplay
    v-else-if="state.viewState === 'error'"
    mode="error"
    eyebrow="Form unavailable"
    title="The order editor failed to initialize."
    message="Retry to restore smart inputs, grouped fields, and validation states."
  />

  <StateDisplay
    v-else-if="isEditMode && !editingOrder"
    mode="empty"
    eyebrow="Order not found"
    title="We could not find the order you want to edit."
    message="Return to the listing page and choose a valid record to continue editing."
  >
    <RouterLink class="ghost-link" to="/orders">Back to orders</RouterLink>
  </StateDisplay>

  <StateDisplay
    v-else-if="state.viewState === 'empty'"
    mode="empty"
    eyebrow="No draft selected"
    title="Start a fresh order draft to test the step-based workflow."
    message="This screen now saves real orders to local storage and keeps the activity feed in sync."
  />

  <section v-else class="form-grid">
    <BaseCard class="form-panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">{{ formModeLabel }}</p>
          <h3>Step {{ currentStep }} · {{ stepTitles[currentStep] }}</h3>
        </div>
        <BaseBadge variant="subtle">{{ formModeChip }}</BaseBadge>
      </div>

      <div class="form-intro" :class="{ editing: isEditMode }">
        <div class="editor-meta">
          <span>{{ isEditMode ? editingOrder.id : 'New draft' }}</span>
          <strong>{{ isEditMode ? editingOrder.customer : 'New order setup' }}</strong>
          <p class="muted">
            {{ isEditMode ? 'Review customer, schedule, ownership, and notes before saving changes.' : 'Build a complete order and save it directly into the persistent workspace.' }}
          </p>
        </div>
        <div class="editor-note">
          <BaseBadge :variant="form.status">{{ form.status }}</BaseBadge>
          <span>{{ isEditMode ? 'Due ' + formatDate(form.dueDate) : 'Saved in local storage after submit' }}</span>
        </div>
      </div>

      <div class="stepper">
        <div v-for="step in [1, 2, 3]" :key="step" class="step-node" :class="{ active: currentStep === step, complete: currentStep > step }">
          <span>{{ step }}</span>
          <small>{{ stepTitles[step] }}</small>
        </div>
      </div>

      <div v-if="currentStep === 1" class="form-section-grid">
        <label>
          <span>Customer name</span>
          <BaseInput v-model="form.customer" placeholder="Summit Health" />
          <small class="error-text" v-if="errors.customer">{{ errors.customer }}</small>
        </label>
        <label>
          <span>Primary contact</span>
          <BaseInput v-model="form.contact" placeholder="Noah Brooks" />
          <small class="error-text" v-if="errors.contact">{{ errors.contact }}</small>
        </label>
        <label>
          <span>Email</span>
          <BaseInput v-model="form.email" type="email" placeholder="team@client.com" />
          <small class="error-text" v-if="errors.email">{{ errors.email }}</small>
        </label>
        <label>
          <span>Phone</span>
          <BaseInput v-model="form.phone" placeholder="+91 98765 43210" />
        </label>
      </div>

      <div v-else-if="currentStep === 2" class="form-section-grid">
        <label>
          <span>Order date</span>
          <BaseInput v-model="form.date" type="date" />
          <small class="error-text" v-if="errors.date">{{ errors.date }}</small>
        </label>
        <label>
          <span>Due date</span>
          <BaseInput v-model="form.dueDate" type="date" />
          <small class="error-text" v-if="errors.dueDate">{{ errors.dueDate }}</small>
        </label>
        <label>
          <span>Status</span>
          <BaseInput v-model="form.status" as="select" :options="['Pending', 'In Progress', 'Completed', 'Cancelled']" />
        </label>
        <label>
          <span>Priority</span>
          <BaseInput v-model="form.priority" as="select" :options="['Critical', 'High', 'Medium', 'Low']" />
        </label>
        <label>
          <span>Items</span>
          <BaseInput v-model="form.items" type="number" />
          <small class="error-text" v-if="errors.items">{{ errors.items }}</small>
        </label>
        <label>
          <span>Order value</span>
          <BaseInput v-model="form.value" type="number" />
          <small class="error-text" v-if="errors.value">{{ errors.value }}</small>
        </label>
        <label class="full-width">
          <span>Order channel</span>
          <BaseInput v-model="form.channel" as="select" :options="['Distributor Portal', 'Field Sales', 'D2C Store', 'B2B Marketplace', 'Hospital Desk', 'WhatsApp Commerce']" />
        </label>
      </div>

      <div v-else class="form-section-grid">
        <label>
          <span>Assigned person</span>
          <BaseInput v-model="form.assignee" as="select" :options="assigneeOptions" />
          <small class="error-text" v-if="errors.assignee">{{ errors.assignee }}</small>
        </label>
        <label>
          <span>City</span>
          <BaseInput v-model="form.city" placeholder="Bengaluru" />
        </label>
        <label class="full-width">
          <span>Notes and remarks</span>
          <BaseInput v-model="form.notes" as="textarea" placeholder="Add dispatch notes, dependencies, or delivery remarks" />
          <small class="error-text" v-if="errors.notes">{{ errors.notes }}</small>
        </label>
      </div>

      <div class="wizard-actions">
        <div class="quick-actions">
          <BaseButton variant="ghost" @click="previousStep">Back</BaseButton>
          <RouterLink v-if="isEditMode" class="ghost-link" :to="'/orders/' + editingOrder.id">Return to detail</RouterLink>
        </div>
        <BaseButton v-if="currentStep < 3" @click="nextStep">Continue</BaseButton>
        <BaseButton v-else @click="submitForm">{{ submitLabel }}</BaseButton>
      </div>
    </BaseCard>

    <BaseCard class="preview-panel">
      <div class="preview-header">
        <div>
          <p class="eyebrow">{{ isEditMode ? 'Edit summary' : 'Draft preview' }}</p>
          <h3>{{ isEditMode ? 'Current order snapshot' : 'Live draft' }}</h3>
        </div>
        <BaseBadge :variant="form.status">{{ form.status }}</BaseBadge>
      </div>

      <div class="preview-stack">
        <div class="preview-kpi">
          <span>{{ isEditMode ? 'Editing record' : 'Draft mode' }}</span>
          <strong>{{ isEditMode ? editingOrder.id : 'New order' }}</strong>
        </div>
        <div class="preview-kpi">
          <span>Assigned owner</span>
          <strong>{{ assigneeMeta.name }}</strong>
        </div>
        <div class="preview-kpi">
          <span>Estimated value</span>
          <strong>{{ formatCurrency(Number(form.value || 0)) }}</strong>
        </div>
      </div>

      <div class="preview-list">
        <p><strong>Customer:</strong> {{ form.customer || 'Not added yet' }}</p>
        <p><strong>Contact:</strong> {{ form.contact || 'Not added yet' }}</p>
        <p><strong>Email:</strong> {{ form.email || 'Not added yet' }}</p>
        <p><strong>Phone:</strong> {{ form.phone || 'Not added yet' }}</p>
        <p><strong>Channel:</strong> {{ form.channel }}</p>
        <p><strong>Priority:</strong> {{ form.priority }}</p>
        <p><strong>Items:</strong> {{ form.items }}</p>
        <p><strong>Value:</strong> {{ formatCurrency(Number(form.value || 0)) }}</p>
        <p><strong>Assigned:</strong> {{ form.assignee }}</p>
        <p><strong>Due date:</strong> {{ formatDate(form.dueDate) }}</p>
      </div>

      <div v-if="visibleErrors.length" class="error-box">
        <strong>Validation UI</strong>
        <p>{{ visibleErrors[0] }}</p>
      </div>
    </BaseCard>
  </section>
</template>
