import {
  mdiArrowLeft,
  mdiChevronLeft,
  mdiChevronRight,
  mdiClose,
  mdiCoffee,
  mdiCoffeeOutline,
  mdiDelete,
  mdiFilterVariant,
  mdiHelpCircleOutline,
  mdiHome,
  mdiLinkVariant,
  mdiMagnify,
  mdiOpenInNew,
  mdiPencil,
  mdiPlus,
  mdiSend,
  mdiSortAscending,
  mdiSortDescending,
  mdiStorefrontOutline,
  mdiTextBoxOutline,
} from '@mdi/js'

/**
 * 画面で使う Material Design Icons の名前と SVG のパス。
 *
 * テンプレートでは今までどおり `icon="mdi-coffee"` と書き、app/plugins/vuetify.ts が
 * この表から SVG を引いて描く。アイコンのフォント (約 400KB) を読まずに済む。
 * 新しいアイコンを使うときは、ここに足す (足し忘れは test/unit/icons.test.ts が見つける)。
 */
export const mdiIcons: Record<string, string> = {
  'mdi-arrow-left': mdiArrowLeft,
  'mdi-chevron-left': mdiChevronLeft,
  'mdi-chevron-right': mdiChevronRight,
  'mdi-close': mdiClose,
  'mdi-coffee': mdiCoffee,
  'mdi-coffee-outline': mdiCoffeeOutline,
  'mdi-delete': mdiDelete,
  'mdi-filter-variant': mdiFilterVariant,
  'mdi-help-circle-outline': mdiHelpCircleOutline,
  'mdi-home': mdiHome,
  'mdi-link-variant': mdiLinkVariant,
  'mdi-magnify': mdiMagnify,
  'mdi-open-in-new': mdiOpenInNew,
  'mdi-pencil': mdiPencil,
  'mdi-plus': mdiPlus,
  'mdi-send': mdiSend,
  'mdi-sort-ascending': mdiSortAscending,
  'mdi-sort-descending': mdiSortDescending,
  'mdi-storefront-outline': mdiStorefrontOutline,
  'mdi-text-box-outline': mdiTextBoxOutline,
}
