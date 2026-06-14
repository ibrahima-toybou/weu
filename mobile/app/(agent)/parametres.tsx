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
import { supabase } from "../supabase";
import { styles } from "./parametres.styles";

export default function ParametresAgent() {
  const [loading, setLoading] = useState(true);
  const [utilisateur, setUtilisateur] = useState<any>(null);

  const [showNom, setShowNom] = useState(false);
  const [showTel, setShowTel] = useState(false);
  const [nouveauTel, setNouveauTel] = useState("");
  const [showMdp, setShowMdp] = useState(false);

  const [nouveauNom, setNouveauNom] = useState("");
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
      setSuccess("Nom modifié avec succès !");
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
      setSuccess("Téléphone modifié avec succès !");
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
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setSaving(true);

    // Vérifier l'ancien mot de passe
    const { error: verifError } = await supabase.auth.signInWithPassword({
      email: utilisateur.email,
      password: ancienMdp,
    });

    if (verifError) {
      setError("Mot de passe actuel incorrect");
      setSaving(false);
      return;
    }

    // Changer le mot de passe
    const { error } = await supabase.auth.updateUser({ password: nouveauMdp });

    if (error) {
      setError("Erreur : " + error.message);
    } else {
      setSuccess("Mot de passe modifié avec succès !");
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

  function getInitiales() {
    const nom = utilisateur?.nom || "A";
    return nom.charAt(0).toUpperCase();
  }

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#1a5c99" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Paramètres</Text>
          <Text style={styles.headerSub}>Gérez votre compte</Text>
        </View>

        <View style={styles.body}>
          <View style={styles.profilCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitiales()}</Text>
            </View>
            <Text style={styles.profilNom}>{utilisateur?.nom}</Text>
            <Text style={styles.profilEmail}>{utilisateur?.email}</Text>
            <Text style={styles.profilPoint}>Agent de terrain · Madina</Text>
          </View>

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
              <View style={[styles.menuIcon, { backgroundColor: "#e5f1fd" }]}>
                <Text style={styles.menuIconText}>👤</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Nom d’utilisateur</Text>
                <Text style={styles.menuSub}>{utilisateur?.nom}</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
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
              <View style={[styles.menuIcon, { backgroundColor: "#e5f1fd" }]}>
                <Text style={styles.menuIconText}>📱</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Téléphone</Text>
                <Text style={styles.menuSub}>
                  {utilisateur?.telephone || "Non renseigné"}
                </Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} disabled>
              <View style={[styles.menuIcon, { backgroundColor: "#f4faf7" }]}>
                <Text style={styles.menuIconText}>✉️</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Email</Text>
                <Text style={styles.menuSub}>{utilisateur?.email}</Text>
              </View>
            </TouchableOpacity>
          </View>

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
              <View style={[styles.menuIcon, { backgroundColor: "#fdf0e0" }]}>
                <Text style={styles.menuIconText}>🔒</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Changer le mot de passe</Text>
                <Text style={styles.menuSub}>Modifier votre mot de passe</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.deconnexionBtn}
            onPress={handleDeconnexion}
          >
            <Text style={styles.deconnexionText}>🚪 Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showNom}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNom(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Modifier le nom</Text>
            {error ? (
              <View style={styles.alertError}>
                <Text style={styles.alertErrorText}>{error}</Text>
              </View>
            ) : null}
            <Text style={styles.modalLabel}>Nouveau nom</Text>
            <TextInput
              style={styles.modalInput}
              value={nouveauNom}
              onChangeText={setNouveauNom}
              placeholder="Votre nom"
              placeholderTextColor="#9ab8a8"
            />
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={handleModifierNom}
              disabled={saving}
            >
              <Text style={styles.modalBtnText}>
                {saving ? "Enregistrement..." : "Enregistrer"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalBtnOutline}
              onPress={() => setShowNom(false)}
            >
              <Text style={styles.modalBtnOutlineText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showTel}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Modifier le téléphone</Text>
            {error ? (
              <View style={styles.alertError}>
                <Text style={styles.alertErrorText}>{error}</Text>
              </View>
            ) : null}
            <Text style={styles.modalLabel}>Numéro de téléphone</Text>
            <TextInput
              style={styles.modalInput}
              value={nouveauTel}
              onChangeText={setNouveauTel}
              placeholder="+269 XX XX XX XX"
              placeholderTextColor="#9ab8a8"
              keyboardType="phone-pad"
            />
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={handleModifierTel}
              disabled={saving}
            >
              <Text style={styles.modalBtnText}>
                {saving ? "Enregistrement..." : "Enregistrer"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalBtnOutline}
              onPress={() => setShowTel(false)}
            >
              <Text style={styles.modalBtnOutlineText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showMdp}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMdp(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Changer le mot de passe</Text>
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
            <Text style={styles.modalLabel}>Mot de passe actuel</Text>
            <TextInput
              style={styles.modalInput}
              value={ancienMdp}
              onChangeText={setAncienMdp}
              placeholder="••••••••"
              placeholderTextColor="#9ab8a8"
              secureTextEntry
            />
            <Text style={styles.modalLabel}>Nouveau mot de passe</Text>
            <TextInput
              style={styles.modalInput}
              value={nouveauMdp}
              onChangeText={setNouveauMdp}
              placeholder="••••••••"
              placeholderTextColor="#9ab8a8"
              secureTextEntry
            />
            <Text style={styles.modalLabel}>Confirmer le mot de passe</Text>
            <TextInput
              style={styles.modalInput}
              value={confirmMdp}
              onChangeText={setConfirmMdp}
              placeholder="••••••••"
              placeholderTextColor="#9ab8a8"
              secureTextEntry
            />
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={handleModifierMdp}
              disabled={saving}
            >
              <Text style={styles.modalBtnText}>
                {saving ? "Enregistrement..." : "Enregistrer"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalBtnOutline}
              onPress={() => setShowMdp(false)}
            >
              <Text style={styles.modalBtnOutlineText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
