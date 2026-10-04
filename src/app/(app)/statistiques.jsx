// app/(app)/statistiques.jsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    StatusBar,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAllEvents, getAllSuperviseurs, getRegions } from '../../services/apiService';

const { width } = Dimensions.get('window');

export default function StatistiquesScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEvents: 0,
        totalSuperviseurs: 0,
        totalRegions: 0,
        clotures: 0,
        enCours: 0,
        eventsByRegion: {},
    });

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [events, superviseurs, regions] = await Promise.all([
                getAllEvents().catch(() => []),
                getAllSuperviseurs().catch(() => []),
                getRegions().catch(() => []),
            ]);

            const clotures = events.filter(e => e.cloture === true).length;
            const enCours = events.filter(e => e.cloture === false).length;

            // Compter les événements par région
            const eventsByRegion = {};
            events.forEach(e => {
                const region = e.region || 'Non définie';
                eventsByRegion[region] = (eventsByRegion[region] || 0) + 1;
            });

            setStats({
                totalEvents: events.length,
                totalSuperviseurs: superviseurs.length,
                totalRegions: regions.length,
                clotures,
                enCours,
                eventsByRegion,
            });
        } catch (error) {
            console.error('Erreur chargement stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#3974F6" />
                <Text style={styles.loadingText}>Chargement des statistiques...</Text>
            </View>
        );
    }

    const regionEntries = Object.entries(stats.eventsByRegion);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F7F9FD" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#17243D" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>📊 Statistiques</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Cartes principales */}
                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, { backgroundColor: '#E8F0FE' }]}>
                        <Text style={[styles.statNumber, { color: '#3974F6' }]}>{stats.totalEvents}</Text>
                        <Text style={styles.statLabel}>📋 Événements</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
                        <Text style={[styles.statNumber, { color: '#43A047' }]}>{stats.totalSuperviseurs}</Text>
                        <Text style={styles.statLabel}>👤 Superviseurs</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
                        <Text style={[styles.statNumber, { color: '#FB8C00' }]}>{stats.totalRegions}</Text>
                        <Text style={styles.statLabel}>🌍 Régions</Text>
                    </View>
                </View>

                {/* Événements clôturés / en cours */}
                <View style={styles.statusSection}>
                    <Text style={styles.sectionTitle}>Statut des événements</Text>
                    <View style={styles.statusRow}>
                        <View style={[styles.statusCard, { backgroundColor: '#E8F5E9' }]}>
                            <Text style={[styles.statusNumber, { color: '#43A047' }]}>{stats.clotures}</Text>
                            <Text style={styles.statusLabel}>✅ Clôturés</Text>
                        </View>
                        <View style={[styles.statusCard, { backgroundColor: '#FFEBEE' }]}>
                            <Text style={[styles.statusNumber, { color: '#EF4444' }]}>{stats.enCours}</Text>
                            <Text style={styles.statusLabel}>🔄 En cours</Text>
                        </View>
                    </View>
                </View>

                {/* Événements par région */}
                {regionEntries.length > 0 && (
                    <View style={styles.regionSection}>
                        <Text style={styles.sectionTitle}>📌 Événements par région</Text>
                        {regionEntries.map(([region, count]) => (
                            <View key={region} style={styles.regionBar}>
                                <Text style={styles.regionName}>{region}</Text>
                                <View style={styles.barContainer}>
                                    <View
                                        style={[
                                            styles.barFill,
                                            {
                                                width: `${(count / stats.totalEvents) * 100}%`,
                                                backgroundColor: count > 5 ? '#3974F6' : count > 2 ? '#F59E0B' : '#10B981',
                                            },
                                        ]}
                                    />
                                </View>
                                <Text style={styles.regionCount}>{count}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F9FD' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: '#8490A4', fontSize: 15 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F2F6',
    },
    backButton: { padding: 4, marginRight: 12 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#17243D' },
    content: { padding: 16, paddingBottom: 40 },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    statNumber: { fontSize: 24, fontWeight: '700' },
    statLabel: { fontSize: 12, color: '#4A5568', marginTop: 4 },
    statusSection: { marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A202C', marginBottom: 12 },
    statusRow: { flexDirection: 'row', justifyContent: 'space-between' },
    statusCard: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    statusNumber: { fontSize: 28, fontWeight: '700' },
    statusLabel: { fontSize: 13, color: '#4A5568', marginTop: 4 },
    regionSection: { marginBottom: 20 },
    regionBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    regionName: { width: 80, fontSize: 13, color: '#4A5568' },
    barContainer: { flex: 1, height: 8, backgroundColor: '#E8ECF1', borderRadius: 4, marginHorizontal: 8 },
    barFill: { height: 8, borderRadius: 4 },
    regionCount: { fontSize: 14, fontWeight: '600', color: '#1A202C', width: 30, textAlign: 'right' },
});