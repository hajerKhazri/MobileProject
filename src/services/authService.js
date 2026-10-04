// src/services/authService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/config';

export const login = async (username, password) => {
    try {
        console.log('🔐 Tentative de connexion avec:', username);

        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            return { success: false, error: error.error || `Erreur ${response.status}` };
        }

        const data = await response.json();
        console.log('✅ Données reçues:', data);

        // ✅ On accepte "token" OU "access_token"
        const token = data.token || data.access_token;
        console.log('🔑 Token extrait:', token ? '✅ OUI' : '❌ NON');

        if (!token) {
            return { success: false, error: 'Aucun token reçu du serveur' };
        }

        await AsyncStorage.setItem('userToken', token);
        console.log('✅ Token stocké avec succès');

        return { success: true };

    } catch (error) {
        console.error('💥 Erreur réseau:', error.message);
        return { success: false, error: 'Impossible de contacter le serveur' };
    }
};

export const logout = async () => {
    await AsyncStorage.removeItem('userToken');
};

export const getToken = async () => {
    return await AsyncStorage.getItem('userToken');
};