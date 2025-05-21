
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// STABLE BUILD v2025-05-21-stable - NO AUTO REFRESH
// All automatic updates have been disabled
console.log("[STABLE BUILD] Inicializando aplicação versão estável v2025-05-21-stable - SEM ATUALIZAÇÕES AUTOMÁTICAS");

// Render the app - simple render with no auto refresh
createRoot(document.getElementById("root")!).render(<App />);
