// app/(app)/localisations.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { getAllLocalisations } from '../../services/apiService';

export default function LocalisationsScreen() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await getAllLocalisations();
            setData(res || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4A6CF7" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>📍 Localisations</Text>
                <Text style={styles.count}>{data.length}</Text>
            </View>
            <FlatList
                data={data}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>{item.agent || 'Agent'}</Text>
                        <Text style={styles.cardText}>📱 {item.msisdn || 'N/A'}</Text>
                        <Text style={styles.cardText}>👤 {item.superviseur || 'N/A'}</Text>
                        <Text style={styles.cardText}>📍 {item.region || 'N/A'}</Text>
                    </View>
                )}
                ListEmptyComponent={<Text style={styles.empty}>Aucune localisation</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F4F8' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E8ECF1' },
    title: { fontSize: 22, fontWeight: '700', color: '#1A202C' },
    count: { fontSize: 14, color: '#718096' },
    card: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginVertical: 8, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E8ECF1' },
    cardTitle: { fontSize: 16, fontWeight: '600', color: '#1A202C' },
    cardText: { fontSize: 14, color: '#718096', marginTop: 4 },
    empty: { textAlign: 'center', color: '#A0AEC0', marginTop: 40 },
});