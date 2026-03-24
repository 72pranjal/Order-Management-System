import { reactive, computed } from 'vue'

let routeLoadingTimer = null

const state = reactive({
  darkMode: true,
  viewState: 'live',
  routeLoading: false,
})

export function useUiStore() {
  const isDark = computed(() => state.darkMode)
  const isPageLoading = computed(() => state.routeLoading || state.viewState === 'loading')

  function toggleTheme() {
    state.darkMode = !state.darkMode
  }

  function setViewState(mode) {
    state.viewState = mode
  }

  function showRouteLoading(duration = 2000) {
    if (routeLoadingTimer) {
      clearTimeout(routeLoadingTimer)
    }

    state.routeLoading = true
    routeLoadingTimer = window.setTimeout(() => {
      state.routeLoading = false
      routeLoadingTimer = null
    }, duration)
  }

  return {
    state,
    isDark,
    isPageLoading,
    toggleTheme,
    setViewState,
    showRouteLoading,
  }
}
