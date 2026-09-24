<template>
  <div>
    <h1 class="text-h4 mb-6">maintenance</h1>
    <v-list lines="two">
      <v-list-item
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        :title="link.title"
        :subtitle="link.description"
      />
    </v-list>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const links = [
  { to: '/admin/landing', title: 'landing', description: 'greeting / annotation / トップページ項目' },
  { to: '/admin/coffees', title: 'coffees', description: 'コーヒー 340件のレビュー管理 (YouTube 連携あり)' },
  { to: '/admin/works', title: 'works', description: 'links / profiles / events' },
]
</script>