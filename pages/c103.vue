<template>
  <client-only>
    <!-- メニュー -->
    <v-container v-if="step == 0">
      <v-img
        max-width="1200px"
        src="https://res.cloudinary.com/hinari-s-cafe/image/upload/f_webp/c103/cdctzfeh9d2acp0dy8og.jpg"
        class="mx-auto"
      ></v-img>
      <div class="text-center my-8">
        <v-btn variant="flat" size="x-large" rounded="lg" color="primary" @click="step = 1"
          >オーダーシートはこちら</v-btn
        >
      </div>
    </v-container>
    <!-- 注文/確認 -->
    <v-container v-if="step != 0">
      <v-sheet class="mx-auto my-8 pb-16" style="max-width: 1200px" rounded="lg" color="paper">
        <v-row justify="center">
          <v-col cols="12" class="text-center">
            <h1 class="text-pen sheet-title mb-16">{{ steps[step] }}</h1>
          </v-col>
        </v-row>
        <v-row class="ma-4" no-gutters>
          <v-col v-for="item in items" :key="item.id" cols="12">
            <div v-if="step == 1 || item.inCart">
              <v-card flat color="transparent">
                <v-row>
                  <!-- 画像 -->
                  <v-col cols="12" sm="6" class="d-flex align-center">
                    <v-img :src="`${imageBaseUrl}${item.id}.jpg`" height="200px"></v-img>
                  </v-col>
                  <!-- 商品詳細 -->
                  <v-col cols="12" sm="6" class="d-flex flex-column justify-space-between text-pen">
                    <div v-if="smAndUp" class="pa-0">
                      <div class="menu-card-title mb-2 pr-16">{{ item.name }}</div>
                      <div class="menu-card-subtitle mb-2">{{ `¥${formatNumberWithCommas(item.price)}` }}</div>
                    </div>
                    <div v-else class="d-flex flex-column text-center ga-2">
                      <div class="menu-card-title mb-2">{{ item.name }}</div>
                      <div class="menu-card-subtitle mb-2">
                        {{ `¥${formatNumberWithCommas(item.price)}` }}
                      </div>
                      <div class="w-50 mx-auto ma-0" style="height: 50px">
                        <v-btn
                          v-if="!item.inCart"
                          :variant="item.inCart ? 'outlined' : 'flat'"
                          color="pen"
                          size="large"
                          @click="toggleInCart(item)"
                          >カートに追加</v-btn
                        >
                        <v-text-field
                          v-if="step == 1 && item.inCart"
                          v-model="item.quantity"
                          type="number"
                          label="数量"
                          min="1"
                          max="999"
                          density="compact"
                          variant="outlined"
                          hide-details
                          clearable
                          class="mx-auto"
                          @blur="fixQuantity(item)"
                          @click:clear="toggleInCart(item)"
                        ></v-text-field>
                        <p v-if="step == 2" class="quantity">{{ `${item.quantity}個` }}</p>
                      </div>
                    </div>
                    <div v-if="smAndUp" class="w-50">
                      <v-btn
                        v-if="!item.inCart"
                        :variant="item.inCart ? 'outlined' : 'flat'"
                        color="pen"
                        size="large"
                        @click="toggleInCart(item)"
                        >カートに追加</v-btn
                      >
                      <v-text-field
                        v-if="step == 1 && item.inCart"
                        v-model="item.quantity"
                        type="number"
                        label="数量"
                        min="1"
                        :max="String(MAX_QUANTITY)"
                        density="compact"
                        variant="outlined"
                        hide-details
                        clearable
                        class="mx-auto"
                        @blur="fixQuantity(item)"
                        @click:clear="toggleInCart(item)"
                      ></v-text-field>
                      <p v-if="step == 2" class="quantity">{{ `${item.quantity}個` }}</p>
                    </div>
                  </v-col>
                </v-row>
              </v-card>
              <v-divider class="my-16"></v-divider>
            </div>
          </v-col>
          <v-col cols="12" class="text-center">
            <div v-if="step == 1">
              <v-btn size="large" variant="outlined" color="primary" width="150px" class="mr-2" @click="step = 0"
                >メニューに戻る</v-btn
              >
              <v-btn size="large" variant="flat" color="primary" width="150px" @click="validate()">確認する</v-btn>
            </div>
            <div v-if="step == 2">
              <div class="mx-auto mb-8 total text-pen">{{ `合計 ： ¥${formatNumberWithCommas(total)}` }}</div>
              <v-btn size="large" variant="outlined" color="primary" width="150px" class="mr-2" @click="step = 1"
                >修正する</v-btn
              >
              <v-btn size="large" variant="flat" color="primary" width="150px" @click="dialog = true">確定する</v-btn>
            </div>
          </v-col>
        </v-row>
      </v-sheet>
      <!-- 注文書 -->
      <v-dialog v-model="dialog" fullscreen>
        <v-card class="pa-8">
          <v-table class="mx-auto rounded-lg text-pen">
            <thead>
              <tr>
                <th v-for="head in headers" :key="head.key">{{ head.title }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in items.filter((item) => item.inCart)" :key="item.id">
                <td class="auto-phrase">{{ item.name }}</td>
                <td>{{ `¥${formatNumberWithCommas(item.price)}` }}</td>
                <td>{{ item.quantity }}</td>
              </tr>
            </tbody>
          </v-table>
          <p class="text-center total text-pen">{{ `合計 ： ¥${formatNumberWithCommas(total)}` }}</p>
          <p class="mb-8 text-center text-red">※念のため検算をお願いします</p>
          <!-- 説明文とボタンは印刷時に非表示にする -->
          <div class="mx-auto pa-4 no-print">
            <ul class="auto-phrase text-pen">
              <li>「保存する」ボタンを押すと、ブラウザに注文内容が保存されます</li>
              <li>「印刷する」ボタンを押すと、ブラウザの機能により注文内容が印刷されます</li>
              <li>「印刷する」ボタンがうまく動作しない場合は、スクリーンショットをご利用ください</li>
            </ul>
            <v-card-actions class="d-flex justify-center text-pen mt-4">
              <v-btn size="large" variant="outlined" color="primary" @click="closeDialog()">閉じる</v-btn>
              <v-btn size="large" variant="flat" color="primary" @click="save()">保存する</v-btn>
              <v-btn size="large" variant="flat" color="pen" @click="print()">印刷する</v-btn>
            </v-card-actions>
          </div>
        </v-card>
      </v-dialog>
      <v-snackbar v-model="onSave" :timeout="2000" color="success" location="top"
        ><span class="text-paper">保存しました</span></v-snackbar
      >
      <v-snackbar v-model="onError" :timeout="2000" color="error">{{ errorMessage }}</v-snackbar>
    </v-container>
  </client-only>
</template>
<script setup>
import { useDisplay } from 'vuetify'

const { smAndUp } = useDisplay()

definePageMeta({
  layout: 'simple',
})

// 注文ステップ
const steps = { 0: 'MENU', 1: 'ITEM', 2: 'ORDER' }
const step = ref(0)

const MAX_DIGITS = 3 // 数量の最大桁数
const MAX_QUANTITY = Number('9'.repeat(MAX_DIGITS)) // 数量の最大値
const MIN_QUANTITY = 1 // 数量の最小値

const headers = [
  { title: '品名', key: 'name' },
  { title: '単価', key: 'price' },
  { title: '数量', key: 'quantity' },
]
const imageBaseUrl = 'https://res.cloudinary.com/hinari-s-cafe/image/upload/c_pad,h_200,w_200/f_webp/c103/'
const items = reactive(
  [
    {
      id: 'loikvfiknvsupknhepus',
      name: '理原ブレンド',
      price: 3000,
    },
    {
      id: 'jlnlfpioytv2b5sujrne',
      name: 'アクリルスタンド 喫茶理原店長ver.',
      price: 3500,
    },
    {
      id: 'ugrjn4flym5xthkybqao',
      name: '木製キーホルダー 喫茶理原店長ver.',
      price: 2000,
    },
    {
      id: 'uawq67j1ow3ac7tbs3wq',
      name: 'ホテルルームキー',
      price: 1500,
    },
    {
      id: 'lethjfkuefepis73tgcx',
      name: 'カップホルダー',
      price: 1500,
    },
    {
      id: 'dtrx2xaujytnd6fqzdgd',
      name: 'ポストカードセット 3枚入り',
      price: 500,
    },
    {
      id: 'cqwfk2hdahghivt49739',
      name: 'ランダムチェキ 全5種',
      price: 1000,
    },
    {
      id: 'cyv3p0utymipswn6pns6',
      name: '喫茶店占い',
      price: 100,
    },
  ].map((item) => {
    return { ...item, quantity: MIN_QUANTITY, inCart: false }
  })
)
const dialog = ref(false)
const onSave = ref(false)
const onError = ref(false)
const errorMessage = ref('')

onMounted(() => {
  // カートの中身を復元する
  const cart = JSON.parse(localStorage.getItem('cart'))
  if (cart) {
    cart.forEach((item) => {
      const target = items.find((i) => i.id === item.id)
      if (target) {
        target.inCart = true
        target.quantity = item.quantity
      }
    })
  }
})

// 数値のフォーマット
const formatNumberWithCommas = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// カートに追加する
const toggleInCart = (item) => {
  item.quantity = 1
  item.inCart = !item.inCart
}

// バリデーション
const validate = () => {
  // 不正な数量は除外する
  for (const item of items) {
    if (item.inCart && isInvalidQuantity(item)) {
      onError.value = true
      errorMessage.value = '数量が不正です'
      return
    }
  }
  // 選択なしはエラー
  if (!items.filter((item) => item.inCart).length > 0) {
    onError.value = true
    errorMessage.value = 'カートが空です'
    return
  }
  step.value = 2
}

// 数量はMIN~MAX以内の正の整数値でなければInvalid
const isInvalidQuantity = (item) => {
  const quantity = Number(item.quantity)
  return isNaN(quantity) || !Number.isInteger(quantity) || quantity < MIN_QUANTITY || MAX_QUANTITY < quantity
}

// 数量を正常値に変換する
const fixQuantity = (item) => {
  if (!isNaN(Number(item.quantity))) {
    // 数値であれば正の整数値に丸める
    const positiveInteger = item.quantity < MIN_QUANTITY ? MIN_QUANTITY : Math.round(item.quantity)
    // 最大値より大きい場合は最大値にする
    item.quantity = MAX_QUANTITY < positiveInteger ? MAX_QUANTITY : positiveInteger
  } else {
    // 数値でなければ1にする
    item.quantity = 1
  }
}

// 合計金額
const total = computed(() => {
  return items.filter((item) => item.inCart).reduce((a, b) => a + Number(b.price) * Number(b.quantity), 0)
})

// 保存する
const save = () => {
  const cart = items.filter((item) => item.inCart).map((item) => ({ id: item.id, quantity: item.quantity }))
  localStorage.setItem('cart', JSON.stringify(cart))
  onSave.value = true
}

// 印刷する
const print = () => {
  window.print()
}

// ダイアログを閉じる
const closeDialog = () => {
  dialog.value = false
}

watch(
  () => step.value,
  () => {
    // stepが変わるときはページトップにスクロールする
    window.scrollTo(0, 0)
  }
)
</script>
<style lang="scss" scoped>
.sheet-title {
  font-size: calc(0.5vw + 48px);
  font-weight: bold;
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.menu-card {
  &-title {
    font-size: min(calc(0.5vw + 20px), 32px);
    word-break: keep-all;
  }
  &-subtitle {
    font-size: min(calc(0.5vw + 16px), 28px);
  }
}

.quantity {
  font-size: calc(0.5vw + 16px);
}

.total {
  font-size: calc(0.5vw + 24px);
}

.auto-phrase {
  word-break: auto-phrase;
}

@media print {
  .no-print {
    display: none;
  }
}
</style>
