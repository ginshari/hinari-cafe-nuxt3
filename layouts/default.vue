<template>
  <v-app>
    <v-main>
      <nuxt-page />
    </v-main>
    <v-footer color="#313131" class="text-center">
      <v-container>
        <div class="my-4 pages">
          <nuxt-link to="/works">お仕事履歴</nuxt-link>
          <nuxt-link to="/coffees">コーヒーレビュー</nuxt-link>
          <nuxt-link to="/">TOP</nuxt-link>
        </div>
        <div>
          <p class="imprint" v-text="author" /></div
      ></v-container>
    </v-footer>
  </v-app>
</template>
<script>
export default {
  data() {
    return {
      color: '#261f87',
      author: 'pictures:@hinari_kotohara\nauthor:@hinaricafe_TO',
    }
  },
}
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
}
.imprint {
  color: #f4f5f7;
  line-height: 1.5rem;
  white-space: pre-wrap;
}
</style>
