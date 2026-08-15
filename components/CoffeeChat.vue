<template>
  <v-btn class="chat-fab" color="#313131" icon elevation="4" size="large" @click="open = true">
    <v-icon color="paper">mdi-coffee-outline</v-icon>
  </v-btn>

  <v-dialog v-model="open" :width="width" height="70vh" max-height="620" scrollable>
    <v-card class="chat-card text-pen">
      <v-card-title class="d-flex align-center chat-title">
        <span>味や香りで探す(β)</span>
        <v-menu :close-on-content-click="false" location="bottom start" max-width="320">
          <template #activator="{ props: activatorProps }">
            <v-btn v-bind="activatorProps" icon variant="text" density="comfortable" aria-label="この検索について">
              <v-icon size="20">mdi-help-circle-outline</v-icon>
            </v-btn>
          </template>
          <v-card class="chat-help text-pen">
            <v-card-text>
              <p class="chat-help-lead">
                入力された文章は、条件に合致するコーヒーを検索するために Cloudflare のAIサービスへ送信されます。
              </p>
              <ul class="chat-help-list">
                <li>
                  入力内容はAIの学習には使われません（<a
                    href="https://developers.cloudflare.com/workers-ai/platform/data-usage/"
                    target="_blank"
                    rel="noopener noreferrer"
                    >Cloudflare のデータ取り扱い方針</a
                  >）
                </li>
                <li>当サイトは入力された文章そのものを保存しません</li>
                <li>回答のためにAIが文章を生成することはありません</li>
                <li>念のため個人情報の入力はお控えください</li>
              </ul>
            </v-card-text>
          </v-card>
        </v-menu>
        <v-spacer />
        <v-btn icon variant="text" density="comfortable" aria-label="閉じる" @click="open = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text ref="logEl" class="chat-log">
        <div v-for="(m, i) in messages" :key="i" :class="['chat-row', `chat-row--${m.role}`]">
          <div :class="['chat-bubble', `chat-bubble--${m.role}`]">
            <div class="chat-text">{{ m.text }}</div>

            <div v-if="m.items?.length" class="chat-results">
              <div v-for="c in m.items" :key="c.videoId" class="chat-result">
                <div class="chat-result-head">
                  <span class="chat-result-name">{{ c.name }}</span>
                  <span class="chat-result-date">{{ c.pubDate }}</span>
                </div>
                <p class="chat-result-review">{{ c.reviewText }}</p>
                <p v-if="c.note" class="chat-result-note">
                  <v-icon size="13">mdi-storefront-outline</v-icon>
                  <template v-for="(part, k) in noteParts(c.note)" :key="k">
                    <a v-if="part.url" :href="part.url" target="_blank" rel="noopener noreferrer">{{ part.text }}</a>
                    <span v-else>{{ part.text }}</span>
                  </template>
                </p>
                <div class="chat-result-actions">
                  <v-btn size="small" variant="outlined" @click="emit('select-video', c.videoId, c.reviewTime)">
                    REVIEW
                  </v-btn>
                </div>
              </div>
            </div>

            <div v-if="m.hint" class="chat-hint">{{ m.hint }}</div>
          </div>
        </div>

        <div v-if="loading" class="chat-row chat-row--assistant">
          <div class="chat-bubble chat-bubble--assistant chat-loading">
            <v-progress-circular indeterminate size="16" width="2" />
            <span>{{ TEXT.loading }}</span>
          </div>
        </div>
      </v-card-text>

      <div class="chat-foot">
        <div class="chat-suggests">
          <v-chip v-for="s in SUGGESTS" :key="s" size="small" variant="outlined" :disabled="loading" @click="send(s)">
            {{ s }}
          </v-chip>
        </div>

        <v-text-field
          v-model="input"
          class="mt-2"
          variant="outlined"
          density="compact"
          placeholder="例: 酸味が少なくてまろやかなもの"
          :maxlength="MAX_LEN"
          counter
          hide-details="auto"
          :disabled="loading"
          @keydown.enter="send()"
        >
          <template #append-inner>
            <v-btn icon variant="text" density="comfortable" :disabled="loading" @click="send()">
              <v-icon>mdi-send</v-icon>
            </v-btn>
          </template>
        </v-text-field>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
// 味や香りの記述から近いコーヒーを探すチャット。
// 「イルガチェフェを全部見たい」のような銘柄名での網羅的な絞り込みは苦手なので、そちらはページ側の検索欄に任せる。
const props = defineProps({
  coffees: { type: Array, required: true },
  width: { type: String, default: '100vw' },
})
const emit = defineEmits(['select-video'])

// 応答の確度を伝えるボーダーライン。
// 実測したスコア分布から決めており、これを下回っても結果は出す。
const CONFIDENT_SCORE = 0.72
const MAX_LEN = 100

const TEXT = {
  intro: '味や香りの好みを教えてください。理原ひなりさんのレビューコメントから、近いものを探します。',
  loading: 'コーヒーを選んでいます…',
  confident: 'ご希望に近いコーヒーをお持ちしました。',
  vague: 'ぴったりではないかもしれませんが、近いものをお持ちしました。',
  none: 'ご要望に合うコーヒーを見つけられませんでした。例えば『酸味が控えめ』など、他の言葉でもう一度お試しください。',
  quota: '本日分の在庫を切らしてしまいました。朝9時ごろに入荷がございますので、ぜひまたお越しください。',
  busy: '順番にお淹れしていますので、少々お待ちください。',
  error: 'ただいま準備中でございます。少し時間を置いてから、もう一度お試しくださいませ。',
  nameHint: '銘柄でお探しでしたら、上部の検索欄もご利用ください。',
}

// レビューコメントに厚く含まれる語彙から選び、いずれも実測で確度の高い帯に入る
const SUGGESTS = [
  '酸味が控えめ',
  'しっかりコクがある',
  '初心者向けで飲みやすい',
  '華やかな香り',
  'まろやかな口当たり',
  '甘みを感じる',
]

const open = ref(false)
const input = ref('')
const loading = ref(false)
const logEl = ref(null)
const messages = ref([{ role: 'assistant', text: TEXT.intro }])

const coffeeById = computed(() => new Map(props.coffees.map((c) => [c.videoId, c])))

// 末尾へ飛ばすと結果一覧の最下部が出て読み始めが見えないため、
// 最後の吹き出しの先頭が見える位置までスクロールする
const push = async (message) => {
  messages.value.push(message)
  await nextTick()
  const el = logEl.value?.$el ?? logEl.value
  if (!el) return
  const rows = el.querySelectorAll('.chat-row')
  const last = rows[rows.length - 1]
  el.scrollTop = last ? Math.max(0, last.offsetTop - 8) : el.scrollHeight
}

// note は店舗情報の任意項目で、URL単体・店名のみ・両方の混在がある。
// URL部分だけリンクにし、表示はホスト名に縮める(長いURLは折り返して間延びするため)。
const noteParts = (note) =>
  // split はキャプチャグループを結果に含めるので、区切り(URL)も配列に残る
  note
    .split(/(https?:\/\/[^\s（）()]+)/)
    .filter(Boolean)
    .map((s) => {
      if (!s.startsWith('http')) return { text: s }
      try {
        return { text: new URL(s).hostname.replace(/^www\./, ''), url: s }
      } catch {
        return { text: s }
      }
    })

const send = async (preset) => {
  const query = String(preset ?? input.value ?? '').trim()
  if (!query || loading.value) return

  input.value = ''
  await push({ role: 'user', text: query })
  loading.value = true

  let reply
  try {
    const res = await fetch('/api/search', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query }),
    })
    const data = await res.json().catch(() => ({}))

    if (!res.ok || data.error) {
      // 429 は Cloudflare のレート制限。busy と原因は違うが取るべき行動が同じなので文言を共通にする。
      // UI を経由していれば起きないエラー(forbidden 等)は error に集約する。
      const key = TEXT[data.error] ? data.error : res.status === 429 ? 'busy' : 'error'
      reply = { role: 'assistant', text: TEXT[key] }
    } else if (!data.results?.length) {
      reply = { role: 'assistant', text: TEXT.none }
    } else {
      // 本文はサーバーから返さずに payload の一覧から videoId で引く
      const items = data.results.map((r) => coffeeById.value.get(r.videoId)).filter(Boolean)
      const nameHits = props.coffees.some((c) => nameMatches(c, query))

      reply = {
        role: 'assistant',
        text: data.top >= CONFIDENT_SCORE ? TEXT.confident : TEXT.vague,
        items,
        hint: nameHits && data.top < CONFIDENT_SCORE ? TEXT.nameHint : '',
      }
    }
  } catch {
    reply = { role: 'assistant', text: TEXT.error }
  }

  // 回答を push する前にローディング行を消す。残したままだと最後の行がローディングになり、
  // そこへスクロールしたあとに行が消えて最下部に飛んでしまうため。
  loading.value = false
  await push(reply)
}
</script>

<style lang="scss" scoped>
.chat-fab {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 1005;
}

// 高さは v-dialog 側の height / max-height で与えること。
// scrollable なダイアログでは Vuetify がこのカードを flex アイテムとして扱うため、
// ここに height を書いても無視され、内容の量で高さが変わってしまう。
.chat-card {
  display: flex;
  flex-direction: column;
}

.chat-title {
  font-size: 1rem;
  padding-bottom: 8px;
}

// 説明文は本文用のポップな書体だと軽く見えるため、システムフォントで温度感を落とす
.chat-help {
  font-family:
    system-ui,
    -apple-system,
    'Hiragino Sans',
    'Noto Sans JP',
    'Meiryo',
    sans-serif;
  font-size: 12px;
  line-height: 1.8;

  a {
    color: inherit;
    text-underline-offset: 2px;
  }

  &-lead {
    margin-bottom: 8px;
  }

  &-list {
    margin: 0 0 8px;
    padding-left: 1.2em;
  }

  &-note {
    font-size: 11px;
    opacity: 0.7;
  }
}

.chat-log {
  position: relative; // 吹き出しの offsetTop の基準にする
  flex: 1 1 auto;
  overflow-y: auto;
  padding-top: 0;
}

.chat-row {
  display: flex;
  margin-bottom: 20px;

  &--user {
    justify-content: flex-end;
  }
}

// 塗りの色と左右の位置だけで話者を示す。
// 話者側の下の角だけ角を落として向きを補助する。
.chat-bubble {
  max-width: 88%;
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.7;

  &--assistant {
    border-bottom-left-radius: 4px;
    background-color: rgb(60 60 50 / 9%);
  }

  &--user {
    border-bottom-right-radius: 4px;
    background-color: #3c3c32;
    color: #f4f5f7;
  }
}

.chat-text {
  white-space: pre-wrap;
}

.chat-loading {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chat-results {
  margin-top: 12px;
  border-top: 2px dotted rgb(60 60 50 / 35%);
}

.chat-result {
  padding: 12px 0;

  & + & {
    border-top: 2px dotted rgb(60 60 50 / 35%);
  }

  &-head {
    display: flex;
    align-items: baseline;
    gap: 8px;
    flex-wrap: wrap;
  }

  &-name {
    font-weight: 700;
  }

  &-date {
    font-size: 12px;
    opacity: 0.7;
  }

  &-review {
    margin: 4px 0 8px;
    font-size: 13px;
    line-height: 1.6;
    white-space: pre-wrap;
  }

  &-note {
    display: flex;
    align-items: baseline;
    gap: 4px;
    margin-bottom: 8px;
    font-size: 12px;
    opacity: 0.8;
    overflow-wrap: anywhere;

    a {
      color: inherit;
    }
  }

  &-actions {
    display: flex;
    gap: 8px;
  }
}

.chat-hint {
  margin-top: 10px;
  font-size: 12px;
  opacity: 0.75;
}

.chat-foot {
  flex: 0 0 auto;
  padding: 8px 16px 12px;
  border-top: 1px solid rgb(49 49 49 / 12%);
}

.chat-suggests {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chat-note {
  margin-top: 6px;
  font-size: 11px;
  opacity: 0.7;
}
</style>
