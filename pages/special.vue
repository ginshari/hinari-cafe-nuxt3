<template>
  <div class="special-page">
    <header class="special-hero">
      <h1 class="special-title">SPECIAL</h1>
    </header>

    <client-only>
      <!-- PC: タブ表示 -->
      <div v-if="smAndUp" class="special-desktop-view">
        <v-tabs v-model="tab" color="pen" class="special-tabs">
          <v-tab value="gallery">三面図</v-tab>
          <v-tab value="lyrics">歌詞カード</v-tab>
        </v-tabs>

        <v-window v-model="tab" class="special-tab-content">
          <v-window-item value="gallery">
            <article class="wall-card wall-gallery">
              <div class="gallery-description text-pen">
                <p>
                  ファンアート、<a
                    href="https://www.youtube.com/live/3hJttokBN4E?t=5391s"
                    target="_blank"
                    rel="noopener"
                    >Skeb依頼</a
                  >などご活用ください！
                </p>
              </div>
              <v-carousel v-model="selectedGallery" height="600" hide-delimiters show-arrows="hover">
                <template #prev="{ props }">
                  <v-btn
                    icon="mdi-chevron-left"
                    color="pen"
                    variant="elevated"
                    size="large"
                    @click="props.onClick"
                  ></v-btn>
                </template>
                <template #next="{ props }">
                  <v-btn
                    icon="mdi-chevron-right"
                    color="pen"
                    variant="elevated"
                    size="large"
                    @click="props.onClick"
                  ></v-btn>
                </template>
                <v-carousel-item v-for="item in gallery" :key="item.imageName">
                  <div class="carousel-slide">
                    <div v-if="!imageLoaded[item.imageName]" class="gallery-skeleton">
                      <v-skeleton-loader type="image" height="550"></v-skeleton-loader>
                    </div>
                    <div v-show="imageLoaded[item.imageName]" class="gallery-item-carousel">
                      <img
                        :src="generateGalleryUrl(item.imageName, 'c_fit,f_auto,q_auto,w_1200')"
                        :alt="item.imageName"
                        @load="onImageLoad(item.imageName)"
                      />
                      <v-btn
                        class="overlay-btn"
                        variant="outlined"
                        color="pen"
                        :href="generateGalleryUrl(item.imageName)"
                        target="_blank"
                      >
                        <span>拡大表示</span>
                      </v-btn>
                    </div>
                  </div>
                </v-carousel-item>
              </v-carousel>
            </article>
          </v-window-item>

          <v-window-item value="lyrics">
            <article class="wall-card wall-lyrics">
              <div class="wall-media-container">
                <div v-if="!imageLoaded.lyrics" class="lyrics-skeleton">
                  <v-skeleton-loader type="image" height="62vh"></v-skeleton-loader>
                </div>
                <div v-show="imageLoaded.lyrics">
                  <a :href="getImageUrl(lyrics.imageName, '')" target="_blank" rel="noopener" class="wall-media">
                    <img
                      :src="getImageUrl(lyrics.imageName, 'c_fit,f_auto,q_auto,w_900')"
                      :alt="lyrics.title"
                      @load="onImageLoad('lyrics')"
                    />
                  </a>
                  <v-btn
                    class="overlay-btn"
                    variant="outlined"
                    color="pen"
                    :href="getImageUrl(lyrics.imageName, '')"
                    target="_blank"
                  >
                    <span>拡大表示</span>
                  </v-btn>
                </div>
              </div>
              <p class="chorus-link text-pen">
                <a href="https://www.youtube.com/watch?v=WYOWVU6dtw8" target="_blank" rel="noopener">
                  合いの手動画はこちら
                </a>
              </p>
            </article>
          </v-window-item>
        </v-window>
      </div>

      <!-- モバイル: 縦並び -->
      <section v-else class="special-wall">
        <article class="wall-card wall-gallery">
          <p class="wall-title">三面図</p>
          <div class="gallery-description text-pen">
            <p>
              ファンアート、<a href="https://www.youtube.com/live/3hJttokBN4E?t=5391s" target="_blank" rel="noopener"
                >Skeb依頼</a
              >などご活用ください！
            </p>
          </div>
          <div class="gallery-grid">
            <div v-for="item in gallery" :key="item.imageName" class="gallery-item">
              <img :src="generateGalleryUrl(item.imageName, 'c_fit,f_auto,q_auto,w_600')" :alt="item.imageName" />
              <v-btn
                class="overlay-btn"
                variant="outlined"
                color="pen"
                :href="generateGalleryUrl(item.imageName)"
                target="_blank"
              >
                <span>拡大表示</span>
              </v-btn>
            </div>
          </div>
        </article>

        <article class="wall-card wall-lyrics">
          <p class="wall-title" v-text="lyrics.title" />
          <div class="wall-media-container">
            <div v-if="!imageLoaded.lyrics" class="lyrics-skeleton">
              <v-skeleton-loader type="image" height="62vh"></v-skeleton-loader>
            </div>
            <div v-show="imageLoaded.lyrics">
              <a :href="getImageUrl(lyrics.imageName, '')" target="_blank" rel="noopener" class="wall-media">
                <img
                  :src="getImageUrl(lyrics.imageName, 'c_fit,f_auto,q_auto,w_900')"
                  :alt="lyrics.title"
                  @load="onImageLoad('lyrics')"
                />
              </a>
              <v-btn
                class="overlay-btn"
                variant="outlined"
                color="pen"
                :href="getImageUrl(lyrics.imageName, '')"
                target="_blank"
              >
                <span>拡大表示</span>
              </v-btn>
            </div>
          </div>
          <p class="chorus-link text-pen">
            <a href="https://www.youtube.com/watch?v=WYOWVU6dtw8" target="_blank" rel="noopener">
              合いの手動画はこちら
            </a>
          </p>
        </article>
      </section>
    </client-only>
  </div>
</template>

<script setup>
import { useDisplay } from 'vuetify'

const { smAndUp } = useDisplay()
const tab = ref('gallery')
const selectedGallery = ref(0)

const imageLoaded = ref({
  'normal.png': false,
  'mizugi.png': false,
  'idol.png': false,
  lyrics: false,
})

const onImageLoad = (imageName) => {
  imageLoaded.value[imageName] = true
}

const { getImageUrl } = useCloudinary()

const gallery = ref([{ imageName: 'normal.png' }, { imageName: 'mizugi.png' }, { imageName: 'idol.png' }])
const generateGalleryUrl = (imageName, params) => {
  return getImageUrl(`v1707753283/3menzu/${imageName}`, params || 'f_auto,q_auto')
}

const lyrics = {
  title: '歌詞カード',
  imageName: 'special/special_lyric_1_ed7uop.jpg',
}
</script>

<style scoped>
.special-page {
  padding: 36px 16px 64px;
}

.special-hero {
  max-width: 720px;
  margin: 0 auto 40px;
  padding: 0 20px;
  text-align: center;
}

.special-title {
  font-family: 'Mochiy Pop One', sans-serif;
  font-size: clamp(2.5rem, 4vw, 4rem);
  margin: 0 0 12px;
  color: #3c3c32;
  text-shadow: 4px 4px 0 rgba(60, 60, 50, 0.3);
  letter-spacing: 0.1em;
}

.special-desktop-view {
  max-width: 1200px;
  margin: 0 auto;
}

.special-tabs {
  margin-bottom: 0;
  background: transparent;
}

.special-tabs :deep(.v-slide-group__content) {
  justify-content: flex-start;
  gap: 0;
}

.special-tabs :deep(.v-tab) {
  background: #f4f5f7;
  border: none;
  margin-right: 0;
  border-radius: 12px 12px 0 0 !important;
  transition: all 0.2s ease;
  opacity: 0.6;
}

.special-tabs :deep(.v-tab--selected) {
  background: #f4f5f7;
  opacity: 1;
}

.special-tab-content {
  position: relative;
}

.special-tab-content :deep(.v-window__container) {
  position: relative;
}

.special-tab-content :deep(.wall-card) {
  border: none;
  border-radius: 0 16px 16px 16px;
  box-shadow: none;
}
.special-wall {
  display: grid;
  gap: 20px;
  grid-template-columns: 1fr;
}

.wall-card {
  background: #f4f5f7;
  border: 2px solid rgba(60, 60, 50, 0.25);
  padding: 16px;
  position: relative;
  box-shadow: 4px 4px 0 rgba(60, 60, 50, 0.15);
  border-radius: 16px;
}

.wall-lyrics {
  grid-column: auto;
}

.wall-gallery {
  background: #f4f5f7;
}

.wall-title {
  font-size: 1.2rem;
  margin: 0 0 12px;
  color: #3c3c32;
}

.gallery-description {
  margin-bottom: 16px;
  font-size: 0.95rem;
}

.gallery-description a {
  color: inherit;
  text-decoration: underline;
  text-decoration-skip-ink: none;
}

.wall-media-container {
  position: relative;
}

.wall-media {
  display: block;
  border: 1px solid rgba(60, 60, 50, 0.25);
  background: #fff;
  padding: 8px;
  border-radius: 12px;
}

.wall-media img {
  display: block;
  width: 100%;
  max-height: 62vh;
  object-fit: contain;
}

.overlay-btn {
  position: absolute;
  right: 16px;
  bottom: 16px;
  background-color: #3c3c32 !important;
  color: #f4f5f7 !important;
  border-color: #3c3c32 !important;
}

.overlay-btn:hover {
  background-color: #2a2a24 !important;
}

.chorus-link {
  margin-top: 12px;
  font-size: 0.95rem;
}

.chorus-link a {
  color: #1976d2;
  text-decoration: underline;
  text-decoration-skip-ink: none;
}

.gallery-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr;
}

.gallery-item {
  position: relative;
}

.carousel-slide {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  height: 100%;
  position: relative;
}

.gallery-skeleton {
  max-width: 900px;
  margin: 0 auto;
  border-radius: 12px;
}

.lyrics-skeleton {
  border-radius: 12px;
}

.gallery-item-carousel {
  position: relative;
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.gallery-item-carousel img {
  max-width: 100%;
  max-height: 550px;
  height: auto;
  border: 1px solid rgba(60, 60, 50, 0.25);
  border-radius: 12px;
  object-fit: contain;
  display: block;
}

.gallery-grid img {
  width: 100%;
  border: 1px solid rgba(60, 60, 50, 0.25);
  border-radius: 12px;
  height: auto;
  object-fit: contain;
  display: block;
}

@media (min-width: 720px) {
  .special-page {
    padding: 48px 20px 80px;
  }

  .special-hero {
    max-width: 980px;
    margin-bottom: 36px;
    padding: 20px 24px;
  }

  .special-wall {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }

  .wall-lyrics {
    grid-column: span 2;
  }

  .gallery-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
