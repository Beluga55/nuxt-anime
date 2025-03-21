import { ref } from 'vue'

const tokenStatus = ref(false)

export const useTokenStatus = () => {
  const setTokenStatus = (status) => {
    tokenStatus.value = status
  }

  return {
    tokenStatus,
    setTokenStatus
  }
}
