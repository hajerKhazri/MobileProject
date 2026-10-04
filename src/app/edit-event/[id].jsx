// app/edit-event/[id].jsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { getEventById, updateEvent, getRegions, getAllSuperviseurs } from '../../services/apiService';

export default function EditEventScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    const [name, setName] = useState('');
    const [region, setRegion] = useState('');
    const [superviseur, setSuperviseur] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [regions, setRegions] = useState([]);
    const [superviseurs, setSuperviseurs] = useState([]);
    const [showRegionDropdown, setShowRegionDropdown] = useState(false);
    const [showSuperviseurDropdown, setShowSuperviseurDropdown] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [event, regionsData, supData] = await Promise.all([
                getEventById(id),
                getRegions().catch(() => []),
                getAllSuperviseurs().catch(() => []),
            ]);
            
            setName(event.name || '');
            setRegion(event.region || '');
            setSuperviseur(Array.isArray(event.superviseur) ? event.superviseur.join(', ') : event.superviseur || '');
            setDate(new Date(event.eventDateTime));
            setRegions(regionsData || []);
            setSuperviseurs(supData || []);
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de charger l\'événement');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            Alert.alert('Erreur', 'Le nom est obligatoire');
            return;
        }
        if (!region) {
            Alert.alert('Erreur', 'Veuillez sélectionner une région');
            return;
        }
        if (!superviseur.trim()) {
            Alert.alert('Erreur', 'Veuillez entrer un superviseur');
            return;
        }

        setSubmitting(true);
        try {
            const eventData = {
                name: name.trim(),
                region: region,
                superviseur: superviseur.split(',').map(s => s.trim()),
                eventDateTime: date.toISOString(),
            };
            await updateEvent(id, eventData);
            Alert.alert('Succès', 'Événement modifié !');
            router.back();
        } catch (error) {
            Alert.alert('Erreur', error.message || 'Échec de la modification');
        } finally {
            setSubmitting(false);
        }
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
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F7F9FD" />

            {/* Header avec retour */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#17243D" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Modifier l'événement</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Carte formulaire */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>✏️ Modifier l'événement</Text>

                    {/* Nom */}
                    <Text style={styles.label}>Nom *</Text>
                    <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ex: Visite de terrain" />

                    {/* Région - Dropdown */}
                    <Text style={styles.label}>Région *</Text>
                    <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowRegionDropdown(!showRegionDropdown)}>
                        <Text style={region ? styles.dropdownText : styles.dropdownPlaceholder}>
                            {region || 'Sélectionner une région'}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color="#8490A4" />
                    </TouchableOpacity>
                    {showRegionDropdown && (
                        <View style={styles.dropdownList}>
                            {regions.map((r) => (
                                <TouchableOpacity key={r} style={[styles.dropdownItem, region === r && styles.dropdownItemSelected]} onPress={() => { setRegion(r); setShowRegionDropdown(false); }}>
                                    <Text style={[styles.dropdownItemText, region === r && styles.dropdownItemTextSelected]}>{r}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Superviseur */}
                    <Text style={styles.label}>Superviseur(s) *</Text>
                    <TextInput 
                        style={styles.input} 
                        value={superviseur} 
                        onChangeText={setSuperviseur} 
                        placeholder="Ex: Jean, Marie" 
                    />

                    {/* Date */}
                    <Text style={styles.label}>Date *</Text>
                    <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                        <Ionicons name="calendar-outline" size={20} color="#3974F6" />
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

                    {/* Heure */}
                    <Text style={styles.label}>Heure *</Text>
                    <TouchableOpacity style={styles.dateButton} onPress={() => setShowTimePicker(true)}>
                        <Ionicons name="time-outline" size={20} color="#3974F6" />
                        <Text style={styles.dateText}>
                            {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
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

                    {/* Boutons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => router.back()}>
                            <Text style={styles.cancelText}>Annuler</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleSubmit} disabled={submitting}>
                            {submitting ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.submitText}>Modifier</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F9FD' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: '#8490A4' },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F2F6',
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#17243D' },

    scrollContent: { padding: 20, paddingBottom: 40 },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        shadowColor: '#25385D',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 4,
    },
    cardTitle: { fontSize: 22, fontWeight: '800', color: '#17243D', marginBottom: 20, textAlign: 'center' },

    label: { fontSize: 14, fontWeight: '600', color: '#4A5568', marginBottom: 6, marginTop: 12 },
    input: {
        backgroundColor: '#F7FAFC',
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        fontSize: 15,
        color: '#17243D',
    },

    dropdownButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F7FAFC',
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    dropdownText: { fontSize: 15, color: '#17243D' },
    dropdownPlaceholder: { fontSize: 15, color: '#A5AEC0' },
    dropdownList: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginTop: 4,
        maxHeight: 150,
    },
    dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#F0F2F6' },
    dropdownItemSelected: { backgroundColor: '#3974F6' },
    dropdownItemText: { fontSize: 14, color: '#17243D' },
    dropdownItemTextSelected: { color: '#FFFFFF' },

    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#F7FAFC',
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    dateText: { fontSize: 15, color: '#17243D' },

    buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, gap: 12 },
    button: { flex: 1, paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
    cancelButton: { backgroundColor: '#F0F2F6' },
    cancelText: { fontSize: 16, fontWeight: '600', color: '#4A5568' },
    submitButton: { backgroundColor: '#3974F6' },
    submitText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});