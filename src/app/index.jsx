import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
} from 'react-native';

import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import { login } from '../services/authService';

export default function LoginScreen() {
    const router = useRouter();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
    // checkAuth();  // ← Désactivé pour que le login s’affiche toujours
}, []);

    const checkAuth = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');

            if (token) {
                router.replace('/(app)/dashboard');
            }
        } catch (error) {
            console.log('Erreur auth:', error);
        }
    };

    const handleLogin = async () => {
        if (!username.trim() || !password.trim()) {
            Alert.alert(
                'Champs requis',
                'Veuillez remplir tous les champs.'
            );
            return;
        }

        setLoading(true);

        try {
            const result = await login(
                username.trim(),
                password
            );

            if (result.success) {
                router.replace('/(app)/dashboard');
            } else {
                Alert.alert(
                    'Connexion impossible',
                    result.error || 'Identifiants invalides.'
                );
            }
        } catch (error) {
            console.log('Login error:', error);

            Alert.alert(
                'Erreur',
                'Une erreur est survenue lors de la connexion.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>

            <StatusBar
                barStyle="dark-content"
                backgroundColor="#F8FAFF"
            />

            {/* ================= DECORATION ================= */}

            <View style={styles.backgroundCircle1} />
            <View style={styles.backgroundCircle2} />
            <View style={styles.backgroundCircle3} />

            <KeyboardAvoidingView
                style={styles.keyboard}
                behavior={
                    Platform.OS === 'ios'
                        ? 'padding'
                        : undefined
                }
            >

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.scroll}
                >

                    {/* ================= LOGO ================= */}

                    <View style={styles.header}>

                        <View style={styles.logoOuter}>

                            <View style={styles.logoCircle}>

                                <Image
                                    source={require('../assets/logo-enda-tao.jpg')}
                                    style={styles.logo}
                                    resizeMode="cover"
                                />

                            </View>

                        </View>

                        <Text style={styles.title}>
                            Enda Tao
                        </Text>

                        <Text style={styles.subtitle}>
                            Plateforme de gestion
                        </Text>

                        <View style={styles.separator}>
                            <View style={styles.dot} />
                            <View style={styles.line} />
                            <View style={styles.dot} />
                        </View>

                    </View>

                    {/* ================= LOGIN CARD ================= */}

                    <View style={styles.card}>

                        {/* Header */}

                        <View style={styles.cardHeader}>

                            <Text style={styles.welcome}>
                                👋 Bienvenue !
                            </Text>

                            <Text style={styles.description}>
                                Connectez-vous à votre compte
                            </Text>

                        </View>

                        {/* ================= USERNAME ================= */}

                        <View style={styles.inputGroup}>

                            <Text style={styles.label}>
                                Nom d'utilisateur
                            </Text>

                            <View style={styles.inputContainer}>

                                <View style={styles.iconCircle}>

                                    <Ionicons
                                        name="person-outline"
                                        size={22}
                                        color="#3974F6"
                                    />

                                </View>

                                <TextInput
                                    style={styles.input}
                                    value={username}
                                    onChangeText={setUsername}
                                    placeholder="Votre nom d'utilisateur"
                                    placeholderTextColor="#A5AEC0"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />

                            </View>

                        </View>

                        {/* ================= PASSWORD ================= */}

                        <View style={styles.inputGroup}>

                            <Text style={styles.label}>
                                Mot de passe
                            </Text>

                            <View style={styles.inputContainer}>

                                <View style={styles.iconCircle}>

                                    <Ionicons
                                        name="lock-closed-outline"
                                        size={22}
                                        color="#3974F6"
                                    />

                                </View>

                                <TextInput
                                    style={styles.input}
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="Votre mot de passe"
                                    placeholderTextColor="#A5AEC0"
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />

                                <TouchableOpacity
                                    onPress={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    style={styles.eyeButton}
                                >

                                    <Ionicons
                                        name={
                                            showPassword
                                                ? 'eye-outline'
                                                : 'eye-off-outline'
                                        }
                                        size={23}
                                        color="#8792A7"
                                    />

                                </TouchableOpacity>

                            </View>

                        </View>

                        {/* ================= FORGOT ================= */}

                        <TouchableOpacity
                            style={styles.forgot}
                            activeOpacity={0.7}
                        >

                            <Text style={styles.forgotText}>
                                Mot de passe oublié ?
                            </Text>

                        </TouchableOpacity>

                        {/* ================= BUTTON ================= */}

                        <TouchableOpacity
                            style={[
                                styles.loginButton,
                                loading &&
                                    styles.loginButtonDisabled,
                            ]}
                            onPress={handleLogin}
                            disabled={loading}
                            activeOpacity={0.85}
                        >

                            {loading ? (

                                <ActivityIndicator
                                    size="small"
                                    color="#FFFFFF"
                                />

                            ) : (

                                <>

                                    <Text style={styles.loginText}>
                                        Se connecter
                                    </Text>

                                    <View style={styles.arrowCircle}>

                                        <Ionicons
                                            name="arrow-forward"
                                            size={24}
                                            color="#3268F5"
                                        />

                                    </View>

                                </>

                            )}

                        </TouchableOpacity>

                        {/* ================= OR ================= */}

                        <View style={styles.orContainer}>

                            <View style={styles.orLine} />

                            <Text style={styles.orText}>
                                ou
                            </Text>

                            <View style={styles.orLine} />

                        </View>

                        {/* ================= FINGERPRINT ================= */}

                        <TouchableOpacity
                            style={styles.fingerprintButton}
                            activeOpacity={0.8}
                        >

                            <View style={styles.fingerprintCircle}>

                                <Ionicons
                                    name="finger-print-outline"
                                    size={38}
                                    color="#3974F6"
                                />

                            </View>

                            <Text style={styles.quickLogin}>
                                Connexion rapide
                            </Text>

                            <Text style={styles.fingerprintText}>
                                Utiliser l'empreinte
                            </Text>

                        </TouchableOpacity>

                    </View>

                    {/* ================= SECURITY ================= */}

                    <View style={styles.security}>

                        <View style={styles.securityIcon}>

                            <Ionicons
                                name="shield-checkmark-outline"
                                size={30}
                                color="#18B89A"
                            />

                        </View>

                        <View>

                            <Text style={styles.securityTitle}>
                                Connexion sécurisée
                            </Text>

                            <Text style={styles.securityText}>
                                Vos données sont protégées
                            </Text>

                        </View>

                    </View>

                    {/* ================= FOOTER ================= */}

                    <Text style={styles.footer}>
                        © 2026 Enda Tao
                    </Text>

                </ScrollView>

            </KeyboardAvoidingView>

        </View>
    );
}

const styles = StyleSheet.create({

    // =====================================================
    // MAIN
    // =====================================================

    container: {
        flex: 1,
        backgroundColor: '#F8FAFF',
    },

    keyboard: {
        flex: 1,
        zIndex: 2,
    },

    scroll: {
        flexGrow: 1,
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 45,
        paddingBottom: 30,
    },

    // =====================================================
    // BACKGROUND DECORATION
    // =====================================================

    backgroundCircle1: {
        position: 'absolute',
        width: 240,
        height: 240,
        borderRadius: 120,
        backgroundColor: '#EDF3FF',
        left: -130,
        top: 280,
        opacity: 0.8,
    },

    backgroundCircle2: {
        position: 'absolute',
        width: 190,
        height: 190,
        borderRadius: 95,
        backgroundColor: '#EEF8FF',
        right: -110,
        top: 410,
        opacity: 0.9,
    },

    backgroundCircle3: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#36C4CF',
        right: 35,
        top: 390,
    },

    // =====================================================
    // HEADER
    // =====================================================

    header: {
        alignItems: 'center',
        width: '100%',
        marginBottom: 24,
    },

    logoOuter: {
        width: 116,
        height: 116,
        borderRadius: 58,
        backgroundColor: '#FFFFFF',

        justifyContent: 'center',
        alignItems: 'center',

        shadowColor: '#273B68',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.13,
        shadowRadius: 20,

        elevation: 8,

        marginBottom: 18,
    },

    logoCircle: {
        width: 94,
        height: 94,
        borderRadius: 47,

        overflow: 'hidden',

        backgroundColor: '#FFFFFF',

        justifyContent: 'center',
        alignItems: 'center',
    },

    logo: {
        width: 94,
        height: 94,
        borderRadius: 47,
    },

    title: {
        fontSize: 34,
        fontWeight: '800',
        color: '#17243D',
        letterSpacing: -1,
    },

    subtitle: {
        fontSize: 16,
        color: '#74809A',
        marginTop: 5,
    },

    separator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 17,
    },

    line: {
        width: 55,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#3974F6',
        marginHorizontal: 7,
    },

    dot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: '#C9D9FF',
    },

    // =====================================================
    // CARD
    // =====================================================

    card: {
        width: '100%',
        maxWidth: 430,

        backgroundColor: '#FFFFFF',

        borderRadius: 34,

        paddingHorizontal: 24,
        paddingTop: 29,
        paddingBottom: 30,

        shadowColor: '#1D315A',
        shadowOffset: {
            width: 0,
            height: 12,
        },
        shadowOpacity: 0.09,
        shadowRadius: 30,

        elevation: 8,
    },

    cardHeader: {
        alignItems: 'center',
        marginBottom: 27,
    },

    welcome: {
        fontSize: 26,
        fontWeight: '800',
        color: '#17243D',
    },

    description: {
        fontSize: 15,
        color: '#77839B',
        marginTop: 8,
    },

    // =====================================================
    // INPUT
    // =====================================================

    inputGroup: {
        marginBottom: 19,
    },

    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#25324B',
        marginBottom: 9,
    },

    inputContainer: {
        height: 65,

        borderWidth: 1.3,
        borderColor: '#DCE3F0',

        borderRadius: 21,

        flexDirection: 'row',
        alignItems: 'center',

        paddingHorizontal: 10,

        backgroundColor: '#FFFFFF',
    },

    iconCircle: {
        width: 46,
        height: 46,

        borderRadius: 23,

        backgroundColor: '#EEF3FF',

        justifyContent: 'center',
        alignItems: 'center',

        marginRight: 11,
    },

    input: {
        flex: 1,

        height: '100%',

        fontSize: 16,

        color: '#17243D',

        paddingVertical: 0,
    },

    eyeButton: {
        padding: 8,
    },

    // =====================================================
    // FORGOT
    // =====================================================

    forgot: {
        alignSelf: 'flex-end',
        marginTop: -4,
        marginBottom: 22,
    },

    forgotText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#3268F5',
    },

    // =====================================================
    // LOGIN BUTTON
    // =====================================================

    loginButton: {
        height: 62,

        borderRadius: 21,

        backgroundColor: '#3D6FE8',

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',

        shadowColor: '#386CF2',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.28,
        shadowRadius: 15,

        elevation: 7,
    },

    loginButtonDisabled: {
        opacity: 0.65,
    },

    loginText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '800',
        marginRight: 15,
    },

    arrowCircle: {
        width: 43,
        height: 43,

        borderRadius: 22,

        backgroundColor: '#FFFFFF',

        justifyContent: 'center',
        alignItems: 'center',
    },

    // =====================================================
    // OR
    // =====================================================

    orContainer: {
        flexDirection: 'row',
        alignItems: 'center',

        marginVertical: 25,
    },

    orLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E1E6F0',
    },

    orText: {
        marginHorizontal: 15,

        fontSize: 14,
        color: '#8A95A9',
        fontWeight: '600',
    },

    // =====================================================
    // FINGERPRINT
    // =====================================================

    fingerprintButton: {
        alignItems: 'center',
    },

    fingerprintCircle: {
        width: 72,
        height: 72,

        borderRadius: 36,

        backgroundColor: '#EEF3FF',

        justifyContent: 'center',
        alignItems: 'center',

        marginBottom: 10,
    },

    quickLogin: {
        fontSize: 15,
        fontWeight: '700',
        color: '#43516B',
    },

    fingerprintText: {
        fontSize: 14,
        color: '#8994A8',
        marginTop: 4,
    },

    // =====================================================
    // SECURITY
    // =====================================================

    security: {
        flexDirection: 'row',
        alignItems: 'center',

        marginTop: 25,
        marginBottom: 8,
    },

    securityIcon: {
        width: 58,
        height: 58,

        borderRadius: 29,

        backgroundColor: '#E9FAF6',

        justifyContent: 'center',
        alignItems: 'center',

        marginRight: 13,
    },

    securityTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#53617A',
    },

    securityText: {
        fontSize: 13,
        color: '#8994A8',
        marginTop: 4,
    },

    // =====================================================
    // FOOTER
    // =====================================================

    footer: {
        fontSize: 11,
        color: '#A5AEC0',
        marginTop: 16,
    },
});