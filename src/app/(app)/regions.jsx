// app/(app)/regions.jsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
    StatusBar,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getRegions } from '../../services/apiService';

export default function RegionsScreen() {
    const [regions, setRegions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadRegions();
    }, []);

    const loadRegions = async () => {
        try {
            console.log('📡 Chargement des régions...');
            const data = await getRegions();
            console.log('✅ Régions reçues:', data);
            const filtered = data.filter(item => item && item.trim() !== '');
            setRegions(filtered || []);
        } catch (error) {
            console.error('❌ Erreur:', error);
            Alert.alert('Erreur', 'Impossible de charger les régions');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadRegions();
    };

    const renderRegion = ({ item }) => {
        const name = typeof item === 'string' ? item : item.name || 'Sans nom';
        
        return (
            <View style={styles.card}>
                <View style={styles.cardContent}>
                    <View style={styles.iconCircle}>
                        <Text style={styles.iconText}>🌍</Text>
                    </View>
                    <Text style={styles.regionName}>{name}</Text>
                </View>
                {/* ✅ PAS DE BOUTONS ET PAS DE BADGE */}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#3974F6" />
                <Text style={styles.loadingText}>Chargement...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F7F9FD" />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>🌍 Régions</Text>
                <View style={styles.headerCount}>
                    <Text style={styles.headerCountText}>{regions.length}</Text>
                </View>
            </View>

            <FlatList
                data={regions}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderRegion}
                contentContainerStyle={styles.list}
                refreshing={refreshing}
                onRefresh={onRefresh}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>🌍</Text>
                        <Text style={styles.emptyText}>Aucune région</Text>
                    </View>
                }
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F9FD',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: '#8490A4',
        fontSize: 15,
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F2F6',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#17243D',
    },
    headerCount: {
        backgroundColor: '#3974F6',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    headerCountText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },

    list: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 100,
    },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 28,
        padding: 16,
        marginBottom: 14,
        shadowColor: '#25385D',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#F0F2F6',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#EDF3FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    iconText: {
        fontSize: 20,
    },
    regionName: {
        fontSize: 17,
        fontWeight: '600',
        color: '#17243D',
        flex: 1,
    },

    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyIcon: {
        fontSize: 50,
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 16,
        color: '#8490A4',
        marginTop: 4,
    },
});