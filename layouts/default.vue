<template>
  <v-app>
    <v-main>
      <nuxt-page />
    </v-main>
    <v-footer color="#313131" class="text-center">
      <v-container>
        <div class="my-4 pages">
          <nuxt-link v-for="link in visibleLinks" :key="link.path" :to="link.path">{{ link.label }}</nuxt-link>
        </div>
        <div>
          <p class="imprint" v-text="author" /></div
      ></v-container>
    </v-footer>
  </v-app>
</template>
<script setup>
const route = useRoute()
const author = 'pictures:@hinari_kotohara\nauthor:@hinaricafe_TO'

const allLinks = [
  { path: '/', label: 'TOP' },
  { path: '/works', label: 'お仕事履歴' },
  { path: '/coffees', label: 'コーヒーレビュー' },
  { path: '/calendar', label: 'カレンダー' },
  { path: '/special', label: 'スペシャル' },
]

const visibleLinks = computed(() => allLinks.filter((link) => link.path !== route.path))
</script>
<style scoped>
.v-main {
  background-image: url('https://res.cloudinary.com/hinari-s-cafe/image/upload/f_auto,q_auto/v1647685456/coffee-pattern_dpvew4.svg');
  background-color: #ffe76d;
  background-size: 1920px;
  background-repeat: repeat;
}
.v-footer {
  display: block;
}
.pages a {
  color: #f4f5f7;
  font-size: calc(0.5vw + 16px);
  margin-left: 10px;
  margin-right: 10px;
  text-decoration-skip-ink: none;
  white-space: nowrap;
}
.imprint {
  color: #f4f5f7;
  line-height: 1.5rem;
  white-space: pre-wrap;
}
</style>
