import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { store } from './store'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1E2E2D',
              color: '#E8F5F4',
              border: '1px solid rgba(20,184,166,0.3)',
              borderRadius: '10px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#0D9488', secondary: '#E8F5F4' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#E8F5F4' },
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
)
