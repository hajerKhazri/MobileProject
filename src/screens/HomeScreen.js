// src/screens/HomeScreen.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { logout, isAuthenticated } from '../services/authService';
import { getCurrentUser } from '../services/apiService';

export default function HomeScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Appeler l'API Spring Boot
        const data = await getCurrentUser();
        setUserData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Erreur API:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated()) {
      fetchData();
    } else {
      setLoading(false);
      setError('Non authentifié');
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    navigation.navigate('Login');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.text}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>✅ Connecté !</Text>

      {error ? (
        <View style={styles.card}>
          <Text style={styles.errorText}>❌ Erreur : {error}</Text>
          <Text style={styles.hint}>
            Vérifie que ton backend tourne sur {API_URL}
          </Text>
        </View>
      ) : userData ? (
        <View style={styles.card}>
          <Text style={styles.label}>👤 Utilisateur :</Text>
          <Text style={styles.value}>{userData.username}</Text>
          
          <Text style={styles.label}>📧 Email :</Text>
          <Text style={styles.value}>{userData.email || 'Non renseigné'}</Text>
          
          <Text style={styles.label}>🎭 Rôles :</Text>
          <Text style={styles.value}>
            {userData.roles ? userData.roles.join(', ') : 'Aucun'}
          </Text>
          
          <Text style={styles.label}>🌍 Région :</Text>
          <Text style={styles.value}>{userData.region || 'Non définie'}</Text>
        </View>
      ) : (
        <Text style={styles.text}>Aucune donnée</Text>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  hint: {
    color: '#666',
    fontSize: 12,
    marginTop: 10,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});