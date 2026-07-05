import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "./supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [pwFocus, setPwFocus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetEmailFocus, setResetEmailFocus] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Vérifier si une session existe déjà au lancement
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const { data: utilisateur } = await supabase
          .from("utilisateur")
          .select("role")
          .eq("auth_id", session.user.id)
          .single();

        if (
          utilisateur?.role === "agent_terrain" ||
          utilisateur?.role === "super_admin"
        ) {
          router.replace("/(agent)/accueil");
        } else {
          router.replace("/(tabs)/accueil");
        }
      } else {
        setCheckingSession(false);
      }
    });
  }, []);

  async function handleConnexion() {
    if (!email.trim() || !motDePasse.trim()) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: motDePasse,
    });

    if (error) {
      Alert.alert("Erreur de connexion", "Email ou mot de passe incorrect");
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: utilisateur } = await supabase
      .from("utilisateur")
      .select("role, id_menage")
      .eq("auth_id", user!.id)
      .single();

    if (utilisateur?.role === "habitant" && utilisateur?.id_menage) {
      const { data: menage } = await supabase
        .from("menage")
        .select("statut")
        .eq("id_menage", utilisateur.id_menage)
        .single();

      if (menage?.statut === "suspendu") {
        await supabase.auth.signOut();
        Alert.alert(
          "Compte suspendu",
          "Votre compte est temporairement suspendu. Contactez l'administrateur du quartier.",
        );
        setLoading(false);
        return;
      }

      if (menage?.statut === "archive") {
        await supabase.auth.signOut();
        Alert.alert(
          "Compte désactivé",
          "Votre compte a été désactivé. Contactez l'administrateur du quartier.",
        );
        setLoading(false);
        return;
      }
    }

    if (
      utilisateur?.role === "agent_terrain" ||
      utilisateur?.role === "super_admin"
    ) {
      router.replace("/(agent)/accueil");
    } else {
      router.replace("/(tabs)/accueil");
    }

    setLoading(false);
  }

  async function handleResetPassword() {
    if (!resetEmail.trim()) {
      Alert.alert("Erreur", "Veuillez entrer votre email");
      return;
    }
    setResetLoading(true);

    const { data, error } = await supabase.functions.invoke("reset-password", {
      body: { email: resetEmail.trim() },
    });

    if (error || data?.error) {
      Alert.alert(
        "Erreur",
        "Impossible d'envoyer l'email. Vérifiez l'adresse saisie.",
      );
    } else {
      setResetSuccess(true);
    }
    setResetLoading(false);
  }

  function fermerReset() {
    setShowReset(false);
    setResetEmail("");
    setResetSuccess(false);
    setResetLoading(false);
  }

  // Écran de chargement pendant la vérification de session
  if (checkingSession) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#F4F5F8",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="#2DD4BF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F4F5F8" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flex: 1, backgroundColor: "#F4F5F8" }}>
          {/* HERO */}
          <View style={{ height: 440, overflow: "hidden" }}>
            <LinearGradient
              colors={["#2DD4BF", "#20B8C4", "#3B82F6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ flex: 1 }}
            >
              <View
                style={{
                  position: "absolute",
                  top: -50,
                  right: -40,
                  width: 200,
                  height: 200,
                  borderRadius: 999,
                  backgroundColor: "rgba(255,255,255,0.08)",
                }}
              />
              <View
                style={{
                  position: "absolute",
                  top: 120,
                  left: -50,
                  width: 150,
                  height: 150,
                  borderRadius: 999,
                  backgroundColor: "rgba(255,255,255,0.06)",
                }}
              />
            </LinearGradient>
            <LinearGradient
              colors={[
                "rgba(244,245,248,0)",
                "rgba(244,245,248,0.6)",
                "#F4F5F8",
              ]}
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 220,
              }}
            />

            {/* BLOC MARQUE */}
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: "center",
                justifyContent: "center",
                paddingTop: 44,
              }}
            >
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 22,
                  backgroundColor: "rgba(255,255,255,0.18)",
                  borderWidth: 1.5,
                  borderColor: "rgba(255,255,255,0.42)",
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#0B5763",
                  shadowOffset: { width: 0, height: 14 },
                  shadowOpacity: 0.28,
                  shadowRadius: 30,
                  elevation: 8,
                  marginBottom: 18,
                }}
              >
                <Ionicons name="leaf-outline" size={36} color="#FFFFFF" />
              </View>
              <Text
                style={{
                  fontFamily: "SpaceGrotesk_700Bold",
                  fontSize: 32,
                  color: "#FFFFFF",
                  letterSpacing: -0.3,
                }}
              >
                Weu
              </Text>
              <Text
                style={{
                  fontFamily: "InstrumentSans_400Regular",
                  fontSize: 14,
                  color: "rgba(255,255,255,0.82)",
                  marginTop: 4,
                }}
              >
                Quartier Madina
              </Text>
            </View>
          </View>

          {/* CARTE FORMULAIRE */}
          <View
            style={{
              marginHorizontal: 22,
              marginTop: -60,
              backgroundColor: "#FFFFFF",
              borderRadius: 24,
              borderWidth: 1,
              borderColor: "rgba(15,23,42,0.07)",
              shadowColor: "#0f172a",
              shadowOffset: { width: 0, height: 18 },
              shadowOpacity: 0.12,
              shadowRadius: 44,
              elevation: 12,
              padding: 26,
              zIndex: 10,
            }}
          >
            {/* EMAIL */}
            <Text
              style={{
                fontFamily: "InstrumentSans_600SemiBold",
                fontSize: 11,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: "#8A90A0",
                marginBottom: 8,
              }}
            >
              Email
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                paddingHorizontal: 14,
                height: 50,
                borderWidth: 1.5,
                borderColor: emailFocus ? "#2DD4BF" : "rgba(15,23,42,0.12)",
                borderRadius: 13,
                backgroundColor: emailFocus
                  ? "rgba(45,212,191,0.06)"
                  : "#F7F8FB",
                marginBottom: 18,
              }}
            >
              <Ionicons name="mail-outline" size={18} color="#9AA0B0" />
              <TextInput
                style={{
                  flex: 1,
                  fontFamily: "InstrumentSans_400Regular",
                  fontSize: 15,
                  color: "#1B1F2B",
                }}
                placeholder="votre@email.com"
                placeholderTextColor="#9AA0B0"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocus(true)}
                onBlur={() => setEmailFocus(false)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            {/* MOT DE PASSE */}
            <Text
              style={{
                fontFamily: "InstrumentSans_600SemiBold",
                fontSize: 11,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: "#8A90A0",
                marginBottom: 8,
              }}
            >
              Mot de passe
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                paddingHorizontal: 14,
                height: 50,
                borderWidth: 1.5,
                borderColor: pwFocus ? "#2DD4BF" : "rgba(15,23,42,0.12)",
                borderRadius: 13,
                backgroundColor: pwFocus ? "rgba(45,212,191,0.06)" : "#F7F8FB",
                marginBottom: 24,
              }}
            >
              <Ionicons name="lock-closed-outline" size={18} color="#9AA0B0" />
              <TextInput
                style={{
                  flex: 1,
                  fontFamily: "InstrumentSans_400Regular",
                  fontSize: 15,
                  color: "#1B1F2B",
                }}
                placeholder="••••••••"
                placeholderTextColor="#9AA0B0"
                value={motDePasse}
                onChangeText={setMotDePasse}
                onFocus={() => setPwFocus(true)}
                onBlur={() => setPwFocus(false)}
                secureTextEntry={!showPw}
                autoComplete="password"
              />
              <TouchableOpacity
                onPress={() => setShowPw(!showPw)}
                style={{ padding: 4 }}
              >
                <Ionicons
                  name={showPw ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color="#9AA0B0"
                />
              </TouchableOpacity>
            </View>

            {/* BOUTON CONNEXION */}
            <TouchableOpacity
              onPress={handleConnexion}
              disabled={loading}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={["#2DD4BF", "#2BB6CC", "#3B82F6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  height: 52,
                  borderRadius: 15,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "rgba(45,212,191,1)",
                  shadowOffset: { width: 0, height: 12 },
                  shadowOpacity: 0.38,
                  shadowRadius: 26,
                  elevation: 8,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text
                    style={{
                      fontFamily: "SpaceGrotesk_600SemiBold",
                      fontSize: 16,
                      color: "#FFFFFF",
                    }}
                  >
                    Se connecter
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* MOT DE PASSE OUBLIÉ */}
            <TouchableOpacity
              style={{ marginTop: 18, alignItems: "center" }}
              onPress={() => setShowReset(true)}
            >
              <Text
                style={{
                  fontFamily: "InstrumentSans_500Medium",
                  fontSize: 14,
                  color: "#0E9384",
                }}
              >
                Mot de passe oublié ?
              </Text>
            </TouchableOpacity>
          </View>

          {/* FOOTER */}
          <View
            style={{
              marginTop: "auto",
              paddingBottom: 26,
              alignItems: "center",
              paddingTop: 24,
            }}
          >
            <Text
              style={{
                fontFamily: "InstrumentSans_400Regular",
                fontSize: 12,
                color: "#9AA0B0",
              }}
            >
              Plateforme Weu · Gestion de quartier
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* MODAL MOT DE PASSE OUBLIÉ */}
      <Modal
        visible={showReset}
        transparent
        animationType="slide"
        onRequestClose={fermerReset}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(15,23,42,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              gap: 12,
              paddingBottom: 40,
            }}
          >
            <View
              style={{
                width: 40,
                height: 4,
                backgroundColor: "rgba(15,23,42,0.12)",
                borderRadius: 999,
                alignSelf: "center",
                marginBottom: 4,
              }}
            />

            {resetSuccess ? (
              <>
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 999,
                    backgroundColor: "rgba(45,212,191,0.12)",
                    alignSelf: "center",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="checkmark" size={32} color="#2DD4BF" />
                </View>
                <Text
                  style={{
                    fontFamily: "SpaceGrotesk_700Bold",
                    fontSize: 20,
                    color: "#1B1F2B",
                    textAlign: "center",
                  }}
                >
                  Email envoyé !
                </Text>
                <Text
                  style={{
                    fontFamily: "InstrumentSans_400Regular",
                    fontSize: 14,
                    color: "#6B7185",
                    textAlign: "center",
                    lineHeight: 22,
                  }}
                >
                  Consultez votre boîte mail et cliquez sur le lien pour
                  réinitialiser votre mot de passe.
                </Text>
                <TouchableOpacity onPress={fermerReset} activeOpacity={0.88}>
                  <LinearGradient
                    colors={["#2DD4BF", "#3B82F6"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      borderRadius: 14,
                      paddingVertical: 15,
                      alignItems: "center",
                      marginTop: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "InstrumentSans_600SemiBold",
                        fontSize: 15,
                        color: "#0E1210",
                      }}
                    >
                      Fermer
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 999,
                    backgroundColor: "rgba(45,212,191,0.12)",
                    alignSelf: "center",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={28}
                    color="#2DD4BF"
                  />
                </View>
                <Text
                  style={{
                    fontFamily: "SpaceGrotesk_700Bold",
                    fontSize: 20,
                    color: "#1B1F2B",
                    textAlign: "center",
                  }}
                >
                  Mot de passe oublié
                </Text>
                <Text
                  style={{
                    fontFamily: "InstrumentSans_400Regular",
                    fontSize: 14,
                    color: "#6B7185",
                    textAlign: "center",
                    lineHeight: 22,
                  }}
                >
                  Entrez votre email et nous vous enverrons un lien pour
                  réinitialiser votre mot de passe.
                </Text>

                <Text
                  style={{
                    fontFamily: "InstrumentSans_600SemiBold",
                    fontSize: 11,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    color: "#8A90A0",
                    marginTop: 4,
                  }}
                >
                  Email
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    paddingHorizontal: 14,
                    height: 50,
                    borderWidth: 1.5,
                    borderColor: resetEmailFocus
                      ? "#2DD4BF"
                      : "rgba(15,23,42,0.12)",
                    borderRadius: 13,
                    backgroundColor: resetEmailFocus
                      ? "rgba(45,212,191,0.06)"
                      : "#F7F8FB",
                  }}
                >
                  <Ionicons name="mail-outline" size={18} color="#9AA0B0" />
                  <TextInput
                    style={{
                      flex: 1,
                      fontFamily: "InstrumentSans_400Regular",
                      fontSize: 15,
                      color: "#1B1F2B",
                    }}
                    placeholder="votre@email.com"
                    placeholderTextColor="#9AA0B0"
                    value={resetEmail}
                    onChangeText={setResetEmail}
                    onFocus={() => setResetEmailFocus(true)}
                    onBlur={() => setResetEmailFocus(false)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity
                  onPress={handleResetPassword}
                  disabled={resetLoading}
                  activeOpacity={0.88}
                >
                  <LinearGradient
                    colors={["#2DD4BF", "#3B82F6"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      borderRadius: 14,
                      paddingVertical: 15,
                      alignItems: "center",
                      opacity: resetLoading ? 0.7 : 1,
                    }}
                  >
                    {resetLoading ? (
                      <ActivityIndicator color="#0E1210" />
                    ) : (
                      <Text
                        style={{
                          fontFamily: "InstrumentSans_600SemiBold",
                          fontSize: 15,
                          color: "#0E1210",
                        }}
                      >
                        Envoyer le lien
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={fermerReset}
                  style={{
                    borderRadius: 14,
                    paddingVertical: 14,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "rgba(15,23,42,0.12)",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "InstrumentSans_600SemiBold",
                      fontSize: 15,
                      color: "#6B7185",
                    }}
                  >
                    Annuler
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
