<template>
  <div>
    <h1 class="text-h5 mb-4">/works</h1>
    <AdminTableSection
      table="links"
      title="links"
      edit-path="/admin/works/links/edit"
      :headers="linksHeaders"
      :label="(item) => `${item.order} ${item.text}`"
    />
    <AdminTableSection
      table="profiles"
      title="profiles"
      edit-path="/admin/works/profiles/edit"
      :headers="profilesHeaders"
      :label="(item) => `${item.order} ${item.head}`"
    />
    <AdminTableSection
      table="events"
      title="events"
      edit-path="/admin/works/events/edit"
      :headers="eventsHeaders"
      :label="(item) => `${item.yyyymm} #${item.branchNumber} ${item.name}`"
    />
  </div>
</template>

<script setup lang="ts">
const linksHeaders = [
  { title: 'text', key: 'text' },
  { title: 'url', key: 'url' },
  { title: '操作', key: 'actions', sortable: false },
]

const profilesHeaders = [
  { title: 'head', key: 'head' },
  { title: 'body', key: 'body' },
  { title: '操作', key: 'actions', sortable: false },
]

const eventsHeaders = [
  { title: 'yyyymm', key: 'yyyymm' },
  { title: 'branchNumber', key: 'branchNumber' },
  { title: 'name', key: 'name' },
  { title: '操作', key: 'actions', sortable: false },
]
</script>