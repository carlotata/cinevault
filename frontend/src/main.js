import { createApp } from 'vue'
import App from './App.vue'

import {
  Quasar,
  Dialog,
  Notify,
  QBtn,
  QDialog,
  QCard,
  QCardSection,
  QCardActions,
  QSpinner,
  QSpinnerDots,
  QTooltip,
  QBadge
} from 'quasar'

import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'
import './assets/main.css'

import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'

if (Capacitor.isNativePlatform()) {
  StatusBar.setStyle({ style: Style.Dark }).catch(() => {})
  StatusBar.setBackgroundColor({ color: '#080b11' }).catch(() => {})
}

const isNative = Capacitor.isNativePlatform()

const app = createApp(App)

app.use(Quasar, {
  plugins: {
    Dialog,
    Notify
  },
  components: {
    QBtn,
    QDialog,
    QCard,
    QCardSection,
    QCardActions,
    QSpinner,
    QSpinnerDots,
    QTooltip,
    QBadge
  },
  config: {
    dark: true,
    notify: {
      position: isNative ? 'top' : 'bottom-right',
      timeout: 3200
    }
  }
})

app.mount('#app')
