<template>
  <div class="mx-auto" style="max-width: 720px">
    <v-btn to="/admin/landing" variant="text" prepend-icon="mdi-arrow-left" class="mb-2">一覧に戻る</v-btn>
    <h1 class="text-h5 mb-4">/landing edit</h1>

    <v-alert v-if="error" type="error" closable class="mb-4" @click:close="error = null">{{ error }}</v-alert>

    <v-form v-model="valid">
      <v-textarea v-model="form.greeting" label="greeting" :rules="[rules.required]" />
      <v-textarea v-model="form.annotation" label="annotation" :rules="[rules.required]" />

      <div class="d-flex justify-end mt-4">
        <v-btn color="primary" :disabled="!valid" :loading="saving" @click="save">UPDATE</v-btn>
      </div>
    </v-form>
  </div>
</template>

<script setup lang="ts">
// landingPage は1行テーブル。一覧から ?id=1 付きで来るので useEditForm がそのまま使える
const { valid, saving, error, load, submit } = useEditForm('landingPage', '/admin/landing')

const form = reactive({ greeting: '', annotation: '' })

const save = () => submit({ ...form })

load((row) => Object.assign(form, { greeting: row.greeting ?? '', annotation: row.annotation ?? '' }))
</script>
