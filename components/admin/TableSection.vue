<template>
  <div class="my-4">
    <h2 class="text-h6 mb-2">{{ title }}</h2>
    <v-expansion-panels>
      <v-expansion-panel>
        <v-expansion-panel-title>TABLE</v-expansion-panel-title>
        <v-expansion-panel-text>
          <!-- filter / label は未指定なら undefined のまま渡し、TableList 側の既定値に任せる -->
          <AdminTableList
            :table="table"
            :headers="headers"
            :edit-path="editPath"
            :filter="filter"
            :label="label"
          />
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script setup lang="ts">
import type { AdminHeader } from '~/composables/useAdminTable'

defineProps<{
  table: string
  title: string
  headers: AdminHeader[]
  editPath: string
  filter?: (item: Record<string, any>) => boolean
  label?: (item: Record<string, any>) => string
}>()
</script>
