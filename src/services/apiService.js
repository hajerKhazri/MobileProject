// src/services/apiService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/config';

const apiRequest = async (endpoint, method = 'GET', body = null) => {
    console.log(`📡 ${method} ${endpoint}`);
    
    const token = await AsyncStorage.getItem('userToken');
    console.log('🔑 Token présent:', token ? '✅ OUI' : '❌ NON');
    
    if (!token) {
        console.error('❌ PAS DE TOKEN');
        throw new Error('Non authentifié');
    }

    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    };
    if (body) {
        options.body = JSON.stringify(body);
        console.log('📤 Body:', JSON.stringify(body).substring(0, 100));
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        console.log(`📡 Response Status: ${response.status}`);
        
        if (response.status === 401 || response.status === 403) {
            console.warn(`⚠️ Accès refusé pour ${endpoint} (${response.status})`);
            return null;
        }
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erreur réponse:', errorText);
            try {
                const error = JSON.parse(errorText);
                throw new Error(error.error || error.message || `Erreur ${response.status}`);
            } catch {
                throw new Error(`Erreur ${response.status}: ${errorText}`);
            }
        }
        
        if (response.status === 204) return null;
        return response.json();
        
    } catch (error) {
        console.error('❌ Erreur apiRequest:', error);
        throw error;
    }
};

// ===== AUTH =====
export const getCurrentUser = async () => {
    console.log('📡 getCurrentUser appelé');
    try {
        const result = await apiRequest('/users/api/me');
        if (result === null) {
            console.log('👤 Utilisateur par défaut');
            return { username: 'Utilisateur', role: 'USER' };
        }
        return result;
    } catch (error) {
        console.warn('⚠️ getCurrentUser échoué:', error.message);
        return { username: 'Utilisateur', role: 'USER' };
    }
};

// ===== Événements =====
export const getAllEvents = () => apiRequest('/api/events');
export const getEventById = (id) => apiRequest(`/api/events/${id}`);
export const createEvent = (data) => apiRequest('/api/events', 'POST', data);
export const updateEvent = (id, data) => apiRequest(`/api/events/${id}`, 'PUT', data);
export const deleteEvent = (id) => {
    console.log('🗑️ deleteEvent ID:', id);
    return apiRequest(`/api/events/${id}`, 'DELETE');
};

// ===== Superviseurs =====
export const getAllSuperviseurs = () => apiRequest('/dashboard/superviseurs');

// ===== RÉGIONS - CORRIGÉ =====
export const getRegions = () => apiRequest('/dashboard/regions');
export const createRegion = (data) => apiRequest('/dashboard/regions', 'POST', data);

// ✅ UPDATE - utilise le nom comme identifiant (car le backend retourne des strings)
export const updateRegion = (oldName, data) => {
    console.log('✏️ updateRegion - oldName:', oldName);
    console.log('✏️ updateRegion - data:', data);
    return apiRequest(`/dashboard/regions/${encodeURIComponent(oldName)}`, 'PUT', data);
};

// ✅ DELETE - utilise le nom comme identifiant (car le backend retourne des strings)
export const deleteRegion = (name) => {
    console.log('🗑️ deleteRegion - name:', name);
    return apiRequest(`/dashboard/regions/${encodeURIComponent(name)}`, 'DELETE');
};

// ===== Localisations =====
export const getAllLocalisations = async () => {
    console.log('📡 getAllLocalisations - Récupération du token...');
    const token = await AsyncStorage.getItem('userToken');
    console.log('📡 getAllLocalisations - Token présent:', token ? 'OUI' : 'NON');
    console.log('📡 getAllLocalisations - Token:', token ? token.substring(0, 30) + '...' : 'aucun');
    return apiRequest('/api/localisation_ap/all');
};

// ===== Clôture =====
export const cloturerEvent = async (id, location) => {
    console.log('=========================================');
    console.log('📍 cloturerEvent - DÉBUT');
    console.log('📍 ID reçu:', id);
    console.log('📍 Type de ID:', typeof id);
    console.log('📍 Location reçue:', location);
    
    const eventId = typeof id === 'string' ? parseInt(id, 10) : id;
    console.log('📍 ID converti:', eventId);
    
    if (isNaN(eventId) || eventId <= 0) {
        console.error('❌ ID invalide');
        throw new Error('ID d\'événement invalide');
    }
    
    if (!location || !Array.isArray(location) || location.length !== 2) {
        console.error('❌ Location invalide:', location);
        throw new Error('Location invalide');
    }
    
    const endpoint = `/api/events/${eventId}/cloture`;
    console.log('📤 Endpoint:', endpoint);
    console.log('📤 Body:', JSON.stringify(location));
    
    try {
        const result = await apiRequest(endpoint, 'PUT', location);
        console.log('✅ Réponse cloturerEvent:', result);
        return result;
    } catch (error) {
        console.error('❌ Erreur cloturerEvent:', error);
        throw error;
    }
};

// ===== Créer un utilisateur =====
export const createUser = (username, password, role) => 
    apiRequest(`/users/create?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&role=${encodeURIComponent(role)}`, 'POST');