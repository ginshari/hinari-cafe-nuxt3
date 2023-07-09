<template>
  <div>
    <client-only>
      <v-app-bar :elevation="2" color="#313131">
        <v-container>
          <v-row no-gutters align-content="center">
            <v-col cols="8">
              <v-text-field
                v-model="search"
                class="text-pen"
                bg-color="paper"
                prepend-inner-icon="mdi-magnify"
                variant="flat"
                label="コーヒーを検索"
                single-line
                clearable
                hide-details
                density="compact"
                @keydown.enter="doSearch()"
              >
              </v-text-field>
            </v-col>
            <v-col cols="4" class="d-flex"
              ><v-btn
                class="ml-auto my-auto"
                color="paper"
                :prepend-icon="order > 0 ? 'mdi-sort-descending' : 'mdi-sort-ascending'"
                elevation="0"
                @click="changeSortOrder()"
              >
                <span class="text-paper">{{ order > 0 ? '新しい順' : '古い順' }}</span></v-btn
              ></v-col
            >
          </v-row>
        </v-container>
      </v-app-bar>
    </client-only>
    <v-container>
      <v-row>
        <v-col
          v-for="coffee in paginatedCoffees"
          :key="coffee.videoId"
          cols="12"
          sm="6"
          lg="4"
          class="d-flex flex-column"
        >
          <v-card class="coffee-card text-pen d-flex flex-column" elevation="0">
            <div>
              <v-img width="100%" :aspect-ratio="16 / 9" :src="coffee.imgUrl" />
            </div>
            <v-card-subtitle class="pt-2 coffee-card-subtitle">
              {{ coffee.pubDate }}
            </v-card-subtitle>
            <v-card-title class="mb-4 coffee-card-title">
              {{ coffee.name }}
            </v-card-title>
            <v-card-actions class="mt-auto">
              <v-spacer />
              <v-btn variant="outlined" @click="selectVideo(coffee.videoId, coffee.orderTime)">
                <span>ORDER</span>
              </v-btn>
              <v-btn variant="outlined" @click="selectVideo(coffee.videoId, coffee.reviewTime)">
                <span>REVIEW</span>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
      <div class="my-8 text-center">
        <v-pagination
          v-model="page"
          :length="maxPage"
          :total-visible="4"
          color="paper"
          variant="flat"
          size="small"
        ></v-pagination>
      </div> </v-container
    ><client-only>
      <v-dialog v-model="dialog" persistent :width="dialogWidth">
        <v-card>
          <div class="embed-video">
            <iframe
              width="560"
              height="315"
              :src="selectSrc"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            />
          </div>
          <v-card-actions>
            <v-spacer />
            <v-btn variant="outlined" @click="closeDialog()">CLOSE</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </client-only>
  </div>
</template>
<script setup>
import { useDisplay } from 'vuetify'

const { name } = useDisplay()

const { $apiConfig } = useNuxtApp()

const { data } = await useFetch(
  '/action/aggregate',
  $apiConfig('coffeesPage', [
    {
      $lookup: {
        from: 'coffees',
        localField: 'coffees.$id',
        foreignField: '_id',
        as: 'coffees',
      },
    },
  ])
)

if (!data.value) {
  throw createError({ statusCode: 404, statusMessage: 'coffeesPage: useFetch failed.' })
}

const coffeesPage = data.value.documents[0]
const coffees = coffeesPage.coffees

const search = ref('')
const page = ref(1)
const itemsPerPage = 6
const order = ref(1)
const dialog = ref(false)
const selectId = ref('')
const selectTime = ref('')

const filterdCoffees = ref(coffees)

const maxPage = computed(() => {
  return Math.ceil(filterdCoffees.value.length / itemsPerPage)
})

const sortedCoffees = computed(() => {
  // 検索結果を並び替える
  return filterdCoffees.value.sort((a, b) => {
    if (a.pubDate > b.pubDate) return -1 * order.value
    if (a.pubDate < b.pubDate) return 1 * order.value
    return 0
  })
})

const paginatedCoffees = computed(() => {
  // 表示するコーヒーをページ分切り出す
  const startIndex = (page.value - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  return sortedCoffees.value.slice(startIndex, endIndex)
})

const selectSrc = computed(() => {
  return 'https://www.youtube-nocookie.com/embed/' + selectId.value + '?autoplay=1&start=' + selectTime.value
})

const dialogWidth = computed(() => {
  switch (name.value) {
    case 'xs':
      return '100vw'
    case 'sm':
      return '80vw'
    case 'md':
    case 'lg':
      return '720px'
    case 'xl':
      return '1080px'
    default:
      return '50vw'
  }
})

// 検索処理
const doSearch = () => {
  if (!search.value) return coffees
  filterdCoffees.value = coffees.filter((coffee) => {
    return coffee.name.toUpperCase().includes(search.value.toUpperCase())
  })
  page.value = 1
}

// 並び順変更
const changeSortOrder = () => {
  order.value = order.value * -1
}

// ダイアログ表示する動画を選択
const selectVideo = (id, time) => {
  selectId.value = id
  selectTime.value = String(time)
  dialog.value = true
}

// ダイアログを閉じる
const closeDialog = () => {
  selectId.value = ''
  selectTime.value = ''
  dialog.value = false
}

watch(
  () => page.value,
  () => {
    // ページ遷移時にページトップにスクロールする
    window.scrollTo(0, 0)
  }
)
</script>
<style lang="scss" scoped>
.coffee-card {
  flex-grow: 1;
  &-title {
    font-size: calc(0.5vw + 12px);
  }
  &-subtitle {
    font-size: 12px;
  }
}

.embed-video {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 56.25%;
  overflow: hidden;
}

.embed-video iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
