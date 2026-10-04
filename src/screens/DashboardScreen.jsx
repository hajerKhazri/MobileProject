// src/screens/DashboardScreen.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { getAllSuperviseurs, getAgentsBySuperviseur, getRegions } from '../services/apiService';

export default function DashboardScreen() {
  const [superviseurs, setSuperviseurs] = useState([]);
  const [selectedSuperviseur, setSelectedSuperviseur] = useState(null);
  const [agents, setAgents] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [superviseursData, regionsData] = await Promise.all([
        getAllSuperviseurs(),
        getRegions(),
      ]);
      setSuperviseurs(superviseursData || []);
      setRegions(regionsData || []);
    } catch (error) {
      console.error('Erreur chargement:', error);
      Alert.alert('Erreur', error.message);
    }
    setLoading(false);
  };

  const loadAgents = async (superviseurName) => {
    try {
      const agentsData = await getAgentsBySuperviseur(superviseurName);
      setAgents(agentsData || []);
      setSelectedSuperviseur(superviseurName);
    } catch (error) {
      console.error('Erreur chargement agents:', error);
      Alert.alert('Erreur', error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Dashboard</Text>

      <Text style={styles.subtitle}>Superviseurs :</Text>
      <FlatList
        horizontal
        data={superviseurs}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.superviseurCard,
              selectedSuperviseur === item && styles.selectedCard,
            ]}
            onPress={() => loadAgents(item)}
          >
            <Text style={styles.superviseurName}>{item}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.horizontalList}
      />

      {selectedSuperviseur && (
        <>
          <Text style={styles.subtitle}>
            Agents de {selectedSuperviseur} :
          </Text>
          <FlatList
            data={agents}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.agentCard}>
                <Text style={styles.agentName}>{item.username || item}</Text>
                {item.region && (
                  <Text style={styles.agentRegion}>Région: {item.region}</Text>
                )}
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Aucun agent trouvé</Text>
            }
          />
        </>
      )}

      <Text style={styles.subtitle}>Régions disponibles :</Text>
      <View style={styles.regionsContainer}>
        {regions.map((region) => (
          <View key={region} style={styles.regionTag}>
            <Text style={styles.regionText}>{region}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 10,
    color: '#555',
  },
  horizontalList: {
    paddingHorizontal: 5,
  },
  superviseurCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    minWidth: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: {
    backgroundColor: '#007bff',
  },
  superviseurName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  agentCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  agentRegion: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  regionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  regionTag: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  regionText: {
    fontSize: 12,
    color: '#555',
  },
});