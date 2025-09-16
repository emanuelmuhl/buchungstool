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

// Spezielle Funktion für PDF-Downloads über Cloudflare
export const downloadPDF = async (endpoint: string, filename: string) => {
  try {
    const token = localStorage.getItem('token');
    const url = `${getApiUrl()}${endpoint}`;
    
    console.log(`PDF Download: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/pdf',
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      console.error(`PDF Download Error: ${response.status} ${response.statusText}`);
      throw new Error(`PDF Download fehlgeschlagen: ${response.status}`);
    }

    // Content-Type prüfen
    const contentType = response.headers.get('content-type');
    console.log('Response Content-Type:', contentType);
    console.log('Response Content-Length:', response.headers.get('content-length'));
    
    if (!contentType?.includes('application/pdf')) {
      console.warn('Unerwarteter Content-Type:', contentType);
    }

    // PDF als Blob herunterladen
    const blob = await response.blob();
    console.log('PDF Blob size:', blob.size);
    
    if (blob.size < 1000) {
      console.error('PDF zu klein, möglicherweise beschädigt:', blob.size, 'bytes');
      throw new Error('PDF-Datei ist zu klein oder beschädigt');
    }

    // Download auslösen
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    
    console.log('PDF erfolgreich heruntergeladen:', filename);
  } catch (error) {
    console.error('PDF Download Fehler:', error);
    throw error;
  }
};
