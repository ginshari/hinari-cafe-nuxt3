<template>
  <div class="works-wrapper">
    <v-container>
      <v-card class="works-card" color="paper" flat>
        <!-- profile -->
        <v-row align-content="center" no-gutters>
          <v-col cols="12" sm="4" class="pt-0 text-center profile-left">
            <div class="pb-8">
              <p class="mb-0 pt-16 text-pen title-text">PROFILE</p>
              <v-avatar size="50%" class="my-4" color="paper"
                ><v-img
                  width="100%"
                  :aspect-ratio="1 / 1"
                  :src="
                    useCloudinary().getImageUrl('works/works_icon_v2_w82sts.png', 'c_fill,w_400,h_400,f_auto,q_auto')
                  "
                ></v-img
              ></v-avatar>
              <p class="text-pen name">理原ひなり</p>
              <p class="text-pen sub-name">kotohara hinari</p>
              <div class="mt-6 links text-primary">
                <div v-for="n in Math.ceil(links.length / 2)" :key="n">
                  <a class="mx-2" :href="links[n * 2 - 2].url" target="_blank" rel="noopener">{{
                    links[n * 2 - 2].text
                  }}</a>
                  <a class="mx-2" :href="links[n * 2 - 1]?.url" target="_blank" rel="noopener">{{
                    links[n * 2 - 1]?.text
                  }}</a>
                </div>
              </div>
            </div>
          </v-col>
          <v-col cols="12" sm="8" class="my-auto px-8 profile-right" align-self="center">
            <div class="d-block text-pen mt-sm-16 py-8">
              <table class="mx-auto mx-lg-0">
                <tbody>
                  <tr v-for="profile in profiles" :key="profile.order" class="py-lg-16">
                    <td class="text-right">{{ profile.head }}</td>
                    <td class="pl-lg-16" style="word-break: auto-phrase">{{ profile.body }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </v-col>
        </v-row>
        <!-- gallery -->
        <v-row align-content="center" no-gutters>
          <v-col cols="12" sm="4" class="text-center gallery-left">
            <div class="pt-8">
              <p class="text-pen title-text">GALLERY</p>
            </div>
            <div class="px-2 py-4 description">
              <p class="text-pen">ファンアート等にご活用ください！</p>
              <p class="text-primary">
                <a href="https://www.youtube.com/live/3hJttokBN4E?t=5391s" target="_blank" rel="noopener"
                  >Skeb依頼可能です！</a
                >
              </p>
            </div>
          </v-col>
          <v-col cols="12" sm="8" class="my-auto mt-sm-16 pa-8 profile-right" align-self="center">
            <div class="mx-auto" style="max-width: 800px">
              <v-carousel v-model="selectedGallery" class="mx-auto gallery-carousel" height="450" continuous>
                <template #prev="{ props }">
                  <v-btn icon="mdi-chevron-left" color="pen" @click="props.onClick"></v-btn>
                </template>
                <template #next="{ props }">
                  <v-btn icon="mdi-chevron-right" color="pen" @click="props.onClick"></v-btn>
                </template>
                <v-carousel-item v-for="item in gallery" :key="item.imageName">
                  <v-img
                    :src="generateGalleryUrl(item.imageName, 'c_fit,f_auto,q_auto,w_800')"
                    height="450"
                    :aspect-ratio="0"
                    contain
                  />
                </v-carousel-item>
              </v-carousel>
              <v-btn
                variant="flat"
                color="pen"
                size="large"
                :rounded="0"
                block
                :href="generateGalleryUrl(gallery[selectedGallery].imageName)"
                target="_blank"
                >VIEW FULL</v-btn
              >
            </div>
          </v-col>
        </v-row>
        <!-- history -->
        <v-row no-gutters>
          <v-col cols="12" sm="4" class="pt-0 text-center">
            <div class="history-top-left pb-0">
              <p class="py-8 text-pen title-text">HISTORY</p>
              <client-only
                ><v-select
                  v-model="select"
                  class="mx-8 mx-lg-16"
                  bg-color="paper"
                  density="compact"
                  prepend-inner-icon="mdi-filter-variant"
                  variant="flat"
                  :items="category"
                ></v-select
              ></client-only>
            </div>
          </v-col>
          <v-col cols="12" sm="8" />
        </v-row>
        <client-only>
          <div v-for="event in filterdEvents" :key="event.yyyymm + event.branchNumber">
            <v-row v-if="event.isDisplayYear" no-gutters>
              <v-col cols="12" sm="4" class="text-center">
                <div
                  class="history-middle-left"
                  :class="{
                    'history-middle-left-mobile': !smAndUp,
                    'd-flex': !smAndUp,
                    'mr-auto': !smAndUp,
                    'ml-8': !smAndUp,
                  }"
                >
                  <p class="py-8 text-pen year">{{ event.year + '年' }}</p>
                </div>
              </v-col>
              <v-col cols="12" />
            </v-row>
            <v-row no-gutters align-content="center">
              <v-col v-if="smAndUp" cols="12" sm="4" class="text-center history-middle-left">
                <p
                  v-if="event.isDisplayMonth"
                  class="py-4 py-lg-8 text-pen month"
                  v-text="Number(event.month) + '月'"
                />
              </v-col>
              <v-col
                cols="12"
                sm="8"
                class="history-middle-right"
                :class="{
                  'history-middle-right-mobile': !smAndUp,
                }"
              >
                <p class="px-8 px-lg-16 py-4 py-lg-8 text-pen">
                  <a
                    v-if="event.url"
                    class="text-pen"
                    :href="event.url"
                    target="_blank"
                    rel="noopener"
                    v-text="event.name"
                  />
                  <span v-else v-text="event.name" />
                </p>
              </v-col>
            </v-row>
          </div>
        </client-only>
      </v-card>
    </v-container>
  </div>
</template>

<script setup>
import { useDisplay } from 'vuetify'
import { useApiFetch } from '~/composables/useApiFetch'

const { smAndUp } = useDisplay()

const documents = await useApiFetch(
  'worksPage',
  [
    {
      $lookup: {
        from: 'links',
        localField: 'links.$id',
        foreignField: '_id',
        pipeline: [
          {
            $sort: {
              order: 1,
            },
          },
        ],
        as: 'links',
      },
    },
    {
      $lookup: {
        from: 'profiles',
        localField: 'profiles.$id',
        foreignField: '_id',
        pipeline: [
          {
            $sort: {
              order: 1,
            },
          },
        ],
        as: 'profiles',
      },
    },
    {
      $lookup: {
        from: 'events',
        localField: 'events.$id',
        foreignField: '_id',
        pipeline: [
          {
            $addFields: {
              year: { $substr: ['$yyyymm', 0, 4] },
              month: { $substr: ['$yyyymm', 4, 2] },
            },
          },
          {
            $sort: {
              yyyymm: -1,
              branchNumber: -1,
            },
          },
        ],
        as: 'events',
      },
    },
  ],
  'worksPage',
)

const worksPage = documents[0]
const links = worksPage.links
const profiles = worksPage.profiles
const events = worksPage.events

const select = ref('all')
const category = ref([
  { title: 'すべて', value: 'all' },
  { title: 'お仕事', value: 'works' },
  { title: 'トピック', value: 'topics' },
])

const selectedGallery = ref(0)
const { getImageUrl } = useCloudinary()
const generateGalleryUrl = (imageName, params) => {
  return getImageUrl(`v1707753283/3menzu/${imageName}`, params || 'f_auto,q_auto')
}
const gallery = ref([{ imageName: 'normal.png' }, { imageName: 'mizugi.png' }, { imageName: 'idol.png' }])

const filterdEvents = computed(() => {
  return events.reduce((accumulator, currentValue) => {
    // カテゴリに合致するイベントを表示する
    if (select.value === 'all' || select.value === currentValue.category) {
      // 年、月は直前のデータと異なる場合のみ表示する
      const previousValue = accumulator[accumulator.length - 1]
      currentValue.isDisplayYear = previousValue?.year !== currentValue.year
      currentValue.isDisplayMonth = currentValue.isDisplayYear || previousValue?.month !== currentValue.month
      accumulator.push(currentValue)
    }

    return accumulator
  }, [])
})
</script>

<style lang="scss" scoped>
.works-wrapper {
  @media (min-width: 1920px) {
    max-width: 1920px;
    margin: 0 auto;
  }
}

.works-card {
  overflow: hidden;
}

.title-text {
  font-size: calc(0.5vw + 28px);
  text-decoration: underline;
  text-decoration-skip-ink: none;
  white-space: nowrap;
}

.history-top-left {
  background-color: #a8f3ff;
}

.history-middle {
  &-left {
    background-color: #a8f3ff;
    .year {
      font-size: calc(0.5vw + 20px);
    }
    .month {
      font-size: calc(0.5vw + 12px);
    }
    &-mobile {
      background-color: var(--v-paper-base);
    }
  }

  &-right {
    font-size: calc(0.5vw + 12px);
    a {
      text-decoration: none;
      &:visited,
      &:hover {
        text-decoration: underline;
        text-decoration-skip-ink: none;
      }
    }
    &-mobile p::before {
      content: '・';
    }
  }
}

.profile-left {
  background-color: #a8f3ff;
  .name {
    font-size: calc(0.5vw + 28px);
  }
  .sub-name {
    font-size: calc(0.5vw + 12px);
  }
  .links {
    font-size: calc(0.5vw + 12px);
    a {
      text-decoration: underline;
      text-decoration-skip-ink: none;
      &:visited,
      &:hover {
        color: inherit;
      }
    }
  }
}

.profile-right {
  font-size: calc(0.5vw + 12px);
  table {
    border-collapse: separate;
    border-spacing: 1em;
    td {
      vertical-align: top;
      &:first-child {
        white-space: nowrap;
      }
    }
  }
}

.gallery-left {
  background-color: #a8f3ff;
  .description {
    font-size: calc(0.5vw + 12px);
    word-break: auto-phrase;
  }
  a {
    text-decoration: underline;
    text-decoration-skip-ink: none;
    &:visited,
    &:hover {
      color: inherit;
    }
  }
}

.gallery-carousel {
  @media (max-width: 599px) {
    height: 250px !important;

    :deep(.v-img) {
      height: 250px !important;
    }
  }

  @media (min-width: 600px) and (max-width: 959px) {
    height: 350px !important;

    :deep(.v-img) {
      height: 350px !important;
    }
  }
}
</style>
