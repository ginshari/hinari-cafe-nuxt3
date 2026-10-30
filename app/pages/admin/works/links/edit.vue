<template>
  <div class="mx-auto" style="max-width: 720px">
    <v-btn to="/admin/works" variant="text" prepend-icon="mdi-arrow-left" class="mb-2">一覧に戻る</v-btn>
    <h1 class="text-h5 mb-4">{{ isEdit ? 'リンク 編集' : 'リンク 追加' }}</h1>

    <v-alert v-if="error" type="error" closable class="mb-4" @click:close="error = null">{{ error }}</v-alert>

    <v-form v-model="valid">
      <v-text-field v-model="form.order" label="order" type="number" :rules="[rules.positiveInt]" />
      <v-text-field v-model="form.text" label="text" :rules="[rules.required]" />
      <v-text-field v-model="form.url" label="url" :rules="[rules.httpUrl]" />

      <div class="d-flex justify-end mt-4">
        <v-btn color="primary" :disabled="!valid" :loading="saving" @click="save">保存</v-btn>
      </div>
    </v-form>
  </div>
</template>

<script setup lang="ts">
const { isEdit, valid, saving, error, load, submit } = useEditForm('links', '/admin/works')

const form = reactive({ order: '', text: '', url: '' })

const save = () => submit({ ...form })

load((row) => Object.assign(form, row, { order: String(row.order) }))
</script>
