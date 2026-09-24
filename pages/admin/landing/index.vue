<template>
  <div>
    <h1 class="text-h5 mb-4">/landing</h1>

    <v-alert v-if="error" type="error" closable class="mb-4" @click:close="error = null">{{ error }}</v-alert>

    <v-card class="mb-6">
      <v-card-text>
        <v-textarea :model-value="form.greeting" label="greeting" readonly rows="4" hide-details />
        <v-textarea :model-value="form.annotation" label="annotation" readonly rows="4" class="mt-3" hide-details />
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn to="/admin/landing/edit?id=1" color="secondary" variant="outlined">EDIT</v-btn>
      </v-card-actions>
    </v-card>

    <AdminTableSection
      v-for="category in categories"
      :key="category"
      table="lpItems"
      :title="category"
      edit-path="/admin/landing/lpitems/edit"
      :headers="lpitemsHeaders"
      :filter="(item: Record<string, any>) => item.category === category"
      :label="(item) => `${item.category} / ${item.order} (${item.head})`"
    />
  </div>
</template>

<script setup lang="ts">
const form = reactive({ greeting: '', annotation: '' })
const error = ref<string | null>(null)

const categories = ['works', 'recommends', 'coffees']

const lpitemsHeaders = [
  { title: 'order', key: 'order' },
  { title: 'head', key: 'head' },
  { title: '操作', key: 'actions', sortable: false },
]

onMounted(async () => {
  try {
    Object.assign(form, await $fetch<Record<string, any>>('/api/admin/landingPage/1'))
  } catch (e: any) {
    error.value = apiErrorMessage(e)
  }
})
</script>
