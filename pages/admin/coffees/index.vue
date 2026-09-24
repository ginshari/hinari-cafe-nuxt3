<template>
  <div>
    <h1 class="text-h5 mb-4">/coffees</h1>
    <AdminTableList
      table="coffees"
      title="coffees"
      :headers="headers"
      :label="(item) => `${item.name} (${item.pubDate})`"
    />
  </div>
</template>

<script setup lang="ts">
const headers = [
  { title: 'pubDate', key: 'pubDate' },
  { title: 'name', key: 'name' },
  { title: '操作', key: 'actions', sortable: false },
]
</script>