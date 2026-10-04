// app/(app)/event-maps.jsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    TextInput,
    FlatList,
    StatusBar,
    Platform,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAllEvents } from '../../services/apiService';
import { useRouter } from 'expo-router';

// ✅ Mobile : react-native-maps (uniquement sur mobile)
let MapView, Marker;
if (Platform.OS !== 'web') {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
}

export default function EventMapsScreen() {
    const router = useRouter();
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [region, setRegion] = useState({
        latitude: 36.8065,
        longitude: 10.1815,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
    });

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            console.log('📡 Chargement des événements pour la carte...');
            const data = await getAllEvents();
            console.log('📡 Total événements:', data?.length);
            
            // ✅ Filtrer UNIQUEMENT les événements clôturés avec position
            const withLocation = data.filter(e => 
                e.cloture === true && 
                e.placeClo && 
                e.placeClo.length === 2 &&
                e.placeClo[0] !== null &&
                e.placeClo[1] !== null
            );
            
            console.log('📍 Événements avec position:', withLocation.length);
            setEvents(withLocation || []);
            setFilteredEvents(withLocation || []);
            
            // ✅ Centrer sur le premier événement s'il existe
            if (withLocation.length > 0) {
                const first = withLocation[0];
                setSelectedEvent(first);
                setRegion({
                    latitude: first.placeClo[0],
                    longitude: first.placeClo[1],
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                });
                console.log('📍 Centré sur:', first.name, first.placeClo);
            } else {
                console.log('⚠️ Aucun événement clôturé avec position');
            }
        } catch (error) {
            console.error('❌ Erreur chargement events:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filtrage par recherche
    useEffect(() => {
        if (searchText.trim() === '') {
            setFilteredEvents(events);
        } else {
            const filtered = events.filter((item) => {
                const nameMatch = item.name?.toLowerCase().includes(searchText.toLowerCase());
                const regionMatch = item.region?.toLowerCase().includes(searchText.toLowerCase());
                return nameMatch || regionMatch;
            });
            setFilteredEvents(filtered);
        }
    }, [searchText, events]);

    // ✅ Ouvrir Google Maps avec la position EXACTE
    const openGoogleMaps = (lat, lng, name) => {
        if (!lat || !lng) {
            alert('Position non disponible');
            return;
        }
        
        // ✅ URL avec coordonnées exactes - place/ pour pointer directement
        const url = `https://www.google.com/maps/place/${lat},${lng}/@${lat},${lng},17z`;
        console.log('📍 Ouverture Google Maps:', url);
        
        Linking.openURL(url).catch(() => {
            // Fallback si échec
            const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
            Linking.openURL(fallbackUrl);
        });
    };

    // ✅ Ouvrir avec l'événement sélectionné
    const openSelectedInGoogleMaps = () => {
        if (!selectedEvent) {
            alert('Veuillez sélectionner un événement');
            return;
        }
        if (!selectedEvent.placeClo || selectedEvent.placeClo.length !== 2) {
            alert('Cet événement n\'a pas de position');
            return;
        }
        openGoogleMaps(
            selectedEvent.placeClo[0], 
            selectedEvent.placeClo[1], 
            selectedEvent.name
        );
    };

    // ✅ Sélectionner un événement
    const selectEvent = (event) => {
        console.log('📍 Sélection:', event.name);
        setSelectedEvent(event);
        if (event.placeClo && event.placeClo.length === 2) {
            setRegion({
                latitude: event.placeClo[0],
                longitude: event.placeClo[1],
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
            });
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#3974F6" />
                <Text style={styles.loadingText}>Chargement des événements...</Text>
            </View>
        );
    }

    // ============================================================
    // WEB : AFFICHAGE AVEC IFRAME
    // ============================================================
    if (Platform.OS === 'web') {
        // ✅ Construire l'URL de l'iframe avec la position sélectionnée
        const getIframeSrc = () => {
            if (selectedEvent && selectedEvent.placeClo && selectedEvent.placeClo.length === 2) {
                const lat = selectedEvent.placeClo[0];
                const lng = selectedEvent.placeClo[1];
                return `https://www.google.com/maps/embed/v1/place?key=AIzaSyAJpVxpQjJRXa3neG2NzgHOpatNCEQ6shY&q=${lat},${lng}&zoom=17`;
            }
            // Fallback sur Tunis
            return `https://www.google.com/maps/embed/v1/search?key=AIzaSyAJpVxpQjJRXa3neG2NzgHOpatNCEQ6shY&q=Tunis&center=36.8065,10.1815&zoom=12`;
        };

        return (
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#F7F9FD" />
                
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#17243D" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>🗺️ Event Maps</Text>
                    <View style={styles.headerCount}>
                        <Text style={styles.headerCountText}>
                            {filteredEvents.length}
                        </Text>
                    </View>
                </View>

                <View style={styles.searchContainer}>
                    <Ionicons name="search-outline" size={20} color="#8490A4" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Rechercher par nom ou région..."
                        placeholderTextColor="#A5AEC0"
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                    {searchText.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchText('')}>
                            <Ionicons name="close-circle" size={20} color="#8490A4" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* ✅ CARTE IFRAME DYNAMIQUE */}
                <View style={styles.mapContainer}>
                    <iframe
                        src={getIframeSrc()}
                        style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            borderRadius: 16,
                        }}
                        title="Google Maps"
                        allowFullScreen
                    />
                </View>

                {/* ✅ Événement sélectionné */}
                {selectedEvent && (
                    <View style={styles.selectedInfo}>
                        <Ionicons name="location" size={16} color="#3974F6" />
                        <Text style={styles.selectedInfoText} numberOfLines={1}>
                            {selectedEvent.name} - {selectedEvent.region || ''}
                        </Text>
                        <TouchableOpacity
                            onPress={openSelectedInGoogleMaps}
                            style={styles.selectedInfoButton}
                        >
                            <Ionicons name="open-outline" size={16} color="#3974F6" />
                            <Text style={styles.selectedInfoButtonText}>Ouvrir</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* ✅ LISTE DES ÉVÉNEMENTS AVEC BOUTON LOCALISATION */}
                <View style={styles.bottomList}>
                    <Text style={styles.listTitle}>
                        📍 {filteredEvents.length} événement(s) localisé(s)
                    </Text>
                    <FlatList
                        horizontal
                        data={filteredEvents}
                        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                        renderItem={({ item }) => {
                            const isSelected = selectedEvent?.id === item.id;
                            return (
                                <TouchableOpacity
                                    style={[
                                        styles.eventCard,
                                        isSelected && styles.eventCardSelected,
                                    ]}
                                    onPress={() => selectEvent(item)}
                                >
                                    <View style={styles.eventCardHeader}>
                                        <Text style={styles.eventCardName}>{item.name}</Text>
                                        {/* ✅ BOUTON LOCALISATION - Ouvre Google Maps directement */}
                                        <TouchableOpacity
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                if (item.placeClo && item.placeClo.length === 2) {
                                                    openGoogleMaps(
                                                        item.placeClo[0], 
                                                        item.placeClo[1], 
                                                        item.name
                                                    );
                                                }
                                            }}
                                            style={styles.locationButton}
                                        >
                                            <Ionicons name="location-sharp" size={18} color="#3974F6" />
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={styles.eventCardDate}>
                                        📅 {item.eventDateTime ? new Date(item.eventDateTime).toLocaleDateString() : ''}
                                    </Text>
                                    <Text style={styles.eventCardRegion}>
                                        📍 {item.region || ''}
                                    </Text>
                                    {item.placeClo && item.placeClo.length === 2 && (
                                        <Text style={styles.eventCardCoords}>
                                            🎯 {item.placeClo[0].toFixed(5)}, {item.placeClo[1].toFixed(5)}
                                        </Text>
                                    )}
                                    {isSelected && (
                                        <View style={styles.selectedIndicator}>
                                            <Ionicons name="checkmark-circle" size={16} color="#3974F6" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        }}
                        showsHorizontalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="location-outline" size={40} color="#D1D5DB" />
                                <Text style={styles.emptyText}>
                                    Aucun événement clôturé avec position
                                </Text>
                                <Text style={styles.emptySubtext}>
                                    Clôture un événement pour qu'il apparaisse ici
                                </Text>
                            </View>
                        }
                    />
                </View>
            </View>
        );
    }

    // ============================================================
    // MOBILE : REACT-NATIVE-MAPS
    // ============================================================
    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F7F9FD" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#17243D" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>🗺️ Event Maps</Text>
                <View style={styles.headerCount}>
                    <Text style={styles.headerCountText}>
                        {filteredEvents.length}
                    </Text>
                </View>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={20} color="#8490A4" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Rechercher par nom ou région..."
                    placeholderTextColor="#A5AEC0"
                    value={searchText}
                    onChangeText={setSearchText}
                />
                {searchText.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchText('')}>
                        <Ionicons name="close-circle" size={20} color="#8490A4" />
                    </TouchableOpacity>
                )}
            </View>

            <MapView
                style={styles.map}
                region={region}
                onRegionChange={setRegion}
                showsUserLocation={true}
                showsMyLocationButton={true}
                zoomEnabled={true}
                scrollEnabled={true}
                loadingEnabled={true}
            >
                {filteredEvents.map((event) => {
                    const lat = event.placeClo?.[0];
                    const lng = event.placeClo?.[1];
                    if (!lat || !lng) return null;
                    return (
                        <Marker
                            key={event.id}
                            coordinate={{ latitude: lat, longitude: lng }}
                            title={event.name}
                            description={`${event.region || ''} - ${new Date(event.eventDateTime).toLocaleDateString()}`}
                            onPress={() => selectEvent(event)}
                            pinColor={selectedEvent?.id === event.id ? '#3974F6' : '#EF4444'}
                        />
                    );
                })}
            </MapView>

            {/* BOUTON OUVRIR */}
            <TouchableOpacity
                style={[styles.openMapsButton, { position: 'absolute', bottom: 180, right: 16 }]}
                onPress={openSelectedInGoogleMaps}
            >
                <Ionicons name="open-outline" size={20} color="#FFFFFF" />
                <Text style={styles.openMapsButtonText}>Ouvrir</Text>
            </TouchableOpacity>

            <View style={styles.bottomList}>
                <Text style={styles.listTitle}>
                    📍 {filteredEvents.length} événement(s)
                </Text>
                <FlatList
                    horizontal
                    data={filteredEvents}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    renderItem={({ item }) => {
                        const isSelected = selectedEvent?.id === item.id;
                        return (
                            <TouchableOpacity
                                style={[
                                    styles.eventCard,
                                    isSelected && styles.eventCardSelected,
                                ]}
                                onPress={() => selectEvent(item)}
                            >
                                <View style={styles.eventCardHeader}>
                                    <Text style={styles.eventCardName}>{item.name}</Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            if (item.placeClo && item.placeClo.length === 2) {
                                                openGoogleMaps(
                                                    item.placeClo[0], 
                                                    item.placeClo[1], 
                                                    item.name
                                                );
                                            }
                                        }}
                                        style={styles.locationButton}
                                    >
                                        <Ionicons name="location-sharp" size={18} color="#3974F6" />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.eventCardDate}>
                                    {item.eventDateTime ? new Date(item.eventDateTime).toLocaleDateString() : ''}
                                </Text>
                                <Text style={styles.eventCardRegion}>{item.region || ''}</Text>
                            </TouchableOpacity>
                        );
                    }}
                    showsHorizontalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="location-outline" size={40} color="#D1D5DB" />
                            <Text style={styles.emptyText}>Aucun événement localisé</Text>
                        </View>
                    }
                />
            </View>
        </View>
    );
}

// ============================================================
// STYLES
// ============================================================

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
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F2F6',
    },
    backButton: {
        padding: 4,
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#17243D',
        flex: 1,
    },
    headerCount: {
        backgroundColor: '#3974F6',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
    },
    headerCountText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        margin: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#E8ECF1',
        shadowColor: '#25385D',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#17243D',
        marginLeft: 10,
        paddingVertical: 0,
    },
    map: {
        flex: 1,
        marginHorizontal: 12,
        borderRadius: 16,
        minHeight: 350,
    },
    mapContainer: {
        flex: 1,
        marginHorizontal: 12,
        borderRadius: 16,
        overflow: 'hidden',
        minHeight: 350,
        backgroundColor: '#FFFFFF',
    },
    selectedInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EAF1FF',
        marginHorizontal: 12,
        marginTop: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        gap: 6,
    },
    selectedInfoText: {
        flex: 1,
        fontSize: 13,
        color: '#17243D',
        fontWeight: '600',
    },
    selectedInfoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3974F6',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    selectedInfoButtonText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '600',
    },
    openMapsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3974F6',
        marginHorizontal: 12,
        marginTop: 8,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    openMapsButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    bottomList: {
        maxHeight: 180,
        paddingHorizontal: 12,
        paddingBottom: 12,
    },
    listTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4A5568',
        marginBottom: 8,
    },
    eventCard: {
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 16,
        marginRight: 10,
        minWidth: 140,
        borderWidth: 1,
        borderColor: '#F0F2F6',
        shadowColor: '#25385D',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    eventCardSelected: {
        borderColor: '#3974F6',
        borderWidth: 2,
        backgroundColor: '#F0F7FF',
    },
    eventCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    eventCardName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#17243D',
        flex: 1,
    },
    eventCardDate: {
        fontSize: 11,
        color: '#8490A4',
        marginTop: 2,
    },
    eventCardRegion: {
        fontSize: 11,
        color: '#3974F6',
        marginTop: 2,
    },
    eventCardCoords: {
        fontSize: 10,
        color: '#6B7280',
        marginTop: 2,
        fontFamily: 'monospace',
    },
    locationButton: {
        backgroundColor: '#EAF1FF',
        padding: 6,
        borderRadius: 20,
        marginLeft: 4,
    },
    selectedIndicator: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 30,
        minWidth: 200,
    },
    emptyText: {
        fontSize: 14,
        color: '#A0AEC0',
        marginTop: 8,
    },
    emptySubtext: {
        fontSize: 12,
        color: '#C5CDD8',
        marginTop: 4,
    },
});