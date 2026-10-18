import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// get actual logic
import App from './App.jsx'

// then find root element and use as mount container for react
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
