// app/(app)/add-supervisor.jsx
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { createUser } from '../../services/apiService';

export default function AddSupervisorScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [region, setRegion] = useState('');
    const [role, setRole] = useState('ROLE_SUPERVISOR');

    const handleSubmit = async () => {
        if (!username || !password || !email || !region) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
            return;
        }

        setLoading(true);
        try {
            await createUser(username, password, role);
            Alert.alert('Succès', 'Superviseur créé avec succès !');
            router.back();
        } catch (error) {
            Alert.alert('Erreur', error.message || 'Impossible de créer le superviseur');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F7F9FD" />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#17243D" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>➕ Ajouter superviseur</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.form}>
                    <Text style={styles.label}>Nom d'utilisateur *</Text>
                    <TextInput
                        style={styles.input}
                        value={username}
                        onChangeText={setUsername}
                        placeholder="Ex: supervisor1"
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>Email *</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Ex: supervisor@email.com"
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    <Text style={styles.label}>Région *</Text>
                    <TextInput
                        style={styles.input}
                        value={region}
                        onChangeText={setRegion}
                        placeholder="Ex: Tunis, Ariana..."
                    />

                    <Text style={styles.label}>Mot de passe *</Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Mot de passe"
                        secureTextEntry
                    />

                    <Text style={styles.label}>Confirmer le mot de passe *</Text>
                    <TextInput
                        style={styles.input}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Confirmer le mot de passe"
                        secureTextEntry
                    />

                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.disabledButton]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.submitButtonText}>Créer superviseur</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F9FD' },
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
    content: { padding: 16 },
    form: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16 },
    label: { fontSize: 14, fontWeight: '600', color: '#4A5568', marginBottom: 6, marginTop: 12 },
    input: {
        backgroundColor: '#F7FAFC',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        fontSize: 15,
        color: '#17243D',
    },
    submitButton: {
        backgroundColor: '#3974F6',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 24,
    },
    disabledButton: { opacity: 0.7 },
    submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});