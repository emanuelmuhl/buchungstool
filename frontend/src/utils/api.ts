// API URL basierend auf der aktuellen Umgebung
export const getApiUrl = () => {
  // In der Entwicklung
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3101';
  }
  
  // Über Cloudflare (HTTPS Domain)
  if (window.location.hostname.includes('casapacifico.org')) {
    return `https://${window.location.hostname}`;
  }
  
  // In der Produktion (Docker direkt)
  return `http://${window.location.hostname}:3101`;
};

// Hilfsfunktion für API-Aufrufe mit Token
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const url = `${getApiUrl()}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  console.log(`API Call: ${options.method || 'GET'} ${url}`);
  
  const response = await fetch(url, defaultOptions);
  
  if (!response.ok) {
    console.error(`API Error: ${response.status} ${response.statusText}`);
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return response;
};
