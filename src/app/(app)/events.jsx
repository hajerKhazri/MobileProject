// app/(app)/events.jsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
    Modal,
    TextInput,
    ScrollView,
    StatusBar,
    SafeAreaView,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    getAllEvents,
    createEvent,
    deleteEvent,
    updateEvent,
    getRegions,
    getAllSuperviseurs,
} from '../../services/apiService';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

export default function EventsScreen() {
    const router = useRouter();
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchText, setSearchText] = useState('');

    const [regions, setRegions] = useState([]);
    const [superviseurs, setSuperviseurs] = useState([]);

    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [name, setName] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedSuperviseurs, setSelectedSuperviseurs] = useState([]);
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [showRegionDropdown, setShowRegionDropdown] = useState(false);
    const [showSuperviseurDropdown, setShowSuperviseurDropdown] = useState(false);

    useEffect(() => {
        loadEvents();
        loadDropdownData();
    }, []);

    // ============================================================
    // CHARGEMENT DES DONNÉES
    // ============================================================
    const loadEvents = async () => {
        try {
            console.log('📡 Chargement des événements...');
            const data = await getAllEvents();
            console.log('✅ Événements reçus:', data?.length || 0);
            setEvents(data || []);
            setFilteredEvents(data || []);
        } catch (error) {
            console.error('❌ Erreur chargement events:', error);
            Alert.alert('Erreur', 'Impossible de charger les événements');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const loadDropdownData = async () => {
        try {
            const supData = await getAllSuperviseurs();
            const uniqueSup = [...new Set(supData || [])];
            setSuperviseurs(uniqueSup);
            const regionsData = await getRegions();
            setRegions(regionsData || []);
        } catch (error) {
            console.error('❌ Erreur chargement dropdowns:', error);
        }
    };

    useEffect(() => {
        if (searchText.trim() === '') {
            setFilteredEvents(events);
        } else {
            const filtered = events.filter((item) =>
                item.name?.toLowerCase().includes(searchText.toLowerCase())
            );
            setFilteredEvents(filtered);
        }
    }, [searchText, events]);

    const onRefresh = () => {
        setRefreshing(true);
        loadEvents();
    };

    // ============================================================
    // DELETE - CORRIGÉ AVEC LOGS
    // ============================================================
    const handleDelete = (id, name) => {
        console.log('=========================================');
        console.log('🗑️ handleDelete - ID reçu:', id);
        console.log('🗑️ handleDelete - Type de ID:', typeof id);
        console.log('🗑️ handleDelete - Nom:', name);
        
        if (!id) {
            Alert.alert('Erreur', 'ID de l\'événement invalide');
            return;
        }

        // ✅ Vérifier que l'ID est un nombre valide
        const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
        console.log('🗑️ handleDelete - ID converti:', numericId);
        
        if (isNaN(numericId) || numericId <= 0) {
            Alert.alert('Erreur', `ID invalide: ${id}`);
            return;
        }

        Alert.alert(
            '🗑️ Supprimer',
            `Voulez-vous vraiment supprimer "${name}" ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            console.log('🗑️ === DÉBUT DE LA SUPPRESSION ===');
                            console.log('🗑️ Appel de deleteEvent avec ID:', numericId);
                            
                            // ✅ Appeler deleteEvent
                            const result = await deleteEvent(numericId);
                            console.log('🗑️ Résultat de deleteEvent:', result);
                            
                            Alert.alert('✅ Succès', `Événement "${name}" supprimé avec succès`);
                            
                            // ✅ Recharger la liste
                            console.log('🗑️ Rechargement des événements...');
                            await loadEvents();
                            console.log('🗑️ Rechargement terminé');
                            
                        } catch (error) {
                            console.error('❌ Erreur dans handleDelete:', error);
                            console.error('❌ Message:', error.message);
                            console.error('❌ Stack:', error.stack);
                            Alert.alert('❌ Erreur', error.message || 'Impossible de supprimer l\'événement');
                        }
                    },
                },
            ]
        );
    };

    // ============================================================
    // OPEN MODAL
    // ============================================================
    const openCreateModal = () => {
        setIsEditing(false);
        setEditingId(null);
        setName('');
        setSelectedRegion('');
        setSelectedSuperviseurs([]);
        setDate(new Date());
        setModalVisible(true);
    };

    const openEditModal = (event) => {
        if (!event || !event.id) {
            Alert.alert('Erreur', 'Événement invalide');
            return;
        }
        setIsEditing(true);
        setEditingId(event.id);
        setName(event.name || '');
        setSelectedRegion(event.region || '');
        setSelectedSuperviseurs(event.superviseur || []);
        setDate(new Date(event.eventDateTime));
        setModalVisible(true);
    };

    // ============================================================
    // SUBMIT
    // ============================================================
    const handleSubmit = async () => {
        if (!name.trim()) {
            Alert.alert('Erreur', 'Le nom est obligatoire');
            return;
        }
        if (!selectedRegion) {
            Alert.alert('Erreur', 'Veuillez sélectionner une région');
            return;
        }
        if (selectedSuperviseurs.length === 0) {
            Alert.alert('Erreur', 'Veuillez sélectionner au moins un superviseur');
            return;
        }

        setSubmitting(true);
        try {
            const eventData = {
                name: name.trim(),
                region: selectedRegion,
                superviseur: selectedSuperviseurs,
                eventDateTime: date.toISOString(),
                visitTypes: ['Visite'],
            };

            console.log('📤 Envoi des données:', eventData);

            if (isEditing) {
                await updateEvent(editingId, eventData);
                Alert.alert('✅ Succès', 'Événement modifié avec succès !');
            } else {
                await createEvent(eventData);
                Alert.alert('✅ Succès', 'Événement créé avec succès !');
            }

            setModalVisible(false);
            await loadEvents();
        } catch (error) {
            console.error('❌ Erreur soumission:', error);
            Alert.alert('❌ Erreur', error.message || 'Échec de l\'opération');
        } finally {
            setSubmitting(false);
        }
    };

    const toggleSuperviseur = (sup) => {
        setSelectedSuperviseurs((prev) =>
            prev.includes(sup) ? prev.filter((s) => s !== sup) : [...prev, sup]
        );
    };

    // ============================================================
    // RENDER EVENT
    // ============================================================
    const renderEvent = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.cardTitleContainer}>
                    <Text style={styles.eventName}>{item.name || 'Sans nom'}</Text>
                    <View style={[styles.statusBadge, item.cloture ? styles.statusClosed : styles.statusOpen]}>
                        <Text style={styles.statusText}>
                            {item.cloture ? 'Clôturé' : 'En cours'}
                        </Text>
                    </View>
                </View>
            </View>
            
            <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                    <Text style={styles.infoText}>
                        {item.eventDateTime
                            ? new Date(item.eventDateTime).toLocaleString('fr-FR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                              })
                            : 'Date inconnue'}
                    </Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={16} color="#6B7280" />
                    <Text style={styles.infoText}>{item.region || 'Non définie'}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="people-outline" size={16} color="#6B7280" />
                    <Text style={styles.infoText} numberOfLines={1}>
                        {Array.isArray(item.superviseur)
                            ? item.superviseur.join(', ')
                            : item.superviseur || 'Aucun'}
                    </Text>
                </View>
            </View>

            <View style={styles.cardActions}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => openEditModal(item)}
                >
                    <Ionicons name="create-outline" size={16} color="#3B82F6" />
                    <Text style={styles.editText}>Modifier</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(item.id, item.name)}
                >
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    <Text style={styles.deleteText}>Supprimer</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Chargement des événements...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>📋 Événements</Text>
                    <Text style={styles.headerSubtitle}>
                        {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''}
                    </Text>
                </View>
                <TouchableOpacity style={styles.headerButton} onPress={onRefresh}>
                    <Ionicons name="refresh-outline" size={24} color="#3B82F6" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={20} color="#9CA3AF" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Rechercher un événement..."
                    placeholderTextColor="#9CA3AF"
                    value={searchText}
                    onChangeText={setSearchText}
                />
                {searchText.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchText('')}>
                        <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={filteredEvents}
                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                renderItem={renderEvent}
                contentContainerStyle={styles.list}
                refreshing={refreshing}
                onRefresh={onRefresh}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconContainer}>
                            <Ionicons name="calendar-outline" size={64} color="#D1D5DB" />
                        </View>
                        <Text style={styles.emptyTitle}>Aucun événement</Text>
                        <Text style={styles.emptySubtitle}>
                            Créez votre premier événement en cliquant sur le bouton +
                        </Text>
                        <TouchableOpacity style={styles.emptyButton} onPress={openCreateModal}>
                            <Ionicons name="add" size={20} color="#FFFFFF" />
                            <Text style={styles.emptyButtonText}>Créer un événement</Text>
                        </TouchableOpacity>
                    </View>
                }
                showsVerticalScrollIndicator={false}
            />

            <TouchableOpacity style={styles.fab} activeOpacity={0.8} onPress={openCreateModal}>
                <Ionicons name="add" size={32} color="#FFFFFF" />
            </TouchableOpacity>

            {/* ============================================================
                MODAL DE CRÉATION
            ============================================================ */}
            <Modal
                animationType="slide"
                transparent
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {isEditing ? '✏️ Modifier' : '📝 Nouvel événement'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* NOM */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Nom de l'événement *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Ex: Visite de terrain"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>

                            {/* RÉGION */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Région *</Text>
                                <TouchableOpacity
                                    style={styles.dropdownButton}
                                    onPress={() => setShowRegionDropdown(!showRegionDropdown)}
                                >
                                    <Text
                                        style={
                                            selectedRegion
                                                ? styles.dropdownText
                                                : styles.dropdownPlaceholder
                                        }
                                    >
                                        {selectedRegion || 'Sélectionner une région'}
                                    </Text>
                                    <Ionicons 
                                        name={showRegionDropdown ? 'chevron-up' : 'chevron-down'} 
                                        size={20} 
                                        color="#9CA3AF" 
                                    />
                                </TouchableOpacity>
                                {showRegionDropdown && (
                                    <View style={styles.dropdownList}>
                                        {regions.map((region) => (
                                            <TouchableOpacity
                                                key={region}
                                                style={[
                                                    styles.dropdownItem,
                                                    selectedRegion === region && styles.dropdownItemSelected,
                                                ]}
                                                onPress={() => {
                                                    setSelectedRegion(region);
                                                    setShowRegionDropdown(false);
                                                }}
                                            >
                                                <Text
                                                    style={[
                                                        styles.dropdownItemText,
                                                        selectedRegion === region && styles.dropdownItemTextSelected,
                                                    ]}
                                                >
                                                    {region}
                                                </Text>
                                                {selectedRegion === region && (
                                                    <Ionicons name="checkmark" size={20} color="#3B82F6" />
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            {/* SUPERVISEURS */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Superviseurs *</Text>
                                <TouchableOpacity
                                    style={styles.dropdownButton}
                                    onPress={() => setShowSuperviseurDropdown(!showSuperviseurDropdown)}
                                >
                                    <Text
                                        style={
                                            selectedSuperviseurs.length > 0
                                                ? styles.dropdownText
                                                : styles.dropdownPlaceholder
                                        }
                                    >
                                        {selectedSuperviseurs.length > 0
                                            ? `${selectedSuperviseurs.length} superviseur(s) sélectionné(s)`
                                            : 'Sélectionner des superviseurs'}
                                    </Text>
                                    <Ionicons 
                                        name={showSuperviseurDropdown ? 'chevron-up' : 'chevron-down'} 
                                        size={20} 
                                        color="#9CA3AF" 
                                    />
                                </TouchableOpacity>

                                {showSuperviseurDropdown && (
                                    <View style={styles.superviseurDropdownList}>
                                        <View style={styles.superviseurDropdownHeader}>
                                            <Text style={styles.superviseurDropdownTitle}>
                                                {selectedSuperviseurs.length} superviseur(s) sélectionné(s)
                                            </Text>
                                            <TouchableOpacity
                                                onPress={() => setShowSuperviseurDropdown(false)}
                                            >
                                                <Ionicons name="close" size={20} color="#9CA3AF" />
                                            </TouchableOpacity>
                                        </View>
                                        {superviseurs.map((sup) => {
                                            const isSelected = selectedSuperviseurs.includes(sup);
                                            return (
                                                <TouchableOpacity
                                                    key={sup}
                                                    style={[
                                                        styles.superviseurItem,
                                                        isSelected && styles.superviseurItemSelected,
                                                    ]}
                                                    onPress={() => toggleSuperviseur(sup)}
                                                >
                                                    <View style={styles.superviseurItemContent}>
                                                        <View style={styles.superviseurCheckbox}>
                                                            {isSelected ? (
                                                                <Ionicons name="checkbox" size={22} color="#3B82F6" />
                                                            ) : (
                                                                <Ionicons name="square-outline" size={22} color="#9CA3AF" />
                                                            )}
                                                        </View>
                                                        <Text
                                                            style={[
                                                                styles.superviseurItemText,
                                                                isSelected && styles.superviseurItemTextSelected,
                                                            ]}
                                                        >
                                                            {sup}
                                                        </Text>
                                                    </View>
                                                    {isSelected && (
                                                        <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
                                                    )}
                                                </TouchableOpacity>
                                            );
                                        })}
                                        {superviseurs.length === 0 && (
                                            <View style={styles.superviseurEmpty}>
                                                <Text style={styles.superviseurEmptyText}>
                                                    Aucun superviseur disponible
                                                </Text>
                                            </View>
                                        )}
                                        <TouchableOpacity
                                            style={styles.superviseurValidateButton}
                                            onPress={() => setShowSuperviseurDropdown(false)}
                                        >
                                            <Text style={styles.superviseurValidateText}>Valider</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>

                            {/* DATE ET HEURE */}
                            <View style={styles.row}>
                                <View style={[styles.formGroup, styles.halfWidth]}>
                                    <Text style={styles.label}>Date *</Text>
                                    <TouchableOpacity
                                        style={styles.dateButton}
                                        onPress={() => setShowDatePicker(true)}
                                    >
                                        <Ionicons name="calendar-outline" size={20} color="#3B82F6" />
                                        <Text style={styles.dateText}>
                                            {date.toLocaleDateString('fr-FR', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                            })}
                                        </Text>
                                    </TouchableOpacity>
                                    {showDatePicker && (
                                        <DateTimePicker
                                            value={date}
                                            mode="date"
                                            display="default"
                                            onChange={(e, d) => {
                                                setShowDatePicker(false);
                                                if (d) {
                                                    const newDate = new Date(d);
                                                    newDate.setHours(date.getHours());
                                                    newDate.setMinutes(date.getMinutes());
                                                    setDate(newDate);
                                                }
                                            }}
                                        />
                                    )}
                                </View>

                                <View style={[styles.formGroup, styles.halfWidth]}>
                                    <Text style={styles.label}>Heure *</Text>
                                    <TouchableOpacity
                                        style={styles.dateButton}
                                        onPress={() => setShowTimePicker(true)}
                                    >
                                        <Ionicons name="time-outline" size={20} color="#3B82F6" />
                                        <Text style={styles.dateText}>
                                            {date.toLocaleTimeString('fr-FR', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </Text>
                                    </TouchableOpacity>
                                    {showTimePicker && (
                                        <DateTimePicker
                                            value={date}
                                            mode="time"
                                            display="default"
                                            onChange={(e, d) => {
                                                setShowTimePicker(false);
                                                if (d) {
                                                    const newDate = new Date(date);
                                                    newDate.setHours(d.getHours());
                                                    newDate.setMinutes(d.getMinutes());
                                                    setDate(newDate);
                                                }
                                            }}
                                        />
                                    )}
                                </View>
                            </View>

                            {/* BOUTONS */}
                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelModal]}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.cancelText}>Annuler</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.submitModal]}
                                    onPress={handleSubmit}
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                    ) : (
                                        <Text style={styles.submitText}>
                                            {isEditing ? 'Modifier' : 'Créer'}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1F2937',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },
    headerButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#1F2937',
        marginLeft: 10,
        paddingVertical: 0,
    },
    list: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 100,
    },

    // Card
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
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    cardTitleContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    eventName: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1F2937',
        flex: 1,
        marginRight: 8,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusOpen: {
        backgroundColor: '#D1FAE5',
    },
    statusClosed: {
        backgroundColor: '#FEE2E2',
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#065F46',
    },
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

    cardActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 12,
        gap: 10,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 30,
        gap: 6,
    },
    editButton: {
        backgroundColor: '#EFF6FF',
    },
    deleteButton: {
        backgroundColor: '#FEF2F2',
    },
    editText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#3B82F6',
    },
    deleteText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#EF4444',
    },

    // FAB
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },

    // Empty
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 32,
    },
    emptyIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    emptyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3B82F6',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 30,
        gap: 8,
    },
    emptyButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 15,
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1F2937',
    },
    formGroup: {
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfWidth: {
        flex: 1,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4B5563',
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#F9FAFB',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        fontSize: 15,
        color: '#1F2937',
    },

    dropdownButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    dropdownText: {
        fontSize: 15,
        color: '#1F2937',
    },
    dropdownPlaceholder: {
        fontSize: 15,
        color: '#9CA3AF',
    },
    dropdownList: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginTop: 4,
        maxHeight: 150,
    },
    dropdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    dropdownItemSelected: {
        backgroundColor: '#EFF6FF',
    },
    dropdownItemText: {
        fontSize: 14,
        color: '#1F2937',
    },
    dropdownItemTextSelected: {
        color: '#3B82F6',
        fontWeight: '500',
    },

    superviseurDropdownList: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginTop: 4,
        maxHeight: 260,
        padding: 8,
    },
    superviseurDropdownHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    superviseurDropdownTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4B5563',
    },
    superviseurItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        marginVertical: 2,
    },
    superviseurItemSelected: {
        backgroundColor: '#EFF6FF',
    },
    superviseurItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    superviseurCheckbox: {
        marginRight: 12,
    },
    superviseurItemText: {
        fontSize: 15,
        color: '#1F2937',
    },
    superviseurItemTextSelected: {
        color: '#3B82F6',
        fontWeight: '500',
    },
    superviseurEmpty: {
        padding: 20,
        alignItems: 'center',
    },
    superviseurEmptyText: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    superviseurValidateButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 6,
    },
    superviseurValidateText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },

    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#F9FAFB',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    dateText: {
        fontSize: 15,
        color: '#1F2937',
    },

    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
        marginBottom: 8,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: 'center',
    },
    cancelModal: {
        backgroundColor: '#F3F4F6',
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4B5563',
    },
    submitModal: {
        backgroundColor: '#3B82F6',
    },
    submitText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});