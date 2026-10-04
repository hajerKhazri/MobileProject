// src/config/config.js
import { Platform } from 'react-native';

export const KEYCLOAK_CONFIG = {
  issuer: 'http://localhost:8088/realms/enda_tao_realm',
  clientId: 'enda_tao_client',
  redirectUri: 'exp://localhost:8081',
};

// ✅ Détecter si on est sur le PC ou sur le téléphone
const isLocalhost = typeof window !== 'undefined' && 
                    (window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname === '');

// ✅ Pour le web (PC) : localhost
// ✅ Pour le web (téléphone) : IP du partage de connexion
export const API_URL = isLocalhost 
  ? 'http://localhost:8085'  
  : 'http://192.168.137.1:8085';

console.log('📍 API_URL:', API_URL);