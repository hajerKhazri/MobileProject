// app/(app)/dashboard.jsx

import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Image,
    StatusBar,
    Dimensions,
    TextInput,
    Platform,
} from 'react-native';

import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
    getAllSuperviseurs,
    getAllEvents,
    getRegions,
    getCurrentUser,
} from '../../services/apiService';

const { width, height } = Dimensions.get('window');

const COLORS = {
    bg: '#F7F9FD',
    white: '#FFFFFF',
    textDark: '#1A2D50',
    textMain: '#4A5E80',
    textLight: '#8D9CB5',
    primary: '#3974F6',
    primaryTitle: '#114BCC',
    cardIconBg: '#E1E9F8',
    green: '#10B981',
    greenLight: '#D1FAE5',
    orange: '#F59E0B',
    orangeLight: '#FEF3C7',
    red: '#EF4444',
    redLight: '#FEE2E2',
    border: '#DDE4F0',
};

export default function DashboardScreen() {

    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [user, setUser] = useState(null);

    const [stats, setStats] = useState({
        superviseurs: 0,
        events: 0,
        regions: 0,
        clotures: 0,
        enCours: 0,
        total: 0,
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('Semaine');
    const [allEvents, setAllEvents] = useState([]);

    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = today.toLocaleDateString('fr-FR', options);

    // ============================================================
    // FILTRES
    // ============================================================

    const filterEvents = (events, filter) => {
        const now = new Date();
        switch (filter) {
            case 'Aujourd\'hui':
                return events.filter(e => {
                    const d = new Date(e.eventDateTime);
                    return d.toDateString() === now.toDateString();
                });
            case 'Semaine':
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - now.getDay());
                return events.filter(e => {
                    const d = new Date(e.eventDateTime);
                    return d >= weekStart;
                });
            case 'Mois':
                return events.filter(e => {
                    const d = new Date(e.eventDateTime);
                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                });
            case 'Zone Nord':
                return events.filter(e => ['Tunis', 'Ariana', 'Ben Arous', 'La Marsa'].includes(e.region));
            case 'Actifs':
                return events.filter(e => e.cloture === false);
            default:
                return events;
        }
    };

    // ============================================================
    // RECHARGEMENT
    // ============================================================

    useFocusEffect(
        useCallback(() => {
            console.log('📡 Dashboard affiché → rechargement...');
            loadData();
        }, [])
    );

   const loadData = async () => {
    console.log('🔄 Chargement des données dashboard...');
    try {
        const token = await AsyncStorage.getItem('userToken');
        console.log('🔑 Token présent:', token ? '✅ OUI' : '❌ NON');
        
        if (!token) {
            console.log('❌ Pas de token, redirection vers login');
            router.replace('/login');
            return;
        }

        // ✅ getCurrentUser retourne null si échec
        const userData = await getCurrentUser();
        console.log('👤 Utilisateur:', userData?.username || 'Utilisateur par défaut');
        
        const [superviseurs, events, regions] = await Promise.all([
            getAllSuperviseurs().catch((e) => { 
                console.error('❌ Erreur getAllSuperviseurs:', e); 
                return []; 
            }),
            getAllEvents().catch((e) => { 
                console.error('❌ Erreur getAllEvents:', e); 
                return []; 
            }),
            getRegions().catch((e) => { 
                console.error('❌ Erreur getRegions:', e); 
                return []; 
            }),
        ]);

        const filteredEvents = filterEvents(events, activeFilter);
        const clotures = filteredEvents.filter(e => e.cloture === true).length;
        const enCours = filteredEvents.filter(e => e.cloture === false).length;

        console.log('📋 Superviseurs:', superviseurs?.length || 0);
        console.log('📅 Événements:', filteredEvents.length);
        console.log('🌍 Régions:', regions?.length || 0);

        setUser(userData || { username: 'Utilisateur' });
        setAllEvents(events);
        setStats({
            superviseurs: superviseurs?.length || 0,
            events: filteredEvents.length,
            regions: regions?.length || 0,
            clotures: clotures,
            enCours: enCours,
            total: (superviseurs?.length || 0) + filteredEvents.length + (regions?.length || 0),
        });
    } catch (error) {
        console.error('💥 Erreur loadData:', error);
    } finally {
        setLoading(false);
        setRefreshing(false);
    }
};
    // ✅ Recharger quand le filtre change
    useEffect(() => {
        if (!loading && allEvents.length > 0) {
            const filteredEvents = filterEvents(allEvents, activeFilter);
            const clotures = filteredEvents.filter(e => e.cloture === true).length;
            const enCours = filteredEvents.filter(e => e.cloture === false).length;
            setStats(prev => ({
                ...prev,
                events: filteredEvents.length,
                clotures: clotures,
                enCours: enCours,
                total: prev.superviseurs + filteredEvents.length + prev.regions,
            }));
        }
    }, [activeFilter, allEvents]);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem('userToken');
        router.replace('/');
    };

    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {
        return (
            <View style={styles.loadingScreen}>
                <View style={styles.loadingCircle}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
                <Text style={styles.loadingText}>Chargement de votre espace...</Text>
            </View>
        );
    }

    const userName = user?.username
        ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
        : 'Utilisateur';

    const filters = ['Aujourd\'hui', 'Semaine', 'Mois', 'Zone Nord', 'Actifs'];

    // ============================================================
    // RETURN
    // ============================================================

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

            {/* Cercles décoratifs */}
            <View style={styles.backgroundCircle1} />
            <View style={styles.backgroundCircle2} />
            <View style={styles.backgroundCircle3} />
            <View style={styles.backgroundCircle4} />
            <View style={styles.backgroundSmallCircle1} />
            <View style={styles.backgroundSmallCircle2} />

            {/* ===== HEADER FIXE ===== */}
            <View style={styles.fixedHeader}>
                <View style={styles.headerTopRow}>
                    <View>
                        <Text style={styles.welcomeDate}>{dateString}</Text>
                        <Text style={styles.welcomeGreeting}>Salut, {userName} 👋</Text>
                    </View>
                    <TouchableOpacity style={styles.profileButton}>
                        <Image
                            source={{ uri: `https://ui-avatars.com/api/?name=${userName}&background=1A2D50&color=fff` }}
                            style={styles.avatarMini}
                        />
                    </TouchableOpacity>
                </View>

                {/* Barre de recherche */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search-outline" size={20} color={COLORS.textLight} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Rechercher un événement, superviseur..."
                        placeholderTextColor={COLORS.textLight}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={18} color={COLORS.textLight} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* ===== SCROLLVIEW ===== */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
                contentContainerStyle={styles.scrollContent}
            >
                {/* ===== FILTRES ===== */}
                <View style={styles.filtersSection}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
                        {filters.map((filter) => (
                            <TouchableOpacity
                                key={filter}
                                style={[styles.filterBubble, activeFilter === filter && styles.filterBubbleActive]}
                                onPress={() => setActiveFilter(filter)}
                            >
                                <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
                                    {filter}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={styles.allFiltersButton}>
                            <Ionicons name="options-outline" size={16} color={COLORS.primary} />
                            <Text style={styles.allFiltersText}>Plus</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {/* ===== STATISTIQUES EN CERCLES ===== */}
                <View style={styles.statsGrid}>
                    <View style={styles.statsRow}>
                        {/* Événements */}
                        <TouchableOpacity style={styles.statCircle} onPress={() => router.push('/(app)/events')} activeOpacity={0.85}>
                            <View style={[styles.circle, styles.circleBlue]}>
                                <Ionicons name="calendar" size={32} color={COLORS.primary} />
                                <Text style={styles.circleNumber}>{stats.events}</Text>
                            </View>
                            <Text style={styles.circleLabel}>Événements</Text>
                        </TouchableOpacity>

                        {/* Superviseurs */}
                        <TouchableOpacity style={styles.statCircle} onPress={() => router.push('/(app)/superviseurs')} activeOpacity={0.85}>
                            <View style={[styles.circle, styles.circleGreen]}>
                                <Ionicons name="people" size={32} color={COLORS.green} />
                                <Text style={styles.circleNumber}>{stats.superviseurs}</Text>
                            </View>
                            <Text style={styles.circleLabel}>Superviseurs</Text>
                        </TouchableOpacity>

                        {/* Régions */}
                        <TouchableOpacity style={styles.statCircle} onPress={() => router.push('/(app)/regions')} activeOpacity={0.85}>
                            <View style={[styles.circle, styles.circleOrange]}>
                                <MaterialCommunityIcons name="map-marker-radius" size={32} color={COLORS.orange} />
                                <Text style={styles.circleNumber}>{stats.regions}</Text>
                            </View>
                            <Text style={styles.circleLabel}>Régions</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ===== STATISTIQUES SUPPLÉMENTAIRES ===== */}
                <View style={styles.extraStatsRow}>
                    <View style={styles.extraStatCard}>
                        <Text style={styles.extraStatNumber}>{stats.clotures}</Text>
                        <Text style={styles.extraStatLabel}>✅ Clôturés</Text>
                    </View>
                    <View style={styles.extraStatCard}>
                        <Text style={styles.extraStatNumber}>{stats.enCours}</Text>
                        <Text style={styles.extraStatLabel}>🔄 En cours</Text>
                    </View>
                    <View style={styles.extraStatCard}>
                        <Text style={styles.extraStatNumber}>{stats.total}</Text>
                        <Text style={styles.extraStatLabel}>📊 Total</Text>
                    </View>
                </View>

                {/* ===== ACTIONS RAPIDES ===== */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>⚡ Actions rapides</Text>
                </View>

                <View style={styles.quickActionsRow}>
                    

                    <TouchableOpacity style={styles.quickActionItem} onPress={() => router.push('/(app)/statistiques')}>
                        <View style={[styles.quickActionIcon, { backgroundColor: '#F59E0B' + '15' }]}>
                            <Ionicons name="stats-chart" size={24} color="#F59E0B" />
                        </View>
                        <Text style={styles.quickActionLabel}>Statistiques</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.quickActionItem} onPress={() => router.push('/(app)/my-events')}>
                        <View style={[styles.quickActionIcon, { backgroundColor: '#EC4899' + '15' }]}>
                            <Ionicons name="list-circle" size={24} color="#EC4899" />
                        </View>
                        <Text style={styles.quickActionLabel}>Mes Events</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.quickActionItem} onPress={() => router.push('/(app)/event-maps')}>
                        <View style={[styles.quickActionIcon, { backgroundColor: '#10B981' + '15' }]}>
                            <Ionicons name="map" size={24} color="#10B981" />
                        </View>
                        <Text style={styles.quickActionLabel}>Event Maps</Text>
                    </TouchableOpacity>
                </View>

                {/* ===== DÉCONNEXION ===== */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color={COLORS.red} />
                    <Text style={styles.logoutText}>Se déconnecter</Text>
                </TouchableOpacity>

                <View style={styles.bottomSpace} />
            </ScrollView>

            {/* ===== BARRE DE NAVIGATION EN BAS ===== */}
            <View style={styles.bottomTabNav}>
                <TabItem icon="home" label="Accueil" active />
                <TabItem icon="calendar-outline" label="Events" onPress={() => router.push('/(app)/events')} />
                <TabItem icon="location-outline" label="Localisations" onPress={() => router.push('/(app)/localisations')} />
                <TabItem icon="people-outline" label="Regions" onPress={() => router.push('/(app)/regions')} />
            </View>
        </SafeAreaView>
    );
}

// ============================================================
// TAB ITEM
// ============================================================

const TabItem = ({ icon, label, active, onPress }) => (
    <TouchableOpacity style={styles.tabItem} onPress={onPress}>
        <View style={[styles.tabCircle, active && styles.tabCircleActive]}>
            <Ionicons name={icon} size={22} color={active ? COLORS.primary : COLORS.textLight} />
        </View>
        <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </TouchableOpacity>
);

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },

    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 160,
        paddingBottom: 100,
    },

    // ===== CERCLES D'ARRIÈRE-PLAN =====
    backgroundCircle1: {
        position: 'absolute',
        width: width * 0.95,
        height: width * 0.95,
        borderRadius: width * 0.475,
        backgroundColor: '#EAF1FF',
        top: -width * 0.55,
        right: -width * 0.38,
        opacity: 0.75,
    },
    backgroundCircle2: {
        position: 'absolute',
        width: width * 0.75,
        height: width * 0.75,
        borderRadius: width * 0.375,
        backgroundColor: '#EAFBF5',
        top: height * 0.28,
        left: -width * 0.48,
        opacity: 0.65,
    },
    backgroundCircle3: {
        position: 'absolute',
        width: width * 0.85,
        height: width * 0.85,
        borderRadius: width * 0.425,
        backgroundColor: '#FFF4E7',
        top: height * 0.58,
        right: -width * 0.55,
        opacity: 0.45,
    },
    backgroundCircle4: {
        position: 'absolute',
        width: width * 0.55,
        height: width * 0.55,
        borderRadius: width * 0.275,
        backgroundColor: '#EEF3FF',
        bottom: -width * 0.15,
        left: -width * 0.25,
        opacity: 0.7,
    },
    backgroundSmallCircle1: {
        position: 'absolute',
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#3974F6',
        top: 235,
        right: 35,
        opacity: 0.25,
    },
    backgroundSmallCircle2: {
        position: 'absolute',
        width: 11,
        height: 11,
        borderRadius: 6,
        backgroundColor: '#10B981',
        top: 390,
        left: 35,
        opacity: 0.35,
    },

    // ===== LOADING =====
    loadingScreen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.bg,
    },
    loadingCircle: {
        width: 95,
        height: 95,
        borderRadius: 48,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
    },
    loadingText: {
        marginTop: 10,
        color: COLORS.textMain,
        fontSize: 16,
    },

    // ===== HEADER =====
    fixedHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
        zIndex: 10,
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 15,
    },
    headerTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    welcomeDate: {
        fontSize: 13,
        color: COLORS.textLight,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    welcomeGreeting: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.textDark,
        marginTop: 2,
    },
    profileButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 3,
        borderColor: COLORS.white,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 7,
    },
    avatarMini: {
        width: '100%',
        height: '100%',
        borderRadius: 22,
    },

    // ===== SEARCH =====
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 25,
        paddingHorizontal: 16,
        height: 48,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: COLORS.textDark,
        height: '100%',
        marginLeft: 10,
    },

    // ===== FILTRES =====
    filtersSection: {
        marginVertical: 15,
    },
    filtersScroll: {
        alignItems: 'center',
        paddingRight: 10,
    },
    filterBubble: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        marginRight: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    filterBubbleActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    filterText: {
        fontSize: 13,
        color: COLORS.textMain,
        fontWeight: '600',
    },
    filterTextActive: {
        color: COLORS.white,
    },
    allFiltersButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.cardIconBg,
    },
    allFiltersText: {
        fontSize: 13,
        color: COLORS.primary,
        fontWeight: '700',
        marginLeft: 5,
    },

    // ===== STATISTIQUES =====
    statsGrid: {
        marginBottom: 15,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
    },
    statCircle: {
        alignItems: 'center',
        flex: 1,
    },
    circle: {
        width: 130,
        height: 130,
        borderRadius: 65,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
        borderWidth: 3,
        marginBottom: 10,
    },
    circleBlue: {
        backgroundColor: '#EAF1FF',
        borderColor: '#D9E5FF',
    },
    circleGreen: {
        backgroundColor: '#EAFBF3',
        borderColor: '#D6F4E5',
    },
    circleOrange: {
        backgroundColor: '#FFF4E7',
        borderColor: '#FFE6C8',
    },
    circleNumber: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.textDark,
        marginTop: 2,
    },
    circleLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textMain,
        textAlign: 'center',
    },

    // ===== STATISTIQUES SUPPLÉMENTAIRES =====
    extraStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        paddingHorizontal: 4,
    },
    extraStatCard: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 16,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    extraStatNumber: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.textDark,
    },
    extraStatLabel: {
        fontSize: 11,
        color: COLORS.textLight,
        marginTop: 4,
        textAlign: 'center',
    },

    // ===== ACTIONS RAPIDES =====
    sectionHeader: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textDark,
    },
    quickActionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        backgroundColor: COLORS.white,
        borderRadius: 25,
        padding: 15,
        marginBottom: 25,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
    },
    quickActionItem: {
        alignItems: 'center',
        flex: 1,
        minWidth: '18%',
        marginVertical: 4,
    },
    quickActionIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    quickActionLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.textMain,
        textAlign: 'center',
    },

    // ===== LOGOUT =====
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 30,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.redLight,
        marginBottom: 20,
        gap: 10,
    },
    logoutText: {
        color: COLORS.red,
        fontSize: 15,
        fontWeight: '700',
    },
    bottomSpace: {
        height: 20,
    },

    // ===== BOTTOM NAVIGATION =====
    bottomTabNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 75,
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 65,
    },
    tabCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
    },
    tabCircleActive: {
        backgroundColor: '#EAF1FF',
    },
    tabLabel: {
        fontSize: 10,
        color: COLORS.textLight,
        fontWeight: '600',
        marginTop: 2,
    },
    tabLabelActive: {
        color: COLORS.primary,
        fontWeight: '700',
    },
});