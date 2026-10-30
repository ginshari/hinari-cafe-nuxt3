<template>
  <div class="mx-auto" style="max-width: 720px">
    <v-btn to="/admin/works" variant="text" prepend-icon="mdi-arrow-left" class="mb-2">一覧に戻る</v-btn>
    <h1 class="text-h5 mb-4">{{ isEdit ? 'イベント 編集' : 'イベント 追加' }}</h1>

    <v-alert v-if="error" type="error" closable class="mb-4" @click:close="error = null">{{ error }}</v-alert>

    <v-form v-model="valid">
      <v-text-field v-model="form.yyyymm" label="yyyymm" :rules="[rules.yyyymm]" hint="YYYYMM (6桁)" />
      <v-text-field
        v-model="form.branchNumber"
        label="branchNumber"
        type="number"
        :rules="[rules.positiveInt]"
      />
      <v-select v-model="form.category" label="category" :items="['works', 'topics']" :rules="[rules.required]" />
      <v-text-field v-model="form.name" label="name" :rules="[rules.required]" />
      <v-text-field v-model="form.url" label="url (任意)" :rules="[rules.optionalHttpUrl]" hint="空欄でも可" />

      <div class="d-flex justify-end mt-4">
        <v-btn color="primary" :disabled="!valid" :loading="saving" @click="save">保存</v-btn>
      </div>
    </v-form>
  </div>
</template>

<script setup lang="ts">
const { isEdit, valid, saving, error, load, submit } = useEditForm('events', '/admin/works')

const form = reactive({ yyyymm: '', branchNumber: '', category: 'works', name: '', url: '' })

const save = () => submit({ ...form })

load((row) => Object.assign(form, row, { branchNumber: String(row.branchNumber), url: row.url ?? '' }))
</script>
