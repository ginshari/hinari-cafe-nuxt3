<template>
  <div class="mx-auto" style="max-width: 720px">
    <v-btn to="/admin/coffees" variant="text" prepend-icon="mdi-arrow-left" class="mb-2">一覧に戻る</v-btn>
    <h1 class="text-h5 mb-4">{{ isEdit ? 'コーヒー編集' : 'コーヒー追加' }}</h1>

    <v-alert v-if="error" type="error" closable class="mb-4" @click:close="error = null">{{ error }}</v-alert>
    <v-alert v-if="videoError" type="warning" closable class="mb-4" @click:close="videoError = null">
      {{ videoError }}
    </v-alert>

    <v-form v-model="valid">
      <v-text-field
        v-model="form.videoId"
        label="videoId"
        :rules="[rules.videoId]"
        hint="YouTube の動画ID (11文字)"
      >
        <template #append-inner>
          <v-btn size="small" variant="outlined" :loading="videoLoading" @click="fetchVideo">GET</v-btn>
        </template>
      </v-text-field>
      <v-text-field v-model="form.pubDate" label="pubDate" :rules="[rules.pubDate]" hint="YYYY-MM-DD" />
      <v-text-field v-model="form.videoTitle" label="videoTitle" :rules="[rules.required]" />
      <v-text-field v-model="form.imgUrl" label="imgUrl" :rules="[rules.httpUrl]" />
      <v-text-field v-model="form.name" label="name" :rules="[rules.required]" hint="前後に空白を入れない" />
      <v-text-field
        v-model="form.orderTime"
        label="orderTime"
        :rules="[rules.hms]"
        hint="HH:mm:ss または mm:ss (例: 1:02:03)"
      />
      <v-text-field v-model="form.reviewTime" label="reviewTime" :rules="[rules.hms]" hint="HH:mm:ss または mm:ss" />
      <v-textarea v-model="form.reviewText" label="reviewText" :rules="[rules.reviewText]" hint="意味検索の入力になる" />
      <v-textarea v-model="form.note" label="note (任意)" hint="店舗情報 (URL・店名など)。書式は不問" />

      <div class="d-flex justify-end mt-4">
        <v-btn color="primary" :disabled="!valid" :loading="saving" @click="save">保存</v-btn>
      </div>
    </v-form>
  </div>
</template>

<script setup lang="ts">
const { isEdit, valid, saving, error, load, submit } = useEditForm('coffees')

const form = reactive({
  videoId: '',
  pubDate: '',
  videoTitle: '',
  imgUrl: '',
  name: '',
  orderTime: '',
  reviewTime: '',
  reviewText: '',
  note: '',
})

const videoLoading = ref(false)
const videoError = ref<string | null>(null)

const fetchVideo = async () => {
  const videoId = form.videoId.trim()
  const check = rules.videoId(videoId)
  if (check !== true) {
    videoError.value = check
    return
  }
  videoLoading.value = true
  videoError.value = null
  try {
    Object.assign(form, await $fetch('/api/admin/youtube', { query: { videoId } }))
  } catch (e: any) {
    videoError.value = apiErrorMessage(e)
  } finally {
    videoLoading.value = false
  }
}

const save = () => {
  const orderTime = hmsToSec(form.orderTime)
  const reviewTime = hmsToSec(form.reviewTime)
  if (orderTime === null || reviewTime === null) {
    error.value = '時刻は HH:mm:ss 形式で入力してください'
    return
  }
  if (reviewTime <= orderTime) {
    error.value = 'reviewTime は orderTime より後にしてください'
    return
  }
  return submit({ ...form, orderTime, reviewTime })
}

load((row) => {
  Object.assign(form, row, {
    orderTime: secToHms(Number(row.orderTime)),
    reviewTime: secToHms(Number(row.reviewTime)),
    note: row.note ?? '',
  })
})
</script>
