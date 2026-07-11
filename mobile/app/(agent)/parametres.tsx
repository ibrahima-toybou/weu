import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../lib/supabase";
import { styles } from "../../styles/agent/parametres.styles";
import { colors } from "../lib/theme";

export default function ParametresAgent() {
  const [loading, setLoading] = useState(true);
  const [utilisateur, setUtilisateur] = useState<any>(null);
  const [showNom, setShowNom] = useState(false);
  const [showTel, setShowTel] = useState(false);
  const [showMdp, setShowMdp] = useState(false);
  const [nouveauNom, setNouveauNom] = useState("");
  const [nouveauTel, setNouveauTel] = useState("");
  const [ancienMdp, setAncienMdp] = useState("");
  const [nouveauMdp, setNouveauMdp] = useState("");
  const [confirmMdp, setConfirmMdp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/");
      return;
    }
    const { data: utilisateurData } = await supabase
      .from("utilisateur")
      .select("*")
      .eq("auth_id", user.id)
      .single();
    setUtilisateur(utilisateurData);
    setLoading(false);
  }

  async function handleModifierNom() {
    if (!nouveauNom.trim()) {
      setError("Veuillez entrer un nom");
      return;
    }
    setSaving(true);
    setError("");
    const { error } = await supabase
      .from("utilisateur")
      .update({ nom: nouveauNom })
      .eq("id_utilisateur", utilisateur.id_utilisateur);
    if (error) {
      setError("Erreur lors de la modification");
    } else {
      setSuccess("Nom modifié !");
      setShowNom(false);
      setNouveauNom("");
      fetchData();
    }
    setSaving(false);
  }

  async function handleModifierTel() {
    if (!nouveauTel.trim()) {
      setError("Veuillez entrer un numéro");
      return;
    }
    setSaving(true);
    setError("");
    const { error } = await supabase
      .from("utilisateur")
      .update({ telephone: nouveauTel })
      .eq("id_utilisateur", utilisateur.id_utilisateur);
    if (error) {
      setError("Erreur lors de la modification");
    } else {
      setSuccess("Téléphone modifié !");
      setShowTel(false);
      setNouveauTel("");
      fetchData();
    }
    setSaving(false);
  }

  async function handleModifierMdp() {
    setError("");
    if (!ancienMdp || !nouveauMdp || !confirmMdp) {
      setError("Veuillez remplir tous les champs");
      return;
    }
    if (nouveauMdp !== confirmMdp) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (nouveauMdp.length < 8) {
      setError("Minimum 8 caractères");
      return;
    }
    setSaving(true);
    const { error: verifError } = await supabase.auth.signInWithPassword({
      email: utilisateur.email,
      password: ancienMdp,
    });
    if (verifError) {
      setError("Mot de passe actuel incorrect");
      setSaving(false);
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: nouveauMdp });
    if (error) {
      setError("Erreur : " + error.message);
    } else {
      setSuccess("Mot de passe modifié !");
      setShowMdp(false);
      setAncienMdp("");
      setNouveauMdp("");
      setConfirmMdp("");
    }
    setSaving(false);
  }

  async function handleDeconnexion() {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace("/");
        },
      },
    ]);
  }

  const initiales = utilisateur?.nom?.charAt(0).toUpperCase() || "A";

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={colors.teal} />
      </View>
    );
  }

  const ModalCommun = ({ visible, onClose, title, children }: any) => (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: colors.border,
              borderRadius: 999,
              alignSelf: "center",
              marginBottom: 16,
            }}
          />
          <Text style={styles.modalTitle}>{title}</Text>
          {error ? (
            <View style={styles.alertError}>
              <Text style={styles.alertErrorText}>{error}</Text>
            </View>
          ) : null}
          {success ? (
            <View style={styles.alertSuccess}>
              <Text style={styles.alertSuccessText}>{success}</Text>
            </View>
          ) : null}
          {children}
          <TouchableOpacity style={styles.modalBtnOutline} onPress={onClose}>
            <Text style={styles.modalBtnOutlineText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        <View style={{ overflow: "hidden" }}>
          {/* HERO */}
          <LinearGradient
            colors={["#2DD4BF", "#20B8C4", "#3B82F6", "#3B82F6", "#F4F5F8"]}
            locations={[0, 0.25, 0.55, 0.72, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ paddingTop: 56, paddingHorizontal: 24, paddingBottom: 80 }}
          >
            <Text style={styles.headerTitle}>Paramètres</Text>
            <Text style={styles.headerSub}>Gérez votre compte</Text>
          </LinearGradient>

          <View style={styles.body}>
            {/* PROFIL */}
            <View style={styles.profilCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initiales}</Text>
              </View>
              <Text style={styles.profilNom}>{utilisateur?.nom}</Text>
              <Text style={styles.profilEmail}>{utilisateur?.email}</Text>
              <Text style={styles.profilPoint}>Agent de terrain · Madina</Text>
            </View>

            {/* INFOS PERSONNELLES */}
            <Text style={styles.sectionTitle}>Informations personnelles</Text>
            <View style={styles.menuCard}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setNouveauNom(utilisateur?.nom || "");
                  setError("");
                  setSuccess("");
                  setShowNom(true);
                }}
              >
                <View
                  style={[styles.menuIcon, { backgroundColor: colors.tealBg }]}
                >
                  <Ionicons
                    name="person-outline"
                    size={18}
                    color={colors.tealDark}
                  />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuLabel}>Nom</Text>
                  <Text style={styles.menuSub}>{utilisateur?.nom}</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.border}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setNouveauTel(utilisateur?.telephone || "");
                  setError("");
                  setSuccess("");
                  setShowTel(true);
                }}
              >
                <View
                  style={[
                    styles.menuIcon,
                    { backgroundColor: "rgba(59,130,246,0.12)" },
                  ]}
                >
                  <Ionicons name="call-outline" size={18} color="#3B82F6" />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuLabel}>Téléphone</Text>
                  <Text style={styles.menuSub}>
                    {utilisateur?.telephone || "Non renseigné"}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.border}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItemLast} disabled>
                <View
                  style={[styles.menuIcon, { backgroundColor: colors.bgPage }]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color={colors.textLabel}
                  />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuLabel}>Email</Text>
                  <Text style={styles.menuSub}>{utilisateur?.email}</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* SÉCURITÉ */}
            <Text style={styles.sectionTitle}>Sécurité</Text>
            <View style={styles.menuCard}>
              <TouchableOpacity
                style={styles.menuItemLast}
                onPress={() => {
                  setError("");
                  setSuccess("");
                  setShowMdp(true);
                }}
              >
                <View
                  style={[styles.menuIcon, { backgroundColor: colors.amberBg }]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={colors.amber}
                  />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuLabel}>Mot de passe</Text>
                  <Text style={styles.menuSub}>
                    Modifier votre mot de passe
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.border}
                />
              </TouchableOpacity>
            </View>

            {/* DÉCONNEXION */}
            <TouchableOpacity
              style={styles.deconnexionBtn}
              onPress={handleDeconnexion}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <Ionicons name="log-out-outline" size={18} color={colors.red} />
                <Text style={styles.deconnexionText}>Se déconnecter</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* MODAL NOM */}
      <ModalCommun
        visible={showNom}
        onClose={() => setShowNom(false)}
        title="Modifier le nom"
      >
        <Text style={styles.modalLabel}>Nouveau nom</Text>
        <TextInput
          style={styles.modalInput}
          value={nouveauNom}
          onChangeText={setNouveauNom}
          placeholder="Votre nom"
          placeholderTextColor={colors.textLabel}
        />
        <TouchableOpacity
          onPress={handleModifierNom}
          disabled={saving}
          activeOpacity={0.88}
        >
          <LinearGradient
            colors={["#2DD4BF", "#3B82F6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.modalBtn, { borderRadius: 14 }]}
          >
            <Text style={styles.modalBtnText}>
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ModalCommun>

      {/* MODAL TÉLÉPHONE */}
      <ModalCommun
        visible={showTel}
        onClose={() => setShowTel(false)}
        title="Modifier le téléphone"
      >
        <Text style={styles.modalLabel}>Numéro de téléphone</Text>
        <TextInput
          style={styles.modalInput}
          value={nouveauTel}
          onChangeText={setNouveauTel}
          placeholder="+269 XX XX XX XX"
          placeholderTextColor={colors.textLabel}
          keyboardType="phone-pad"
        />
        <TouchableOpacity
          onPress={handleModifierTel}
          disabled={saving}
          activeOpacity={0.88}
        >
          <LinearGradient
            colors={["#2DD4BF", "#3B82F6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.modalBtn, { borderRadius: 14 }]}
          >
            <Text style={styles.modalBtnText}>
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ModalCommun>

      {/* MODAL MOT DE PASSE */}
      <ModalCommun
        visible={showMdp}
        onClose={() => setShowMdp(false)}
        title="Changer le mot de passe"
      >
        <Text style={styles.modalLabel}>Ancien mot de passe</Text>
        <TextInput
          style={styles.modalInput}
          value={ancienMdp}
          onChangeText={setAncienMdp}
          placeholder="••••••••"
          placeholderTextColor={colors.textLabel}
          secureTextEntry
        />
        <Text style={styles.modalLabel}>Nouveau mot de passe</Text>
        <TextInput
          style={styles.modalInput}
          value={nouveauMdp}
          onChangeText={setNouveauMdp}
          placeholder="••••••••"
          placeholderTextColor={colors.textLabel}
          secureTextEntry
        />
        <Text style={styles.modalLabel}>Confirmer</Text>
        <TextInput
          style={styles.modalInput}
          value={confirmMdp}
          onChangeText={setConfirmMdp}
          placeholder="••••••••"
          placeholderTextColor={colors.textLabel}
          secureTextEntry
        />
        <TouchableOpacity
          onPress={handleModifierMdp}
          disabled={saving}
          activeOpacity={0.88}
        >
          <LinearGradient
            colors={["#2DD4BF", "#3B82F6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.modalBtn, { borderRadius: 14 }]}
          >
            <Text style={styles.modalBtnText}>
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ModalCommun>
    </View>
  );
}
