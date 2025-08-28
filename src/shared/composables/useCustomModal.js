import { ref, createApp } from 'vue'
import CustomModal from '@/shared/components/common/CustomModal.vue'

// 전역 모달 상태
const modalQueue = ref([])
let currentModalId = 0

/**
 * 커스텀 모달을 쉽게 사용할 수 있는 composable
 */
export function useCustomModal() {
  /**
   * 알림 모달 표시
   * @param {string} message - 표시할 메시지
   * @param {string} title - 모달 제목 (기본값: '알림')
   * @param {string} confirmText - 확인 버튼 텍스트 (기본값: '확인')
   * @returns {Promise<boolean>} - 확인 시 true
   */
  function showAlert(message, title = '알림', confirmText = '확인') {
    return new Promise((resolve) => {
      const modalId = ++currentModalId
      
      // 모달 컨테이너 생성
      const modalContainer = document.createElement('div')
      modalContainer.id = `custom-modal-${modalId}`
      document.body.appendChild(modalContainer)
      
      // 모달 인스턴스 생성
      const modalApp = createApp(CustomModal, {
        isVisible: true,
        title,
        message,
        isConfirm: false,
        confirmText,
        onClose: () => {
          cleanup()
          resolve(true)
        },
        onConfirm: () => {
          cleanup()
          resolve(true)
        }
      })
      
      modalApp.mount(modalContainer)
      
      function cleanup() {
        modalApp.unmount()
        document.body.removeChild(modalContainer)
      }
    })
  }

  /**
   * 확인 모달 표시
   * @param {string} message - 표시할 메시지
   * @param {string} title - 모달 제목 (기본값: '확인')
   * @param {boolean} isDanger - 위험한 작업인지 여부 (기본값: false)
   * @param {string} confirmText - 확인 버튼 텍스트 (기본값: '확인')
   * @returns {Promise<boolean>} - 확인 시 true, 취소 시 false
   */
  function showConfirm(message, title = '확인', isDanger = false, confirmText = '확인') {
    return new Promise((resolve) => {
      const modalId = ++currentModalId
      
      // 모달 컨테이너 생성
      const modalContainer = document.createElement('div')
      modalContainer.id = `custom-modal-${modalId}`
      document.body.appendChild(modalContainer)
      
      // 모달 인스턴스 생성
      const modalApp = createApp(CustomModal, {
        isVisible: true,
        title,
        message,
        isConfirm: true,
        isDanger,
        confirmText,
        onClose: () => {
          cleanup()
          resolve(false)
        },
        onConfirm: () => {
          cleanup()
          resolve(true)
        }
      })
      
      modalApp.mount(modalContainer)
      
      function cleanup() {
        modalApp.unmount()
        document.body.removeChild(modalContainer)
      }
    })
  }

  /**
   * 성공 알림 모달
   * @param {string} message - 표시할 메시지
   * @param {string} title - 모달 제목 (기본값: '성공')
   * @returns {Promise<boolean>}
   */
  function showSuccess(message, title = '성공') {
    return showAlert(message, title, '확인')
  }

  /**
   * 에러 알림 모달
   * @param {string} message - 표시할 메시지
   * @param {string} title - 모달 제목 (기본값: '오류')
   * @returns {Promise<boolean>}
   */
  function showError(message, title = '오류') {
    return showAlert(message, title, '확인')
  }

  /**
   * 경고 알림 모달
   * @param {string} message - 표시할 메시지
   * @param {string} title - 모달 제목 (기본값: '경고')
   * @returns {Promise<boolean>}
   */
  function showWarning(message, title = '경고') {
    return showAlert(message, title, '확인')
  }

  /**
   * 위험한 작업 확인 모달
   * @param {string} message - 표시할 메시지
   * @param {string} title - 모달 제목 (기본값: '경고')
   * @param {string} confirmText - 확인 버튼 텍스트 (기본값: '삭제')
   * @returns {Promise<boolean>}
   */
  function showDangerConfirm(message, title = '경고', confirmText = '삭제') {
    return showConfirm(message, title, true, confirmText)
  }

  return {
    showAlert,
    showConfirm,
    showSuccess,
    showError,
    showWarning,
    showDangerConfirm
  }
}

// 전역 함수로도 사용 가능하도록 export
export const $alert = (message, title, confirmText) => {
  const { showAlert } = useCustomModal()
  return showAlert(message, title, confirmText)
}

export const $confirm = (message, title, isDanger, confirmText) => {
  const { showConfirm } = useCustomModal()
  return showConfirm(message, title, isDanger, confirmText)
}

export const $success = (message, title) => {
  const { showSuccess } = useCustomModal()
  return showSuccess(message, title)
}

export const $error = (message, title) => {
  const { showError } = useCustomModal()
  return showError(message, title)
}

export const $warning = (message, title) => {
  const { showWarning } = useCustomModal()
  return showWarning(message, title)
}

export const $dangerConfirm = (message, title, confirmText) => {
  const { showDangerConfirm } = useCustomModal()
  return showDangerConfirm(message, title, confirmText)
}