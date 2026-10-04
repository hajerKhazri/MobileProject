// app/(app)/my-events.jsx
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
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import {
    getAllEvents,
    cloturerEvent,
} from '../../services/apiService';

export default function MyEventsScreen() {
    const router = useRouter();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [username, setUsername] = useState(null);
    const [cloturingId, setCloturingId] = useState(null);

    useEffect(() => {
        loadUserAndEvents();
    }, []);

    // ============================================================
    // CHARGEMENT DES DONNÉES
    // ============================================================
    const loadUserAndEvents = async () => {
        console.log('🔄 Chargement des données...');
        try {
            // ✅ Récupérer le token
            const token = await AsyncStorage.getItem('userToken');
            console.log('🔑 Token présent:', token ? 'OUI' : 'NON');

            // ✅ Récupérer l'utilisateur depuis AsyncStorage
            const userData = await AsyncStorage.getItem('user');
            let currentUser = null;

            if (userData) {
                try {
                    currentUser = JSON.parse(userData);
                    console.log('👤 Utilisateur depuis storage:', currentUser?.username);
                } catch (e) {
                    console.warn('⚠️ Erreur parsing user:', e);
                }
            }

            // ✅ Si pas de user, utiliser le token comme fallback
            if (!currentUser) {
                // Essayer d'extraire le username du token (si c'est un email)
                const emailMatch = token?.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
                if (emailMatch) {
                    currentUser = { username: emailMatch[0] };
                } else {
                    currentUser = { username: 'khazrihajer41@gmail.com' };
                }
                console.log('👤 Utilisateur par défaut:', currentUser?.username);
            }

            setUsername(currentUser?.username);
            await loadEvents(currentUser?.username);

        } catch (error) {
            console.error('❌ Erreur chargement:', error);
            Alert.alert('Erreur', 'Impossible de charger les données');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const loadEvents = async (userName) => {
        try {
            setLoading(true);
            console.log('📡 Chargement des événements pour:', userName);

            // ✅ Récupérer TOUS les événements
            const allEvents = await getAllEvents();
            console.log('📡 Tous les événements:', allEvents?.length);

            if (!allEvents || allEvents.length === 0) {
                console.log('📡 Aucun événement trouvé');
                setEvents([]);
                return;
            }

            // ✅ Filtrer les événements assignés à ce superviseur
            const myEvents = allEvents.filter(event => {
                if (!event.superviseur) return false;

                // Convertir en tableau si c'est une chaîne
                let superviseurs = [];
                if (typeof event.superviseur === 'string') {
                    superviseurs = event.superviseur.split(',').map(s => s.trim());
                } else if (Array.isArray(event.superviseur)) {
                    superviseurs = event.superviseur;
                }

                // Vérifier si l'utilisateur est dans la liste
                return superviseurs.some(sup =>
                    sup.toLowerCase() === userName?.toLowerCase()
                );
            });

            console.log('📡 Événements assignés trouvés:', myEvents.length);
            setEvents(myEvents);

        } catch (error) {
            console.error('❌ Erreur chargement events:', error);
            Alert.alert('Erreur', 'Impossible de charger les événements');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadUserAndEvents();
    };

    // ============================================================
    // CLÔTURER AVEC LOCALISATION
    // ============================================================
    const handleCloturer = async (eventId, eventName) => {
        console.log('=========================================');
        console.log('📍 CLÔTURE ÉVÉNEMENT ID:', eventId);
        console.log('📋 Nom:', eventName);

        // ✅ Vérifier que l'ID est valide
        if (!eventId) {
            if (Platform.OS === 'web') {
                alert('Erreur: ID d\'événement invalide');
            } else {
                Alert.alert('Erreur', 'ID d\'événement invalide');
            }
            return;
        }

        try {
            // ✅ Demander la permission de localisation
            console.log('🔑 Demande de permission...');
            const { status } = await Location.requestForegroundPermissionsAsync();
            console.log('🔑 Status permission:', status);

            if (status !== 'granted') {
                const msg = 'Permission refusée. Nous avons besoin de votre position pour clôturer.';
                if (Platform.OS === 'web') {
                    alert(msg);
                } else {
                    Alert.alert('Permission refusée', msg);
                }
                return;
            }

            // ✅ Demander confirmation
            const confirmMessage = `Voulez-vous clôturer "${eventName}" avec votre position actuelle ?`;
            let userConfirmed = false;

            if (Platform.OS === 'web') {
                // ✅ Web: utiliser window.confirm
                userConfirmed = window.confirm(confirmMessage);
                console.log('✅ Confirmation (web):', userConfirmed);
            } else {
                // ✅ Mobile: utiliser Alert
                userConfirmed = await new Promise((resolve) => {
                    Alert.alert(
                        '📍 Clôturer',
                        confirmMessage,
                        [
                            { text: 'Annuler', style: 'cancel', onPress: () => resolve(false) },
                            { text: 'Clôturer', onPress: () => resolve(true) },
                        ]
                    );
                });
                console.log('✅ Confirmation (mobile):', userConfirmed);
            }

            if (!userConfirmed) {
                console.log('❌ Clôture annulée par l\'utilisateur');
                return;
            }

            // ✅ Démarrer la clôture
            console.log('📍 Début de la clôture...');
            setCloturingId(eventId);

            // ✅ Récupérer la position
            console.log('📍 Récupération de la position...');
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
                timeout: 10000,
            });

            const lat = location.coords.latitude;
            const lng = location.coords.longitude;
            console.log('📍 Position obtenue:', lat, lng);

            // ✅ Appeler l'API
            console.log('📤 Appel de cloturerEvent...');
            const result = await cloturerEvent(eventId, [lat, lng]);
            console.log('✅ Résultat API:', result);

            // ✅ Message de succès
            const successMsg = `✅ Événement "${eventName}" clôturé avec succès !\n📍 ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            if (Platform.OS === 'web') {
                alert(successMsg);
            } else {
                Alert.alert('✅ Succès', successMsg);
            }

            // ✅ Recharger la liste
            await loadEvents(username);

        } catch (error) {
            console.error('❌ Erreur détaillée:', error);
            const errorMsg = error.message || 'Impossible de clôturer l\'événement';
            if (Platform.OS === 'web') {
                alert(`❌ Erreur: ${errorMsg}`);
            } else {
                Alert.alert('❌ Erreur', errorMsg);
            }
        } finally {
            setCloturingId(null);
        }
    };

    // ============================================================
    // AFFICHAGE D'UN ÉVÉNEMENT
    // ============================================================
    const renderEvent = ({ item }) => {
        const isCloturing = cloturingId === item.id;

        // Extraire les superviseurs
        let superviseurs = [];
        if (typeof item.superviseur === 'string') {
            superviseurs = item.superviseur.split(',').map(s => s.trim());
        } else if (Array.isArray(item.superviseur)) {
            superviseurs = item.superviseur;
        }

        // Formater la date
        const formattedDate = item.eventDateTime
            ? new Date(item.eventDateTime).toLocaleString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            })
            : 'Date inconnue';

        return (
            <View style={styles.card}>
                {/* En-tête */}
                <View style={styles.cardHeader}>
                    <Text style={styles.eventName}>{item.name || 'Sans nom'}</Text>
                    <View style={[
                        styles.statusBadge,
                        item.cloture ? styles.statusClosed : styles.statusOpen
                    ]}>
                        <Text style={[
                            styles.statusText,
                            item.cloture ? styles.statusTextClosed : styles.statusTextOpen
                        ]}>
                            {item.cloture ? '✅ Clôturé' : '🔄 En cours'}
                        </Text>
                    </View>
                </View>

                {/* Informations */}
                <View style={styles.cardBody}>
                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                        <Text style={styles.infoText}>{formattedDate}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={16} color="#6B7280" />
                        <Text style={styles.infoText}>{item.region || 'Non définie'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="people-outline" size={16} color="#6B7280" />
                        <Text style={styles.infoText} numberOfLines={1}>
                            {superviseurs.join(', ')}
                        </Text>
                    </View>
                </View>

                {/* Bouton Clôturer */}
                {!item.cloture ? (
                    <TouchableOpacity
                        style={styles.clotureButton}
                        onPress={() => handleCloturer(item.id, item.name)}
                        disabled={isCloturing}
                    >
                        {isCloturing ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <>
                                <Ionicons name="location-outline" size={18} color="#FFFFFF" />
                                <Text style={styles.clotureButtonText}>Clôturer avec ma position</Text>
                            </>
                        )}
                    </TouchableOpacity>
                ) : (
                    // Position si clôturé
                    item.placeClo && item.placeClo.length === 2 && (
                        <View style={styles.positionInfo}>
                            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                            <Text style={styles.positionText}>
                                📍 {item.placeClo[0].toFixed(6)}, {item.placeClo[1].toFixed(6)}
                            </Text>
                        </View>
                    )
                )}
            </View>
        );
    };

    // ============================================================
    // RENDU PRINCIPAL
    // ============================================================
    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Chargement de vos événements...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>📋 Mes événements</Text>
                    <Text style={styles.headerSubtitle}>
                        {username || 'Utilisateur'}
                    </Text>
                </View>
                <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
                    <Ionicons name="refresh-outline" size={22} color="#3B82F6" />
                </TouchableOpacity>
            </View>

            {/* LISTE */}
            <FlatList
                data={events}
                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                renderItem={renderEvent}
                contentContainerStyle={styles.list}
                refreshing={refreshing}
                onRefresh={onRefresh}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="calendar-outline" size={64} color="#D1D5DB" />
                        <Text style={styles.emptyTitle}>Aucun événement</Text>
                        <Text style={styles.emptySubtitle}>
                            Vous n'avez pas encore d'événements assignés
                        </Text>
                        <Text style={styles.emptyHint}>
                            💡 Un administrateur doit vous assigner à un événement
                        </Text>
                    </View>
                }
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    loadingText: {
        marginTop: 12,
        color: '#6B7280',
        fontSize: 15,
        fontWeight: '500',
    },

    // HEADER
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        padding: 4,
    },
    headerCenter: {
        flex: 1,
        marginLeft: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 2,
    },
    refreshButton: {
        padding: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
    },

    // LISTE
    list: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 100,
    },

    // CARTE
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    eventName: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1F2937',
        flex: 1,
        marginRight: 8,
    },

    // STATUT
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusOpen: {
        backgroundColor: '#FEF3C7',
    },
    statusClosed: {
        backgroundColor: '#D1FAE5',
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    statusTextOpen: {
        color: '#D97706',
    },
    statusTextClosed: {
        color: '#065F46',
    },

    // INFORMATIONS
    cardBody: {
        gap: 6,
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#4B5563',
        flex: 1,
    },

    // BOUTON CLÔTURER
    clotureButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3B82F6',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
        marginTop: 4,
    },
    clotureButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },

    // POSITION
    positionInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0FDF4',
        padding: 10,
        borderRadius: 10,
        marginTop: 8,
        gap: 8,
    },
    positionText: {
        fontSize: 12,
        color: '#065F46',
        flex: 1,
    },

    // EMPTY
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
    emptyHint: {
        fontSize: 13,
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 12,
        fontStyle: 'italic',
    },
});