const THEME_KEY = 'polis-theme';

export function bootstrapUi(): void {
  const stored = localStorage.getItem(THEME_KEY);
  const theme = stored === 'light' || stored === 'dark' ? stored : 'dark';
  document.documentElement.setAttribute('data-theme', theme);

  if (typeof (window as Window & { invokeNative?: unknown }).invokeNative === 'function') {
    document.documentElement.classList.add('fivem-nui');
    document.body.classList.add('fivem-nui');
  }
}
