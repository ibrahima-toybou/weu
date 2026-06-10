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
import { styles } from "./paiement.styles";

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
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/");
      return;
    }

    const { data: utilisateur } = await supabase
      .from("utilisateur")
      .select(
        "*, menage(id_menage, nom, date_inscription, point_collecte(nom), secteur(nom))",
      )
      .eq("auth_id", user.id)
      .single();

    const menageData = utilisateur?.menage;
    setMenage(menageData);

    // Calculer tous les mois depuis l'inscription
    const mois = getMoisDepuisInscription(menageData?.date_inscription);
    setMoisDisponibles(mois);

    // Récupérer toutes les cotisations
    const { data: cotisationsData } = await supabase
      .from("cotisation")
      .select("*")
      .eq("id_menage", menageData?.id_menage)
      .order("periode", { ascending: false });

    setToutesCotisations(cotisationsData || []);

    // Trouver le premier mois non payé en priorité
    const premierNonPaye = mois.find((m) => {
      const cot = cotisationsData?.find((c) => c.periode?.startsWith(m));
      return !cot || cot.statut === "en_retard";
    });

    setMoisSelectionne(premierNonPaye || mois[0] || "");
    setLoading(false);
  }

  function getMoisDepuisInscription(dateInscription: string) {
    if (!dateInscription) return [];
    const inscription = new Date(dateInscription);
    const debut = new Date(
      inscription.getFullYear(),
      inscription.getMonth() + 1,
      1,
    );
    const maintenant = new Date();
    const mois: string[] = [];

    let current = new Date(debut);
    while (current <= maintenant) {
      mois.push(current.toISOString().slice(0, 7));
      current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    }

    return mois.reverse(); // Plus récent en premier
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
    if (direction === "prev" && idx < moisDisponibles.length - 1) {
      setMoisSelectionne(moisDisponibles[idx + 1]);
    }
    if (direction === "next" && idx > 0) {
      setMoisSelectionne(moisDisponibles[idx - 1]);
    }
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
      "✅ Paiement enregistré !",
      `Cotisation ${getMoisLabel(moisSelectionne)} payée.`,
    );
    fetchData();
  }

  const cotisationSelectionnee = getCotisationMois(moisSelectionne);
  const idxActuel = moisDisponibles.indexOf(moisSelectionne);
  const peutAllerPrev = idxActuel < moisDisponibles.length - 1;
  const peutAllerNext = idxActuel > 0;

  // Résumé global
  const nbPayes = moisDisponibles.filter((m) => {
    const c = getCotisationMois(m);
    return c?.statut === "payé";
  }).length;
  const nbRetard = moisDisponibles.filter((m) => {
    const c = getCotisationMois(m);
    return !c || c.statut === "en_retard";
  }).length;

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
          <Text style={styles.headerTitle}>Mes cotisations</Text>
          <Text
            style={[
              styles.headerTitle,
              { fontSize: 13, fontWeight: "500", opacity: 0.8, marginTop: 4 },
            ]}
          >
            {menage?.nom}
          </Text>
        </View>

        <View style={styles.body}>
          {/* Résumé global */}
          <View style={[styles.card, { flexDirection: "row", gap: 10 }]}>
            <View
              style={{
                flex: 1,
                alignItems: "center",
                padding: 10,
                backgroundColor: "#e6f5ec",
                borderRadius: 12,
              }}
            >
              <Text
                style={{ fontSize: 22, fontWeight: "800", color: "#1a8f69" }}
              >
                {nbPayes}
              </Text>
              <Text style={{ fontSize: 11, color: "#4a6a58", marginTop: 2 }}>
                Payés
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                alignItems: "center",
                padding: 10,
                backgroundColor: nbRetard > 0 ? "#fdecea" : "#f4faf7",
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "800",
                  color: nbRetard > 0 ? "#c0392b" : "#7a9c8a",
                }}
              >
                {nbRetard}
              </Text>
              <Text style={{ fontSize: 11, color: "#4a6a58", marginTop: 2 }}>
                En retard
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                alignItems: "center",
                padding: 10,
                backgroundColor: "#f4faf7",
                borderRadius: 12,
              }}
            >
              <Text
                style={{ fontSize: 22, fontWeight: "800", color: "#0d6349" }}
              >
                {moisDisponibles.length}
              </Text>
              <Text style={{ fontSize: 11, color: "#4a6a58", marginTop: 2 }}>
                Total mois
              </Text>
            </View>
          </View>

          {/* Sélecteur de mois */}
          <View
            style={[
              styles.card,
              {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 14,
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => naviguerMois("prev")}
              disabled={!peutAllerPrev}
              style={{ padding: 8, opacity: peutAllerPrev ? 1 : 0.3 }}
            >
              <Text style={{ fontSize: 22, color: "#1a8f69" }}>‹</Text>
            </TouchableOpacity>
            <View style={{ alignItems: "center" }}>
              <Text
                style={{ fontSize: 16, fontWeight: "800", color: "#0d1f16" }}
              >
                {getMoisLabel(moisSelectionne)}
              </Text>
              {nbRetard > 0 && !cotisationSelectionnee?.statut && (
                <Text style={{ fontSize: 11, color: "#c0392b", marginTop: 2 }}>
                  ⚠️ Mois en retard affiché en priorité
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={() => naviguerMois("next")}
              disabled={!peutAllerNext}
              style={{ padding: 8, opacity: peutAllerNext ? 1 : 0.3 }}
            >
              <Text style={{ fontSize: 22, color: "#1a8f69" }}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Récapitulatif du mois sélectionné */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Récapitulatif</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ménage</Text>
              <Text style={styles.infoVal}>{menage?.nom}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Point de collecte</Text>
              <Text style={styles.infoVal}>{menage?.point_collecte?.nom}</Text>
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
              style={[
                styles.statutBadge,
                {
                  backgroundColor:
                    cotisationSelectionnee?.statut === "payé"
                      ? "#e6f5ec"
                      : cotisationSelectionnee?.statut === "exonéré"
                        ? "#f4faf7"
                        : "#fdecea",
                },
              ]}
            >
              <Text
                style={[
                  styles.statutText,
                  {
                    color:
                      cotisationSelectionnee?.statut === "payé"
                        ? "#0d6349"
                        : cotisationSelectionnee?.statut === "exonéré"
                          ? "#7a9c8a"
                          : "#c0392b",
                  },
                ]}
              >
                {cotisationSelectionnee?.statut === "payé"
                  ? "✓ Payée"
                  : cotisationSelectionnee?.statut === "exonéré"
                    ? "🔘 Exonéré"
                    : "⚠️ En retard"}
              </Text>
            </View>
          </View>

          {/* Actions selon statut */}
          {cotisationSelectionnee?.statut === "payé" ? (
            <View style={styles.dejaPaye}>
              <Text style={styles.dejaPayeIcon}>✅</Text>
              <Text style={styles.dejaPayeTitle}>Cotisation payée !</Text>
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
                { backgroundColor: "#f4faf7", borderColor: "#c0ddd0" },
              ]}
            >
              <Text style={styles.dejaPayeIcon}>🔘</Text>
              <Text style={[styles.dejaPayeTitle, { color: "#4a6a58" }]}>
                Exonéré ce mois
              </Text>
              <Text style={styles.dejaPayeDate}>
                Vous êtes exonéré pour {getMoisLabel(moisSelectionne)}
              </Text>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={styles.btnMobile}
                onPress={() =>
                  Alert.alert(
                    "Paiement mobile",
                    "Cette fonctionnalité sera disponible prochainement.",
                  )
                }
              >
                <Text style={styles.btnMobileIcon}>📱</Text>
                <Text style={styles.btnMobileText}>Paiement mobile</Text>
              </TouchableOpacity>

              <View style={styles.separateur}>
                <View style={styles.separateurLine} />
                <Text style={styles.separateurText}>ou</Text>
                <View style={styles.separateurLine} />
              </View>

              <View style={styles.cashCard}>
                <Text style={styles.cashTitle}>💵 Payer en cash</Text>
                <Text style={styles.cashDesc}>
                  Remettez 3 000 FC à l'agent de votre secteur. Il enregistrera
                  votre paiement dans le système.
                </Text>
              </View>
            </>
          )}

          {/* Liste de tous les mois */}
          <Text style={[styles.cardLabel, { marginTop: 16, marginBottom: 8 }]}>
            TOUS LES MOIS
          </Text>
          {moisDisponibles.map((mois, i) => {
            const cot = getCotisationMois(mois);
            const statut = cot?.statut || "en_retard";
            const isSelected = mois === moisSelectionne;
            return (
              <TouchableOpacity
                key={i}
                onPress={() => setMoisSelectionne(mois)}
                style={{
                  backgroundColor: isSelected ? "#e6f5ec" : "#fff",
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderWidth: 1,
                  borderColor: isSelected ? "#1a8f69" : "#e0f0e8",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: isSelected ? "700" : "500",
                    color: "#0d1f16",
                  }}
                >
                  {getMoisLabel(mois)}
                </Text>
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 20,
                    backgroundColor:
                      statut === "payé"
                        ? "#e6f5ec"
                        : statut === "exonéré"
                          ? "#f4faf7"
                          : "#fdecea",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "700",
                      color:
                        statut === "payé"
                          ? "#0d6349"
                          : statut === "exonéré"
                            ? "#7a9c8a"
                            : "#c0392b",
                    }}
                  >
                    {statut === "payé"
                      ? "✓ Payé"
                      : statut === "exonéré"
                        ? "Exonéré"
                        : "⚠️ En retard"}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
