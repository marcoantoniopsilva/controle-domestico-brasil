
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Garantindo que não temos nenhuma verificação de serviço worker ou versão
console.log("[main] Inicializando aplicação com versão estável v2025-05-21-stable");

// Render the app
createRoot(document.getElementById("root")!).render(<App />);
