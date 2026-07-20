import { useState, useCallback } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../lib/supabase";
import { styles } from "../../styles/tabs/historique.styles";
import { colors } from "../../lib/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_KEY = "weu_historique_cache";

export default function Historique() {
  const [loading, setLoading] = useState(true);
  const [menage, setMenage] = useState<any>(null);
  const [pointages, setPointages] = useState<any[]>([]);
  const [cotisations, setCotisations] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

  async function fetchData() {
    // Cache d'abord
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      const data = JSON.parse(cached);
      setMenage(data.menage);
      setPointages(data.pointages || []);
      setCotisations(data.cotisations || []);
      setLoading(false);
    }

    // Tenter le réseau
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      router.replace("/");
      return;
    }

    const { data: utilisateur, error } = await supabase
      .from("utilisateur")
      .select(
        "*, menage(id_menage, nom, date_inscription, point_collecte(nom))",
      )
      .eq("auth_id", session.user.id)
      .single();

    if (error || !utilisateur) {
      if (!cached) setLoading(false);
      return;
    }

    setMenage(utilisateur?.menage);
    const idMenage = utilisateur?.menage?.id_menage;

    let pointagesData: any[] = [];
    let cotisationsData: any[] = [];

    if (idMenage) {
      const { data: pData } = await supabase
        .from("pointage")
        .select("*, point_collecte(nom)")
        .eq("id_menage", idMenage)
        .order("date_heure", { ascending: false })
        .limit(10);
      pointagesData = pData || [];
      setPointages(pointagesData);

      const { data: cData } = await supabase
        .from("cotisation")
        .select("*")
        .eq("id_menage", idMenage)
        .order("periode", { ascending: false });
      cotisationsData = cData || [];
      setCotisations(cotisationsData);
    }

    await AsyncStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        menage: utilisateur?.menage,
        pointages: pointagesData,
        cotisations: cotisationsData,
      }),
    );

    setLoading(false);
  }

  function getNbMoisDepuisInscription() {
    if (!menage?.date_inscription) return 0;
    const inscription = new Date(menage.date_inscription);
    const debut = new Date(
      inscription.getFullYear(),
      inscription.getMonth(),
      1,
    );
    const maintenant = new Date();
    const mois =
      (maintenant.getFullYear() - debut.getFullYear()) * 12 +
      (maintenant.getMonth() - debut.getMonth()) +
      1;
    return Math.max(0, mois);
  }

  function getPeriodeLabel(periode: string) {
    if (!periode) return "—";
    return new Date(periode).toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });
  }

  function formatDate(d: string) {
    if (!d) return "—";
    return (
      new Date(d).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
      }) +
      " · " +
      new Date(d).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }

  function getPointageStatut(statut_sync: string) {
    if (statut_sync === "synchronisé")
      return { color: colors.green, bg: colors.greenBg, label: "Sync" };
    if (statut_sync === "archivé")
      return { color: colors.textLabel, bg: colors.bgPage, label: "Vidé ✓" };
    return { color: colors.amber, bg: colors.amberBg, label: "Attente" };
  }

  function getCotisationStatut(statut: string) {
    if (statut === "payé")
      return { color: "#3B82F6", bg: "rgba(59,130,246,0.12)", label: "Payé" };
    if (statut === "exonéré")
      return { color: colors.textLabel, bg: colors.bgPage, label: "Exonéré" };
    return { color: colors.red, bg: colors.redBg, label: "Retard" };
  }

  const moisActuel = new Date().toISOString().slice(0, 7);
  const pointagesMoisActuel = pointages.filter((p) =>
    p.date_heure?.startsWith(moisActuel),
  ).length;
  const nbMoisDepuis = getNbMoisDepuisInscription();
  const moisPayes = cotisations.filter((c) => c.statut === "payé").length;
  const tauxColor =
    nbMoisDepuis === 0
      ? colors.textLabel
      : moisPayes >= nbMoisDepuis
        ? colors.green
        : moisPayes >= nbMoisDepuis * 0.7
          ? colors.amber
          : colors.red;

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={colors.teal} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        <View style={{ overflow: "hidden" }}>
          <LinearGradient
            colors={["#2DD4BF", "#20B8C4", "#3B82F6", "#3B82F6", "#F4F5F8"]}
            locations={[0, 0.25, 0.55, 0.72, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ paddingTop: 56, paddingHorizontal: 24, paddingBottom: 80 }}
          >
            <Text style={styles.headerTitle}>Mon historique</Text>
            <Text style={styles.headerSub}>{menage?.nom}</Text>
          </LinearGradient>

          <View style={styles.body}>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={[styles.statVal, { color: colors.teal }]}>
                  {pointagesMoisActuel}
                </Text>
                <Text style={styles.statLabel}>Dépôts ce mois</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statVal, { color: "#3B82F6" }]}>
                  {pointages.length}
                </Text>
                <Text style={styles.statLabel}>Total dépôts</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statVal, { color: tauxColor }]}>
                  {moisPayes}/{nbMoisDepuis}
                </Text>
                <Text style={styles.statLabel}>Mois payés</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Mes dépôts récents</Text>
            {pointages.length === 0 ? (
              <Text style={styles.empty}>Aucun dépôt enregistré</Text>
            ) : (
              pointages.map((p, i) => {
                const s = getPointageStatut(p.statut_sync);
                return (
                  <View key={i} style={styles.item}>
                    <View
                      style={[styles.itemDot, { backgroundColor: s.color }]}
                    />
                    <View style={styles.itemContent}>
                      <Text style={styles.itemTitle}>
                        {p.point_collecte?.nom}
                      </Text>
                      <Text style={styles.itemSub}>
                        {formatDate(p.date_heure)}
                      </Text>
                    </View>
                    <View style={[styles.itemBadge, { backgroundColor: s.bg }]}>
                      <Text style={[styles.itemBadgeText, { color: s.color }]}>
                        {s.label}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}

            <Text style={[styles.sectionTitle, { marginTop: 8 }]}>
              Mes cotisations
            </Text>
            {cotisations.length === 0 ? (
              <Text style={styles.empty}>Aucune cotisation enregistrée</Text>
            ) : (
              cotisations.map((c, i) => {
                const s = getCotisationStatut(c.statut);
                return (
                  <View key={i} style={styles.item}>
                    <View
                      style={[styles.itemDot, { backgroundColor: s.color }]}
                    />
                    <View style={styles.itemContent}>
                      <Text style={styles.itemTitle}>
                        {getPeriodeLabel(c.periode)}
                      </Text>
                      <Text style={styles.itemSub}>
                        {c.statut === "payé"
                          ? `Payé le ${new Date(c.date_paiement).toLocaleDateString("fr-FR")} · ${c.mode_paiement}`
                          : c.statut === "exonéré"
                            ? "Exonéré"
                            : "En retard"}
                      </Text>
                    </View>
                    <View style={[styles.itemBadge, { backgroundColor: s.bg }]}>
                      <Text style={[styles.itemBadgeText, { color: s.color }]}>
                        {s.label}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
