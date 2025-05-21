
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Removido o checkForNewVersion para evitar verificações e recarregamentos

// Render the app
createRoot(document.getElementById("root")!).render(<App />);
