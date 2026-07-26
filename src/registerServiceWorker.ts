export function registerServiceWorker(onOnlineChange?: (isOnline: boolean) => void) {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.warn('[PWA] Service Worker registration failed:', error);
        });
    });
  }

  // Monitor Network Connectivity
  window.addEventListener('online', () => {
    if (onOnlineChange) onOnlineChange(true);
  });
  window.addEventListener('offline', () => {
    if (onOnlineChange) onOnlineChange(false);
  });
}
