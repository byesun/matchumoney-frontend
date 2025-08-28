<template>
  <div class="card-registration-prompt" @click="$emit('register')">
    <div class="prompt-container">
      <div class="icon-container">
        <div class="card-sync-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="sync-card-icon"
          >
            <path
              d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"
            />
            <path d="M6 10h2v2H6zm3 0h5v2H9z" />
          </svg>
        </div>
      </div>
      <div class="prompt-content">
        <div class="prompt-title">{{ title }}</div>
        <div class="prompt-info">
          {{ description }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: '내 카드 정보 불러오기',
  },
  description: {
    type: String,
    default: 'CODEF를 통해 카드 정보를 연동하여\n맞춤 추천을 받아보세요!',
  },
});

const emit = defineEmits(['register']);
</script>

<style scoped>
.card-registration-prompt {
  background: var(--color-light);
  border-radius: 20px;
  padding: var(--spacing-xl);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-light);
  position: relative;
  overflow: hidden;
  height: 100%;
  display: flex;
  align-items: center;
}

.card-registration-prompt::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.5);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.card-registration-prompt:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.card-registration-prompt:hover::before {
  opacity: 1;
}

.prompt-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  position: relative;
  z-index: 1;
  width: 100%;
  min-height: 200px;
}

.icon-container {
  flex-shrink: 0;
}

.card-sync-icon {
  width: 80px;
  height: 80px;
  background: var(--color-accent);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.card-registration-prompt:hover .card-sync-icon {
  background: var(--color-dark);
  transform: scale(1.05);
}

.sync-card-icon {
  width: 40px;
  height: 40px;
  color: var(--color-white);
}

.prompt-content {
  flex: 1;
  color: var(--color-dark);
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.prompt-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  margin-bottom: var(--spacing-md);
  color: var(--color-dark);
}

.prompt-info {
  font-size: var(--font-size-lg);
  font-weight: 500;
  line-height: 1.6;
  color: var(--text-secondary);
  white-space: pre-line;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .card-registration-prompt {
    padding: var(--spacing-lg);
    border-radius: 16px;
  }

  .prompt-container {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-md);
    min-height: 180px;
  }

  .card-sync-icon {
    width: 60px;
    height: 60px;
    border-radius: 16px;
  }

  .sync-card-icon {
    width: 30px;
    height: 30px;
  }

  .prompt-title {
    font-size: var(--font-size-xl);
  }

  .prompt-info {
    font-size: var(--font-size-base);
  }
}

/* 태블릿 반응형 */
@media (max-width: 1024px) and (min-width: 769px) {
  .card-registration-prompt {
    padding: var(--spacing-xl);
  }

  .prompt-container {
    gap: var(--spacing-lg);
    min-height: 190px;
  }

  .card-sync-icon {
    width: 70px;
    height: 70px;
    border-radius: 18px;
  }

  .sync-card-icon {
    width: 35px;
    height: 35px;
  }

  .prompt-title {
    font-size: var(--font-size-xl);
  }

  .prompt-info {
    font-size: var(--font-size-base);
  }
}
</style>
