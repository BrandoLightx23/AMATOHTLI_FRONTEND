import React from 'react'

import ReactDOM from 'react-dom/client'

import App from './App'

import './index.css'

import {
  AppProvider
}
  from './context/AppContext'

import { LanguageProvider } from './context/LanguageContext'

ReactDOM.createRoot(
  document.getElementById('root')
).render(

  <LanguageProvider>

    <AppProvider>

      <App />

    </AppProvider>

  </LanguageProvider>

)