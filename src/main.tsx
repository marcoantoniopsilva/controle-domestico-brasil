
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// STABLE BUILD v2025-05-21-stable-NO-REFRESH
// Todas as atualizações automáticas foram completamente desativadas
console.log("[STABLE BUILD] Inicializando aplicação versão estável v2025-05-21-stable-NO-REFRESH - CACHE DESABILITADO");
console.log("[CACHE CONTROL] Cache completamente desabilitado via meta tags HTTP");

// Renderização simples sem nenhum mecanismo de auto-refresh
createRoot(document.getElementById("root")!).render(<App />);
