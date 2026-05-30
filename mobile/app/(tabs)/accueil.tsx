import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "../supabase";

export default function Accueil() {
  const [loading, setLoading] = useState(true);
  const [utilisateur, setUtilisateur] = useState<any>(null);
  const [menage, setMenage] = useState<any>(null);
  const [point, setPoint] = useState<any>(null);
  const [cotisation, setCotisation] = useState<any>(null);
  const [nbPointages, setNbPointages] = useState(0);
  const [nbMenagesPoint, setNbMenagesPoint] = useState(0);
  const [pointageLoading, setPointageLoading] = useState(false);

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

    // Récupérer l'utilisateur
    const { data: utilisateurData } = await supabase
      .from("utilisateur")
      .select("*, menage(*, point_collecte(*, secteur(nom)), secteur(nom))")
      .eq("auth_id", user.id)
      .single();

    if (!utilisateurData) {
      router.replace("/");
      return;
    }

    setUtilisateur(utilisateurData);
    setMenage(utilisateurData.menage);

    const idPoint = utilisateurData.menage?.id_point;

    if (idPoint) {
      setPoint(utilisateurData.menage?.point_collecte);

      // Nombre de pointages sur ce point
      const { data: pointagesData } = await supabase
        .from("pointage")
        .select("id_pointage")
        .eq("id_point", idPoint)
        .eq("statut_sync", "synchronisé");

      setNbPointages(pointagesData?.length || 0);

      // Nombre de ménages affectés à ce point
      const { data: menagesData } = await supabase
        .from("menage")
        .select("id_menage")
        .eq("id_point", idPoint)
        .eq("statut", "actif");

      setNbMenagesPoint(menagesData?.length || 0);
    }

    // Cotisation du mois en cours
    const moisActuel = new Date().toISOString().slice(0, 7);
    const { data: cotisationData } = await supabase
      .from("cotisation")
      .select("*")
      .eq("id_menage", utilisateurData.menage?.id_menage)
      .like("periode", `${moisActuel}%`)
      .single();

    setCotisation(cotisationData);
    setLoading(false);
  }

  async function handlePointage() {
    setPointageLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("pointage").insert({
      id_menage: menage.id_menage,
      id_utilisateur: utilisateur.id_utilisateur,
      id_point: menage.id_point,
      date_heure: new Date().toISOString(),
      statut_sync: "synchronisé",
    });

    if (error) {
      Alert.alert("Erreur", "Impossible d'enregistrer le pointage");
    } else {
      Alert.alert(
        "✅ Dépôt enregistré !",
        `Point ${point?.nom} · ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`,
      );
      fetchData();
    }

    setPointageLoading(false);
  }

  async function handleDeconnexion() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  function getPct() {
    if (nbMenagesPoint === 0) return 0;
    return Math.min(Math.round((nbPointages / nbMenagesPoint) * 100), 100);
  }

  function getStatutPoint() {
    const pct = getPct();
    if (pct >= 100) return { label: "Plein", color: "#c0392b", bg: "#fdecea" };
    if (pct >= 60)
      return { label: "En remplissage", color: "#e8a020", bg: "#fdf0e0" };
    return { label: "Disponible", color: "#1a8f69", bg: "#e6f5ec" };
  }

  const statutPoint = getStatutPoint();
  const moisLabel = new Date().toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#1a8f69" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerGreeting}>Bonjour 👋</Text>
              <Text style={styles.headerName}>{menage?.nom || "Famille"}</Text>
              <Text style={styles.headerSub}>
                {menage?.secteur?.nom} · {point?.nom}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleDeconnexion}
              style={styles.deconnexionBtn}
            >
              <Text style={styles.deconnexionText}>Déconnexion</Text>
            </TouchableOpacity>
          </View>

          {/* Cotisation dans le header */}
          <View style={styles.cotisationInHeader}>
            <View style={styles.cotisationLeft}>
              <Text style={styles.cotisationMoisLabel}>
                Cotisation — {moisLabel}
              </Text>
              <Text style={styles.cotisationStatut}>
                {cotisation?.statut === "payé"
                  ? "✓ Payée"
                  : cotisation?.statut === "exonéré"
                    ? "🔘 Exonéré"
                    : "⚠️ En retard"}
              </Text>
            </View>
            {cotisation?.statut !== "payé" &&
              cotisation?.statut !== "exonéré" && (
                <TouchableOpacity
                  style={styles.payerBtn}
                  onPress={() => router.push("/paiement")}
                >
                  <Text style={styles.payerBtnText}>Payer →</Text>
                </TouchableOpacity>
              )}
          </View>
        </View>

        <View style={styles.body}>
          {/* Point de collecte */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Mon point de collecte</Text>
            <View style={styles.pointHeader}>
              <View>
                <Text style={styles.pointNom}>{point?.nom}</Text>
                <Text style={styles.pointSecteur}>
                  Secteur {point?.secteur?.nom}
                </Text>
              </View>
              <View
                style={[
                  styles.statutBadge,
                  { backgroundColor: statutPoint.bg },
                ]}
              >
                <Text style={[styles.statutText, { color: statutPoint.color }]}>
                  {statutPoint.label}
                </Text>
              </View>
            </View>

            <View style={styles.barWrap}>
              <View style={styles.barLabelRow}>
                <Text style={styles.barLabelText}>Remplissage</Text>
                <Text style={styles.barPct}>{getPct()}%</Text>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${getPct()}%`,
                      backgroundColor:
                        getPct() >= 100
                          ? "#c0392b"
                          : getPct() >= 60
                            ? "#e8a020"
                            : "#1a8f69",
                    },
                  ]}
                />
              </View>
            </View>

            <Text style={styles.pointInfo}>
              {nbPointages} dépôt(s) · {nbMenagesPoint} ménage(s) affecté(s)
            </Text>
          </View>

          {/* Bouton pointage */}
          <TouchableOpacity
            style={[
              styles.pointageBtn,
              pointageLoading && styles.pointageBtnDisabled,
            ]}
            onPress={handlePointage}
            disabled={pointageLoading}
            activeOpacity={0.85}
          >
            {pointageLoading ? (
              <ActivityIndicator color="#fff" size="large" />
            ) : (
              <>
                <Text style={styles.pointageBtnIcon}>📍</Text>
                <Text style={styles.pointageBtnText}>
                  Je dépose mes déchets
                </Text>
                <Text style={styles.pointageBtnSub}>
                  Appuyez pour enregistrer votre dépôt
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

import { styles } from "./accueil.styles";
