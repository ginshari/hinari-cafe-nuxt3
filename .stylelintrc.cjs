module.exports = {
  extends: ['stylelint-config-standard-vue', 'stylelint-config-standard-scss', 'stylelint-config-standard-vue/scss'],
  rules: {
    // 既定は kebab-case だけ。:deep() で上書きする Vuetify のクラス (v-tab--selected、
    // v-window__container など) は BEM の形なので、それも許す
    'selector-class-pattern': [
      '^([a-z][a-z0-9]*)(-[a-z0-9]+)*$|^v-[a-z0-9-]+(__[a-z0-9-]+)?(--[a-z0-9-]+)?$',
      { message: (selector) => `Expected class selector "${selector}" to be kebab-case (or Vuetify BEM)` },
    ],
  },
}
