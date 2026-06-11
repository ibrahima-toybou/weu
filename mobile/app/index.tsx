import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "./supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      Alert.alert("Erreur", "Email ou mot de passe incorrect");
      setLoading(false);
      return;
    }

    // Récupérer le rôle
    const { data: utilisateur, error: userError } = await supabase
      .from("utilisateur")
      .select("role, nom")
      .eq("auth_id", authData.user.id)
      .single();

    if (userError || !utilisateur) {
      Alert.alert("Erreur", "Compte non trouvé dans le système");
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    // Redirection selon le rôle
    if (utilisateur.role === "habitant") {
      router.replace("/(tabs)/accueil");
    } else if (utilisateur.role === "agent_terrain") {
      router.replace("/(tabs)/accueil");
    } else {
      Alert.alert(
        "Accès refusé",
        "Cette app est réservée aux habitants et agents",
      );
      await supabase.auth.signOut();
    }
    if (utilisateur.role === "habitant") {
      router.replace("/(tabs)/accueil");
    } else if (utilisateur.role === "agent_terrain") {
      router.replace("/(agent)/accueil");
    } else {
      Alert.alert(
        "Accès refusé",
        "Cette app est réservée aux habitants et agents",
      );
      await supabase.auth.signOut();
    }

    setLoading(false);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Logo */}
      <View style={styles.logoWrap}>
        <View style={styles.logoIcon}>
          <Text style={styles.logoEmoji}>🌿</Text>
        </View>
        <Text style={styles.logoText}>Weu</Text>
        <Text style={styles.logoSub}>Quartier Madina</Text>
      </View>

      {/* Formulaire */}
      <View style={styles.form}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="votre@email.com"
          placeholderTextColor="#9ab8a8"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Mot de passe</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#9ab8a8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Se connecter</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.forgotBtn}>
          <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

import { styles } from "./index.styles";
