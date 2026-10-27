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
      position: 'bottom-right',
      timeout: 3200
    }
  }
})

app.mount('#app')
