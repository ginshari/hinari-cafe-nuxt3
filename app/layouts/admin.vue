<template>
  <v-app>
    <v-navigation-drawer permanent>
      <v-list>
        <v-list-item title="Hinari's Cafe 管理" density="compact" class="text-subtitle-2 font-weight-bold" />
        <v-divider class="my-2" />
        <v-list-item to="/admin" title="TOP" prepend-icon="mdi-home" />
        <v-list-item to="/admin/landing" title="landing" prepend-icon="mdi-text-box-outline" />
        <v-list-item to="/admin/coffees" title="coffees" prepend-icon="mdi-coffee" />
        <v-list-item to="/admin/works" title="works" prepend-icon="mdi-link-variant" />
      </v-list>
      <template #append>
        <v-list-item to="/" title="サイトを開く" prepend-icon="mdi-open-in-new" />
      </template>
    </v-navigation-drawer>
    <v-main class="bg-grey-lighten-3">
      <v-container fluid class="pa-6">
        <nuxt-page />
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.v-application {
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif !important;
}
</style>