
// Utility functions for version checking and cache management

// Generate a unique version for this app instance
export const APP_VERSION = Date.now().toString();

/**
 * Checks if the local app version matches the current deployment version
 * @returns true if a new version is detected
 */
export const checkAppVersion = (): boolean => {
  const localVersion = localStorage.getItem('app_version');
  if (!localVersion || localVersion !== APP_VERSION) {
    localStorage.setItem('app_version', APP_VERSION);
    console.log("[versionUtils] Nova versão detectada, recarregando dados...");
    
    // Limpar caches locais relevantes
    localStorage.removeItem('last_transaction_update');
    
    // Retorna true se for uma nova versão
    return localVersion !== null && localVersion !== APP_VERSION;
  }
  return false;
};

/**
 * Force clears browser cache for app resources
 */
export const clearBrowserCache = async () => {
  // Clear cache storage if available
  if ('caches' in window) {
    try {
      const cacheKeys = await caches.keys();
      for (const name of cacheKeys) {
        await caches.delete(name);
      }
      console.log("[versionUtils] Cache do navegador limpo com sucesso");
    } catch (error) {
      console.error("[versionUtils] Erro ao limpar cache:", error);
    }
  }
};
