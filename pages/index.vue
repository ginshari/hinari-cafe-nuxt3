<template>
  <div>
    <v-row no-gutters class="first-view">
      <client-only>
        <v-col v-if="mdAndUp" cols="12" md="6" class="d-flex flex-column justify-space-between">
          <v-sheet class="pa-lg-8 pa-4 greeting" color="paper">
            <p class="ma-0 ma-md-8 ma-lg-16 text-pen" v-text="landingPage.greeting" />
            <p class="ma-0 ma-md-8 ma-lg-16 text-primary">
              <a href="https://amtf.go.jp/ja/#stage" target="_blank">大阪・関西万博で歌います！！</a>
            </p>
          </v-sheet>
          <div>
            <v-img
              class="mx-auto my-8"
              max-width="50%"
              :aspect-ratio="900 / 600"
              src="https://res.cloudinary.com/hinari-s-cafe/image/upload/f_auto,q_auto/v1647669519/logo_gcanuk.png"
            ></v-img>
          </div>
        </v-col>
        <v-col
          cols="12"
          md="6"
          class="shop-image d-flex flex-column justify-space-between"
          :class="{ 'greeting-desktop': mdAndUp }"
        >
          <div v-if="!mdAndUp">
            <div class="d-flex">
              <v-img
                class="mx-auto"
                height="20vh"
                :aspect-ratio="900 / 600"
                src="https://res.cloudinary.com/hinari-s-cafe/image/upload/f_auto,q_auto/v1647669519/logo_gcanuk.png"
              />
            </div>
            <v-sheet class="mx-auto pa-sm-8 pa-4 greeting" color="paper" max-width="80vw">
              <p class="ma-0 ma-md-8 text-pen" v-text="landingPage.greeting" />
              <p class="ma-0 ma-md-8 text-primary">
                <a href="https://amtf.go.jp/ja/#stage" target="_blank">大阪・関西万博で歌います！！</a>
              </p>
            </v-sheet>
          </div>
          <div>
            <v-img
              width="100%"
              :height="!mdAndUp ? '50vh' : ''"
              :aspect-ratio="720 / 836"
              src="https://res.cloudinary.com/hinari-s-cafe/image/upload/f_auto,q_auto/v1647668956/welcome_trim_r1nxto.png"
              transition="scroll-x-reverse-transition"
              :class="{ 'greeting-desktop-image': mdAndUp }"
            />
          </div>
        </v-col>
      </client-only>
    </v-row>
    <v-row class="annotation" justify="center" no-gutters>
      <v-card class="pa-4 py-md-8 px-md-16" color="paper" max-width="80vw">
        <p class="ma-0 ma-sm-4 ma-md-8 text-pen" v-text="landingPage.annotation" />
      </v-card>
    </v-row>
    <v-container>
      <div>
        <!-- works -->
        <div class="mt-16 d-block">
          <v-img
            class="mx-auto"
            max-width="300px"
            :aspect-ratio="1452 / 1854"
            transition="scroll-y-reverse-transition"
            src="https://res.cloudinary.com/hinari-s-cafe/image/upload/f_auto,q_auto/v1647668953/pot_qlhjlj.png"
          />
          <div class="mx-auto mb-8 py-4 text-center rounded-pill text-pen subtitle-works">
            <span>お仕事</span>
          </div>
        </div>
        <v-row class="py-8 contents" justify="start" no-gutters>
          <v-col v-for="work in works" :key="work.order" cols="12" sm="6" lg="4">
            <v-card class="px-16 px-sm-4 contents-card text-pen" flat>
              <a :href="work.url" target="_blank" rel="noopener">
                <v-img
                  class="contents-image mx-auto mb-4 mb-md-8"
                  max-width="200px"
                  :aspect-ratio="1 / 1"
                  :src="work.imgUrl"
                />
              </a>
              <p class="text-center" v-text="work.head" />
              <p class="my-4" v-text="work.body" />
            </v-card>
          </v-col>
        </v-row>
        <v-row justify="center" class="text-center">
          <v-col cols="6" sm="4">
            <v-btn class="mb-16 btn-works text-pen rounded-pill" height="60px" color="#a8f3ff" to="/works" block
              >もっと詳しく見る</v-btn
            ></v-col
          >
        </v-row>
      </div>
      <div>
        <!-- recommends -->
        <div class="mt-16 d-block">
          <v-img
            class="mx-auto"
            max-width="300px"
            :aspect-ratio="1241 / 1612"
            transition="scroll-y-reverse-transition"
            src="https://res.cloudinary.com/hinari-s-cafe/image/upload/f_auto,q_auto/v1647668959/count_ddswin.png"
          />
          <div class="mx-auto mb-8 py-4 text-center rounded-pill text-pen subtitle-recommends">
            <span>オススメ動画</span>
          </div>
        </div>
        <v-row class="py-8 contents" justify="start" no-gutters>
          <v-col v-for="recommend in recommends" :key="recommend.order" cols="12" sm="6" lg="4">
            <v-card class="px-16 px-sm-4 contents-card text-pen" flat>
              <a :href="recommend.url" target="_blank" rel="noopener">
                <v-img class="my-4 contents-image" width="100%" :aspect-ratio="16 / 9" :src="recommend.imgUrl" />
              </a>
              <p class="my-4" v-text="recommend.body" />
            </v-card>
          </v-col>
        </v-row>
        <v-row justify="center">
          <v-col cols="6" sm="4">
            <v-btn
              class="mb-16 btn-recommends text-pen rounded-pill"
              height="60px"
              color="#ffccf0"
              href="https://www.youtube.com/channel/UCZF1cUKuWlvo_wn--s-21kw/playlists"
              target="_blank"
              block
              >もっと詳しく見る</v-btn
            ></v-col
          >
        </v-row>
      </div>
      <div>
        <!-- coffees -->
        <div class="mt-16 d-block">
          <v-img
            class="mx-auto"
            max-width="350px"
            :aspect-ratio="2894 / 2835"
            transition="scroll-y-reverse-transition"
            src="https://res.cloudinary.com/hinari-s-cafe/image/upload/f_auto,q_auto/v1647668979/complete_mpcta1.png"
          />
          <div class="mx-auto mt-n6 mb-16 mb-md-8 py-4 text-center rounded-pill text-pen subtitle-coffees">
            <span>コーヒー配信</span>
          </div>
        </div>
        <v-row class="py-8 contents" justify="start" no-gutters>
          <v-col v-for="coffee in coffees" :key="coffee.order" cols="12" sm="6" lg="4">
            <v-card class="px-16 px-sm-4 contents-card text-pen" flat>
              <a :href="coffee.url" target="_blank" rel="noopener">
                <v-img class="my-4 contents-image" width="100%" :aspect-ratio="16 / 9" :src="coffee.imgUrl" />
              </a>
              <p class="mx-auto my-4" v-text="coffee.body" />
            </v-card>
          </v-col>
        </v-row>
        <v-row justify="center">
          <v-col cols="6" sm="4">
            <v-btn class="mb-16 btn-coffees text-pen rounded-pill" height="60px" color="#7fff7f" to="/coffees" block
              >もっと詳しく見る</v-btn
            >
          </v-col>
        </v-row>
      </div>
    </v-container>
  </div>
</template>
<script setup>
import { useDisplay } from 'vuetify'

const { mdAndUp } = useDisplay()
const { $apiConfig } = useNuxtApp()

const { data } = await useFetch(
  '/action/aggregate',
  $apiConfig('landingPage', [
    {
      $lookup: {
        from: 'lpItems',
        localField: 'works.$id',
        foreignField: '_id',
        pipeline: [
          {
            $sort: {
              order: 1,
            },
          },
        ],
        as: 'works',
      },
    },
    {
      $lookup: {
        from: 'lpItems',
        localField: 'recommends.$id',
        foreignField: '_id',
        pipeline: [
          {
            $sort: {
              order: 1,
            },
          },
        ],
        as: 'recommends',
      },
    },
    {
      $lookup: {
        from: 'lpItems',
        localField: 'coffees.$id',
        foreignField: '_id',
        pipeline: [
          {
            $sort: {
              order: 1,
            },
          },
        ],
        as: 'coffees',
      },
    },
  ])
)

if (!data.value) {
  throw createError({ statusCode: 404, statusMessage: 'landingPage: useFetch failed.' })
}

const landingPage = data.value.documents[0]
const works = landingPage.works
const recommends = landingPage.recommends
const coffees = landingPage.coffees
</script>

<style lang="scss" scoped>
.first-view {
  height: 100vh;
}

.greeting {
  position: relative;
  z-index: 100;
  border-radius: 5vw;
  box-shadow: 20px 20px 0 rgb(49 49 49 / 0.5) !important;
  left: 15%;
  top: 50px;

  @media screen and (max-width: 959px) {
    left: 0;
    top: 0;
  }
  p {
    font-size: calc(1vw + 8px);
    line-height: 2em;
    white-space: pre-wrap;
  }
  &-desktop {
    position: relative;
    &-image {
      position: absolute;
      bottom: 0;
    }
  }
}

.shop-image {
  background-image: url('https://res.cloudinary.com/hinari-s-cafe/image/upload/f_auto,q_auto/v1647685455/top_da8ylh.jpg');
  background-size: cover;
}

.annotation {
  padding-top: 5vh;
  padding-bottom: 5vh;
  background-size: auto auto;
  background-color: rgb(255 204 248 / 1);
  background-image: repeating-linear-gradient(
    135deg,
    transparent,
    transparent 100px,
    rgb(228 184 230 / 1) 100px,
    rgb(228 184 230 / 1) 140px
  );

  .v-card {
    font-size: calc(0.5vw + 10px);
    line-height: 2em;
    border-radius: 5vw;
    white-space: pre-wrap;
    box-shadow: 15px 15px 0 rgb(49 49 49 / 0.5) !important;
    margin-top: 100px;
    margin-bottom: 100px;
    @media screen and (max-width: 959px) {
      margin-top: 0;
      margin-bottom: 0;
    }
  }
}

@mixin subtitle($color1, $color2) {
  font-size: calc(0.5vw + 36px);
  background-color: $color1;
  box-shadow: 15px 15px 0 $color2;
}

.subtitle {
  &-works {
    @include subtitle(#a8f3ff, #0090ff);
  }
  &-recommends {
    @include subtitle(#ffccf0, #d87cbc);
  }
  &-coffees {
    position: relative;
    z-index: 0;
    @include subtitle(#7fff7f, #4bab4b);
  }
}

.contents {
  &-card {
    overflow: visible !important;
    background-color: transparent;
  }
  &-image {
    &:hover {
      transition-duration: 0.3s;
      transform: scale(1.1);
    }
  }
  p:first-of-type {
    font-size: calc(0.5vw + 28px);
  }
  p:last-of-type {
    font-size: calc(0.5vw + 16px);
  }
}

@mixin btn-detail($color1) {
  box-shadow: 10px 10px 0 $color1;
  font-size: calc(0.5vw + 12px) !important;
  &:hover {
    transition-duration: 0.3s;
    transform: scale(1.1);
    box-shadow: 10px 10px 0 $color1;
  }
}

.btn {
  &-works {
    @include btn-detail(#0090ff);
  }
  &-recommends {
    @include btn-detail(#d87cbc);
  }
  &-coffees {
    @include btn-detail(#4bab4b);
  }
}
</style>
