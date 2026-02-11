<template>
  <div class="calendar-wrapper">
    <v-container>
      <v-card class="calendar-card" color="paper" flat>
        <v-row align-content="center" no-gutters>
          <v-col cols="12" class="text-center">
            <div class="py-8">
              <p class="mb-0 text-pen title-text">CALENDAR</p>
              <p class="text-pen sub-title">イベントスケジュール</p>
            </div>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col cols="12" class="pa-4 pa-md-8">
            <div class="calendar-container">
              <iframe
                :src="calendarUrl"
                style="border: 0"
                width="100%"
                height="600"
                frameborder="0"
                scrolling="no"
              ></iframe>
            </div>
          </v-col>
        </v-row>
      </v-card>
    </v-container>
  </div>
</template>

<script setup lang="ts">
// Googleカレンダー
const calendarId = '2605bfe732849dc0a9258ad781669980304293878b85aebdae3d3873485cdb32@group.calendar.google.com'

const calendarUrl = computed(() => {
  const baseUrl = 'https://calendar.google.com/calendar/embed'
  const params = new URLSearchParams({
    src: calendarId,
    color: '#F6BF26', // 予定の色（黄色系）
    ctz: 'Asia/Tokyo',
    mode: 'MONTH', // カレンダー形式
    wkst: '1', // 週の開始日（1=日曜日）
    bgcolor: '#FFF8E1', // 背景色
    showTitle: '0',
    showNav: '1',
    showDate: '1',
    showPrint: '0',
    showTabs: '1',
    showCalendars: '0',
    showTz: '0',
  })
  return `${baseUrl}?${params.toString()}`
})
</script>

<style scoped lang="scss">
.calendar-wrapper {
  min-height: auto;
}

.calendar-card {
  margin: 2rem auto;
  max-width: 1200px;
  padding-bottom: 2rem;
  border-radius: 24px !important;
}

.title-text {
  font-size: calc(1vw + 24px);
  font-weight: bold;
  letter-spacing: 0.2em;
}

.sub-title {
  font-size: calc(0.5vw + 14px);
  margin-top: 0.5rem;
}

.calendar-container {
  width: 100%;
  overflow: hidden;
  border-radius: 16px;
  background-color: #fff;

  iframe {
    display: block;
    width: 100%;
    min-height: 600px;
    border-radius: 16px;
  }
}

@media (max-width: 600px) {
  .calendar-container iframe {
    min-height: 500px;
  }
}
</style>
