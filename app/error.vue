<template>
  <NuxtLayout>
    <v-container>
      <v-card class="error-card text-center" color="paper" flat>
        <div class="py-8">
          <p class="mb-0 text-pen title-text">{{ isNotFound ? 'NOT FOUND' : 'ERROR' }}</p>
          <p class="text-pen sub-title">{{ isNotFound ? 'ページが見つかりませんでした' : 'エラーが発生しました' }}</p>
        </div>
        <p class="text-pen px-4">
          {{
            isNotFound
              ? 'お探しのページは移動したか、削除された可能性があります。'
              : '時間をおいて、もう一度お試しください。'
          }}
        </p>
        <v-btn class="mt-8 text-pen rounded-pill" color="#ffe76d" height="52" variant="flat" @click="backToTop()">
          TOP へ戻る
        </v-btn>
      </v-card>
    </v-container>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const isNotFound = computed(() => props.error.statusCode === 404)

useHead({
  title: computed(() => `${isNotFound.value ? 'ページが見つかりませんでした' : 'エラー'} | Hinari's Cafe`),
})

// エラーの状態を消してから TOP へ移る
const backToTop = () => clearError({ redirect: '/' })
</script>

<style scoped lang="scss">
.error-card {
  margin: 2rem auto;
  max-width: 1200px;
  padding-bottom: 2rem;
  border-radius: 24px !important;
}

.title-text {
  font-size: calc(1vw + 24px);
  font-weight: bold;
  letter-spacing: 0.2em;
}

.sub-title {
  font-size: calc(0.5vw + 14px);
  margin-top: 0.5rem;
}
</style>
