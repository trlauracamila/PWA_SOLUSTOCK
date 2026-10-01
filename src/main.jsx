import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import '../styles.css'
import { registerSW } from 'virtual:pwa-register'

// Registro del Service Worker para PWA
registerSW({ immediate: true })

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)