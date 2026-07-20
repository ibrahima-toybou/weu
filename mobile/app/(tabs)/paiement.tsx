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
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../lib/supabase";
import { styles } from "../../styles/tabs/paiement.styles";
import { colors } from "../../lib/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_KEY = "weu_paiement_cache";

export default function Paiement() {
  const [loading, setLoading] = useState(true);
  const [menage, setMenage] = useState<any>(null);
  const [toutesCotisations, setToutesCotisations] = useState<any[]>([]);
  const [moisSelectionne, setMoisSelectionne] = useState("");
  const [moisDisponibles, setMoisDisponibles] = useState<string[]>([]);

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
      setToutesCotisations(data.cotisations || []);
      setMoisDisponibles(data.moisDisponibles || []);
      setMoisSelectionne(data.moisSelectionne || "");
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
        "*, menage(id_menage, nom, date_inscription, point_collecte(nom), secteur(nom))",
      )
      .eq("auth_id", session.user.id)
      .single();

    if (error || !utilisateur) {
      if (!cached) setLoading(false);
      return;
    }

    const menageData = utilisateur?.menage;
    setMenage(menageData);

    const mois = getMoisDepuisInscription(menageData?.date_inscription);
    setMoisDisponibles(mois);

    const { data: cotisationsData } = await supabase
      .from("cotisation")
      .select("*")
      .eq("id_menage", menageData?.id_menage)
      .order("periode", { ascending: false });

    setToutesCotisations(cotisationsData || []);

    const premierNonPaye = mois.find((m) => {
      const cot = cotisationsData?.find((c) => c.periode?.startsWith(m));
      return !cot || cot.statut === "en_retard";
    });

    const selectedMois = premierNonPaye || mois[0] || "";
    setMoisSelectionne(selectedMois);

    await AsyncStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        menage: menageData,
        cotisations: cotisationsData || [],
        moisDisponibles: mois,
        moisSelectionne: selectedMois,
      }),
    );

    setLoading(false);
  }

  function getMoisDepuisInscription(dateInscription: string) {
    if (!dateInscription) return [];
    const inscription = new Date(dateInscription);
    const debut = new Date(
      inscription.getFullYear(),
      inscription.getMonth(),
      1,
    );
    const maintenant = new Date();
    const mois: string[] = [];
    let current = new Date(debut);
    while (current <= maintenant) {
      const annee = current.getFullYear();
      const moisNum = String(current.getMonth() + 1).padStart(2, "0");
      mois.push(`${annee}-${moisNum}`);
      current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    }
    return mois.reverse();
  }

  function getCotisationMois(mois: string) {
    return toutesCotisations.find((c) => c.periode?.startsWith(mois)) || null;
  }

  function getMoisLabel(mois: string) {
    if (!mois) return "—";
    return new Date(mois + "-01").toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });
  }

  function naviguerMois(direction: "prev" | "next") {
    const idx = moisDisponibles.indexOf(moisSelectionne);
    if (direction === "prev" && idx < moisDisponibles.length - 1)
      setMoisSelectionne(moisDisponibles[idx + 1]);
    if (direction === "next" && idx > 0)
      setMoisSelectionne(moisDisponibles[idx - 1]);
  }

  async function handlePayer() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: utilisateur } = await supabase
      .from("utilisateur")
      .select("id_utilisateur")
      .eq("auth_id", user!.id)
      .single();
    const cotisation = getCotisationMois(moisSelectionne);
    const periodeDebut = moisSelectionne + "-01";

    if (cotisation) {
      const { error } = await supabase
        .from("cotisation")
        .update({
          statut: "payé",
          date_paiement: new Date().toISOString().split("T")[0],
          mode_paiement: "mobile",
          montant: 3000,
          id_utilisateur: utilisateur?.id_utilisateur,
        })
        .eq("id_cotisation", cotisation.id_cotisation);
      if (error) {
        Alert.alert("Erreur", error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("cotisation").insert({
        id_menage: menage.id_menage,
        periode: periodeDebut,
        montant: 3000,
        statut: "payé",
        date_paiement: new Date().toISOString().split("T")[0],
        mode_paiement: "mobile",
        id_utilisateur: utilisateur?.id_utilisateur,
      });
      if (error) {
        Alert.alert("Erreur", error.message);
        return;
      }
    }

    Alert.alert(
      "Paiement enregistré !",
      `Cotisation ${getMoisLabel(moisSelectionne)} payée.`,
    );
    fetchData();
  }

  function getStatutInfo(statut: string | undefined) {
    if (statut === "payé")
      return {
        label: "Payée",
        color: colors.green,
        bg: colors.greenBg,
        icon: "checkmark-circle" as const,
      };
    if (statut === "exonéré")
      return {
        label: "Exonéré",
        color: colors.textLabel,
        bg: colors.bgPage,
        icon: "remove-circle" as const,
      };
    return {
      label: "En retard",
      color: colors.red,
      bg: colors.redBg,
      icon: "alert-circle" as const,
    };
  }

  const cotisationSelectionnee = getCotisationMois(moisSelectionne);
  const statutInfo = getStatutInfo(cotisationSelectionnee?.statut);
  const idxActuel = moisDisponibles.indexOf(moisSelectionne);
  const peutAllerPrev = idxActuel < moisDisponibles.length - 1;
  const peutAllerNext = idxActuel > 0;
  const nbPayes = moisDisponibles.filter(
    (m) => getCotisationMois(m)?.statut === "payé",
  ).length;
  const nbRetard = moisDisponibles.filter((m) => {
    const c = getCotisationMois(m);
    return !c || c.statut === "en_retard";
  }).length;

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
            <Text style={styles.headerTitle}>Mes cotisations</Text>
            <Text style={styles.headerSub}>{menage?.nom}</Text>
          </LinearGradient>

          <View style={{ paddingHorizontal: 18, marginTop: -46, gap: 14 }}>
            <View style={styles.statsRow}>
              <View
                style={[
                  styles.statBox,
                  {
                    backgroundColor: "rgba(255,255,255,0.85)",
                    borderColor: "rgba(255,255,255,0.4)",
                  },
                ]}
              >
                <Text style={[styles.statBoxVal, { color: colors.green }]}>
                  {nbPayes}
                </Text>
                <Text style={styles.statBoxLabel}>Payés</Text>
              </View>
              <View
                style={[
                  styles.statBox,
                  {
                    backgroundColor:
                      nbRetard > 0
                        ? "rgba(251,113,133,0.25)"
                        : "rgba(255,255,255,0.85)",
                    borderColor:
                      nbRetard > 0
                        ? colors.red + "60"
                        : "rgba(255,255,255,0.4)",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statBoxVal,
                    { color: nbRetard > 0 ? colors.red : colors.textLabel },
                  ]}
                >
                  {nbRetard}
                </Text>
                <Text style={styles.statBoxLabel}>En retard</Text>
              </View>
              <View
                style={[
                  styles.statBox,
                  {
                    backgroundColor: "rgba(255,255,255,0.85)",
                    borderColor: "rgba(255,255,255,0.4)",
                  },
                ]}
              >
                <Text style={[styles.statBoxVal, { color: colors.teal }]}>
                  {moisDisponibles.length}
                </Text>
                <Text style={styles.statBoxLabel}>Total mois</Text>
              </View>
            </View>

            <View style={styles.moisNav}>
              <TouchableOpacity
                onPress={() => naviguerMois("prev")}
                disabled={!peutAllerPrev}
                style={[
                  styles.moisNavBtn,
                  { opacity: peutAllerPrev ? 1 : 0.3 },
                ]}
              >
                <Ionicons
                  name="chevron-back"
                  size={20}
                  color={colors.tealDark}
                />
              </TouchableOpacity>
              <View style={{ alignItems: "center" }}>
                <Text style={styles.moisLabel}>
                  {getMoisLabel(moisSelectionne)}
                </Text>
                {nbRetard > 0 && !cotisationSelectionnee?.statut && (
                  <Text style={styles.moisSub}>Mois non payé</Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => naviguerMois("next")}
                disabled={!peutAllerNext}
                style={[
                  styles.moisNavBtn,
                  { opacity: peutAllerNext ? 1 : 0.3 },
                ]}
              >
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.tealDark}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>Récapitulatif</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ménage</Text>
                <Text style={styles.infoVal}>{menage?.nom}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Point de collecte</Text>
                <Text style={styles.infoVal}>
                  {menage?.point_collecte?.nom}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Période</Text>
                <Text style={styles.infoVal}>
                  {getMoisLabel(moisSelectionne)}
                </Text>
              </View>
              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.infoLabel}>Montant</Text>
                <Text style={styles.infoValGreen}>3 000 FC</Text>
              </View>
              <View
                style={[styles.statutBadge, { backgroundColor: statutInfo.bg }]}
              >
                <Ionicons
                  name={statutInfo.icon}
                  size={14}
                  color={statutInfo.color}
                />
                <Text style={[styles.statutText, { color: statutInfo.color }]}>
                  {statutInfo.label}
                </Text>
              </View>
            </View>

            {cotisationSelectionnee?.statut === "payé" ? (
              <View
                style={[
                  styles.dejaPaye,
                  {
                    backgroundColor: colors.greenBg,
                    borderColor: colors.green + "40",
                  },
                ]}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={36}
                  color={colors.green}
                />
                <Text style={[styles.dejaPayeTitle, { color: colors.green }]}>
                  Cotisation payée !
                </Text>
                <Text style={styles.dejaPayeDate}>
                  Payée le{" "}
                  {new Date(
                    cotisationSelectionnee.date_paiement,
                  ).toLocaleDateString("fr-FR")}{" "}
                  · {cotisationSelectionnee.mode_paiement}
                </Text>
              </View>
            ) : cotisationSelectionnee?.statut === "exonéré" ? (
              <View
                style={[
                  styles.dejaPaye,
                  {
                    backgroundColor: colors.bgPage,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="remove-circle"
                  size={36}
                  color={colors.textLabel}
                />
                <Text
                  style={[styles.dejaPayeTitle, { color: colors.textLabel }]}
                >
                  Exonéré ce mois
                </Text>
                <Text style={styles.dejaPayeDate}>
                  Vous êtes exonéré pour {getMoisLabel(moisSelectionne)}
                </Text>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert(
                      "Paiement mobile",
                      "Cette fonctionnalité sera disponible prochainement.",
                    )
                  }
                  activeOpacity={0.88}
                >
                  <LinearGradient
                    colors={["#2DD4BF", "#2BB6CC", "#3B82F6"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      styles.btnMobile,
                      { borderRadius: 16, padding: 18 },
                    ]}
                  >
                    <Ionicons
                      name="phone-portrait-outline"
                      size={20}
                      color="#0E1210"
                    />
                    <Text style={styles.btnMobileText}>Paiement mobile</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.separateur}>
                  <View style={styles.separateurLine} />
                  <Text style={styles.separateurText}>ou</Text>
                  <View style={styles.separateurLine} />
                </View>

                <View style={styles.cashCard}>
                  <Ionicons
                    name="cash-outline"
                    size={22}
                    color={colors.tealDark}
                  />
                  <Text style={styles.cashTitle}>Payer en cash</Text>
                  <Text style={styles.cashDesc}>
                    Remettez 3 000 FC à l&apos;agent de votre secteur. Il
                    enregistrera votre paiement dans le système.
                  </Text>
                </View>
              </>
            )}

            <Text style={[styles.cardLabel, { marginTop: 8 }]}>
              Tous les mois
            </Text>
            {moisDisponibles.map((mois, i) => {
              const cot = getCotisationMois(mois);
              const statut = cot?.statut || "en_retard";
              const isSelected = mois === moisSelectionne;
              const info = getStatutInfo(statut);
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => setMoisSelectionne(mois)}
                  style={[
                    styles.moisItem,
                    isSelected && styles.moisItemSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.moisItemLabel,
                      isSelected && styles.moisItemLabelSelected,
                    ]}
                  >
                    {getMoisLabel(mois)}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 5,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 999,
                      backgroundColor: info.bg,
                    }}
                  >
                    <Ionicons name={info.icon} size={12} color={info.color} />
                    <Text
                      style={{
                        fontFamily: "InstrumentSans_600SemiBold",
                        fontSize: 11,
                        color: info.color,
                      }}
                    >
                      {info.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
