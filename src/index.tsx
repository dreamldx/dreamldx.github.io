import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app.tsx'


let root = createRoot(document.getElementById('root') as HTMLElement);

// hydrateRoot
root.render(
  <StrictMode>
    <App />
  </StrictMode>
)
