const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-CQ3MN53CLR';

export function initAnalytics() {
  if (!GA_ID) return;
  if (window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: 'granted',
    });
    window.gtag('config', GA_ID, {
      anonymize_ip: true,
      send_page_view: true,
    });
    return;
  }
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('consent', 'update', {
    analytics_storage: 'granted',
  });
  window.gtag('config', GA_ID, {
    anonymize_ip: true,
    send_page_view: true,
  });
}

export function trackEvent(name, params = {}) {
  if (!window.gtag) return;
  window.gtag('event', name, params);
}
