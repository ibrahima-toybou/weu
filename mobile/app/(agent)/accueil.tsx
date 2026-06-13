import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { supabase } from "../supabase";
import { styles } from "./accueil.styles";

export default function AccueilAgent() {
  const [loading, setLoading] = useState(true);
  const [utilisateur, setUtilisateur] = useState<any>(null);
  const [points, setPoints] = useState<any[]>([]);
  const [pointages, setPointages] = useState<any[]>([]);
  const [menages, setMenages] = useState<any[]>([]);
  const [creationLoading, setCreationLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

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

    const [pointsRes, pointagesRes, menagesRes] = await Promise.all([
      supabase.from("point_collecte").select("*, secteur(nom)").order("nom"),
      supabase
        .from("pointage")
        .select("id_point")
        .eq("statut_sync", "synchronisé"),
      supabase.from("menage").select("id_point").eq("statut", "actif"),
    ]);

    setPoints(pointsRes.data || []);
    setPointages(pointagesRes.data || []);
    setMenages(menagesRes.data || []);
    setLoading(false);
  }

  const getNbPointages = (idPoint: number) =>
    pointages.filter((p) => p.id_point === idPoint).length;
  const getNbMenages = (idPoint: number) =>
    menages.filter((m) => m.id_point === idPoint).length;

  function getPct(idPoint: number) {
    const nb = getNbPointages(idPoint);
    const nm = getNbMenages(idPoint);
    if (nm === 0) return 0;
    return Math.min(Math.round((nb / nm) * 100), 100);
  }

  function getStatut(idPoint: number) {
    const pct = getPct(idPoint);
    if (pct >= 100) return "plein";
    if (pct >= 60) return "moyen";
    return "vide";
  }

  function getCouleur(statut: string) {
    if (statut === "plein") return "#c0392b";
    if (statut === "moyen") return "#e8a020";
    return "#1a8f69";
  }

  const pointsPleins = points.filter((p) => getStatut(p.id_point) === "plein");
  const pointsMoyens = points.filter((p) => getStatut(p.id_point) === "moyen");

  async function handleDeconnexion() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  async function accepterProposition(typeProposition: "immediate" | "demain") {
    setCreationLoading(true);

    const pointsConcernes =
      typeProposition === "immediate"
        ? pointsPleins
        : [...pointsPleins, ...pointsMoyens];

    if (pointsConcernes.length === 0) {
      setCreationLoading(false);
      return;
    }

    const date =
      typeProposition === "immediate"
        ? new Date().toISOString().split("T")[0]
        : new Date(Date.now() + 86400000).toISOString().split("T")[0];

    const { data: tournee, error } = await supabase
      .from("tournee")
      .insert({
        date,
        id_utilisateur: utilisateur.id_utilisateur,
        cree_par: utilisateur.id_utilisateur,
        notes:
          typeProposition === "immediate"
            ? "Tournée immédiate — points pleins"
            : "Tournée planifiée — points pleins et en remplissage",
      })
      .select()
      .single();

    if (error) {
      Alert.alert("Erreur", error.message);
      setCreationLoading(false);
      return;
    }

    Alert.alert(
      "✅ Tournée créée !",
      `${pointsConcernes.length} point(s) à vider. Rendez-vous dans l'onglet Tournée pour commencer.`,
    );

    setCreationLoading(false);
    router.push("/(agent)/tournee");
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
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerGreeting}>Bonjour 👋</Text>
            <Text style={styles.headerName}>{utilisateur?.nom}</Text>
            <Text style={styles.headerSub}>Agent de terrain · Madina</Text>
          </View>
          <TouchableOpacity
            onPress={handleDeconnexion}
            style={styles.deconnexionBtn}
          >
            <Text style={styles.deconnexionText}>Déconnexion</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          {/* Propositions */}
          <Text style={styles.cardLabel}>Propositions de tournées</Text>

          {pointsPleins.length === 0 && pointsMoyens.length === 0 ? (
            <View style={[styles.propositionCard, styles.propositionVide]}>
              <Text style={[styles.propositionTitle, { color: "#1a8f69" }]}>
                ✅ Tout va bien
              </Text>
              <Text style={styles.propositionPoints}>
                Aucun point ne nécessite de collecte pour le moment.
              </Text>
            </View>
          ) : (
            <>
              {pointsPleins.length > 0 && (
                <View
                  style={[styles.propositionCard, styles.propositionUrgent]}
                >
                  <View style={styles.propositionHeader}>
                    <Text
                      style={[styles.propositionTitle, { color: "#8b1a1a" }]}
                    >
                      🚨 Tournée immédiate
                    </Text>
                    <View
                      style={[
                        styles.propositionBadge,
                        { backgroundColor: "#fff" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.propositionBadgeText,
                          { color: "#8b1a1a" },
                        ]}
                      >
                        {pointsPleins.length} point(s)
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.propositionPoints}>
                    {pointsPleins.map((p) => p.nom).join(", ")} — Plein(s), à
                    vider aujourd’hui.
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.propositionBtn,
                      { backgroundColor: "#c0392b" },
                    ]}
                    onPress={() => accepterProposition("immediate")}
                    disabled={creationLoading}
                  >
                    <Text style={styles.propositionBtnText}>
                      {creationLoading
                        ? "Création..."
                        : "Accepter cette tournée"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {pointsMoyens.length > 0 && (
                <View
                  style={[styles.propositionCard, styles.propositionDemain]}
                >
                  <View style={styles.propositionHeader}>
                    <Text
                      style={[styles.propositionTitle, { color: "#7a4a00" }]}
                    >
                      📅 Tournée demain
                    </Text>
                    <View
                      style={[
                        styles.propositionBadge,
                        { backgroundColor: "#fff" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.propositionBadgeText,
                          { color: "#7a4a00" },
                        ]}
                      >
                        {pointsPleins.length + pointsMoyens.length} point(s)
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.propositionPoints}>
                    {[...pointsPleins, ...pointsMoyens]
                      .map((p) => p.nom)
                      .join(", ")}{" "}
                    — Inclut les points pleins et en remplissage.
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.propositionBtn,
                      { backgroundColor: "#e8a020" },
                    ]}
                    onPress={() => accepterProposition("demain")}
                    disabled={creationLoading}
                  >
                    <Text style={styles.propositionBtnText}>
                      {creationLoading
                        ? "Création..."
                        : "Planifier pour demain"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}

          {/* État des points */}
          <View style={[styles.card, { marginTop: 8 }]}>
            <Text style={styles.cardLabel}>État des points de collecte</Text>
            {points.map((p, i) => {
              const pct = getPct(p.id_point);
              const statut = getStatut(p.id_point);
              const isLast = i === points.length - 1;
              return (
                <View
                  key={p.id_point}
                  style={isLast ? styles.pointRowLast : styles.pointRow}
                >
                  <View
                    style={[
                      styles.statutDot,
                      { backgroundColor: getCouleur(statut) },
                    ]}
                  />
                  <View style={styles.pointInfo}>
                    <Text style={styles.pointNom}>{p.nom}</Text>
                    <Text style={styles.pointSecteur}>{p.secteur?.nom}</Text>
                  </View>
                  <Text
                    style={[styles.pointPct, { color: getCouleur(statut) }]}
                  >
                    {pct}%
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
