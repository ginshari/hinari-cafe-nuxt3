<template>
  <div>
    <div class="d-flex align-center mb-4">
      <h1 v-if="title" class="text-h5 mb-0">{{ title }}</h1>
      <v-spacer />
      <v-btn color="primary" :to="editBase" prepend-icon="mdi-plus">ADD</v-btn>
    </div>

    <v-alert v-if="error" type="error" closable class="mb-4" @click:close="error = null">
      {{ error }}
    </v-alert>

    <v-card>
      <v-text-field
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        label="検索"
        single-line
        hide-details
        density="compact"
        clearable
        class="pa-4"
      />
      <v-data-table
        :headers="headers"
        :items="filteredItems"
        :search="search"
        :loading="loading"
        items-per-page="20"
      >
        <template #item.actions="{ item }">
          <v-btn size="small" icon="mdi-pencil" variant="text" :to="`${editBase}?id=${item.id}`" />
          <v-btn size="small" icon="mdi-delete" variant="text" color="error" @click="confirmDelete(item)" />
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title>この行を削除しますか?</v-card-title>
        <v-card-text>{{ deleteLabel }}</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">キャンセル</v-btn>
          <v-btn color="error" variant="flat" @click="doDelete">削除</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import type { AdminHeader } from '~/composables/useAdminTable'

const props = withDefaults(
  defineProps<{
    table: string
    title?: string
    headers: AdminHeader[]
    editPath?: string
    filter?: (item: Record<string, any>) => boolean
    label?: (item: Record<string, any>) => string
  }>(),
  {
    title: '',
    editPath: undefined,
    filter: () => true,
    label: (item: Record<string, any>) => String(item.id),
  },
)

const { items, loading, error, remove } = useAdminTable(props.table)

const search = ref('')
const deleteDialog = ref(false)
const deleteTarget = ref<Record<string, any> | null>(null)

const editBase = computed(() => props.editPath ?? `/admin/${props.table}/edit`)
const filteredItems = computed(() => items.value.filter(props.filter))
const deleteLabel = computed(() => (deleteTarget.value ? props.label(deleteTarget.value) : ''))

const confirmDelete = (item: Record<string, any>) => {
  deleteTarget.value = item
  deleteDialog.value = true
}

const doDelete = async () => {
  if (!deleteTarget.value) return
  try {
    await remove(deleteTarget.value.id)
    deleteTarget.value = null
  } catch (e: any) {
    error.value = apiErrorMessage(e)
  } finally {
    deleteDialog.value = false
  }
}
</script>
