import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App' // << importa o App

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App /> {/* << renderiza o App que tem as rotas */}
  </StrictMode>,
)

