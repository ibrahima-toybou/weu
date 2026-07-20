import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../lib/supabase";
import { styles } from "../../styles/tabs/finances.styles";
import { colors } from "../../lib/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_KEY = "weu_finances_cache";

const CATEGORIES = [
  {
    key: "carburant",
    label: "Carburant",
    icon: "speedometer" as const,
    bg: "rgba(251,191,36,0.12)",
    iconColor: "#FBBF24",
    barColor: "#FBBF24",
  },
  {
    key: "salaire",
    label: "Salaire",
    icon: "briefcase" as const,
    bg: "rgba(59,130,246,0.12)",
    iconColor: "#3B82F6",
    barColor: "#3B82F6",
  },
  {
    key: "maintenance",
    label: "Maintenance",
    icon: "build" as const,
    bg: "rgba(45,212,191,0.12)",
    iconColor: "#2DD4BF",
    barColor: "#2DD4BF",
  },
  {
    key: "autre",
    label: "Autre",
    icon: "ellipsis-horizontal-circle" as const,
    bg: "rgba(15,23,42,0.06)",
    iconColor: "#8A90A0",
    barColor: "#8A90A0",
  },
];

export default function Finances() {
  const [loading, setLoading] = useState(true);
  const [cotisations, setCotisations] = useState<any[]>([]);
  const [depenses, setDepenses] = useState<any[]>([]);
  const [categorieSelectionnee, setCategorieSelectionnee] = useState<
    string | null
  >(null);

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
      setCotisations(data.cotisations || []);
      setDepenses(data.depenses || []);
      setLoading(false);
    }

    // Tenter le réseau
    const [cotisationsRes, depensesRes] = await Promise.all([
      supabase
        .from("cotisation")
        .select("montant, periode, statut")
        .eq("statut", "payé"),
      supabase.from("depense").select("*"),
    ]);

    if (cotisationsRes.error || depensesRes.error) {
      if (!cached) setLoading(false);
      return;
    }

    setCotisations(cotisationsRes.data || []);
    setDepenses(depensesRes.data || []);

    await AsyncStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        cotisations: cotisationsRes.data || [],
        depenses: depensesRes.data || [],
      }),
    );

    setLoading(false);
  }

  const moisActuel = new Date().toISOString().slice(0, 7);
  const anneeActuelle = new Date().getFullYear().toString();

  const cotisationsMois = cotisations
    .filter((c) => c.periode?.startsWith(moisActuel))
    .reduce((s, c) => s + parseFloat(c.montant || 0), 0);
  const cotisationsAnnee = cotisations
    .filter((c) => c.periode?.startsWith(anneeActuelle))
    .reduce((s, c) => s + parseFloat(c.montant || 0), 0);
  const depensesMois = depenses
    .filter((d) => d.date?.startsWith(moisActuel))
    .reduce((s, d) => s + parseFloat(d.montant || 0), 0);
  const depensesAnnee = depenses
    .filter((d) => d.date?.startsWith(anneeActuelle))
    .reduce((s, d) => s + parseFloat(d.montant || 0), 0);
  const soldeMois = cotisationsMois - depensesMois;
  const soldeAnnee = cotisationsAnnee - depensesAnnee;

  const depensesMoisActuel = depenses.filter((d) =>
    d.date?.startsWith(moisActuel),
  );
  const maxCategorie = Math.max(
    ...CATEGORIES.map((c) =>
      depensesMoisActuel
        .filter((d) => d.categorie === c.key)
        .reduce((s, d) => s + parseFloat(d.montant || 0), 0),
    ),
    1,
  );

  function getDepensesCategorie(cat: string) {
    return depensesMoisActuel.filter((d) => d.categorie === cat);
  }
  function getTotalCategorie(cat: string) {
    return getDepensesCategorie(cat).reduce(
      (s, d) => s + parseFloat(d.montant || 0),
      0,
    );
  }

  const moisLabel = new Date().toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
  const catInfo = CATEGORIES.find((c) => c.key === categorieSelectionnee);

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
            <Text style={styles.headerTitle}>Finances du quartier</Text>
            <Text style={styles.headerSub}>Transparence · {moisLabel}</Text>
          </LinearGradient>

          <View style={{ paddingHorizontal: 18, marginTop: -46, gap: 14 }}>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Solde du mois</Text>
              <View style={styles.soldeWrap}>
                <Text
                  style={[
                    styles.soldeVal,
                    { color: soldeMois >= 0 ? colors.green : colors.red },
                  ]}
                >
                  {soldeMois >= 0 ? "+" : ""}
                  {soldeMois.toLocaleString("fr-FR")} FC
                </Text>
                <Text style={styles.soldeLabel}>
                  {soldeMois >= 0 ? "Excédent" : "Déficit"} pour {moisLabel}
                </Text>
              </View>
              <View style={styles.kpiRow}>
                <View
                  style={[styles.kpiBox, { backgroundColor: colors.greenBg }]}
                >
                  <Text style={[styles.kpiVal, { color: colors.green }]}>
                    +{cotisationsMois.toLocaleString("fr-FR")}
                  </Text>
                  <Text style={styles.kpiLabel}>Cotisations FC</Text>
                </View>
                <View
                  style={[styles.kpiBox, { backgroundColor: colors.redBg }]}
                >
                  <Text style={[styles.kpiVal, { color: colors.red }]}>
                    -{depensesMois.toLocaleString("fr-FR")}
                  </Text>
                  <Text style={styles.kpiLabel}>Dépenses FC</Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>Total année {anneeActuelle}</Text>
              <View style={styles.kpiRow}>
                <View
                  style={[styles.kpiBox, { backgroundColor: colors.greenBg }]}
                >
                  <Text style={[styles.kpiVal, { color: colors.green }]}>
                    {cotisationsAnnee.toLocaleString("fr-FR")}
                  </Text>
                  <Text style={styles.kpiLabel}>Cotisations FC</Text>
                </View>
                <View
                  style={[styles.kpiBox, { backgroundColor: colors.redBg }]}
                >
                  <Text style={[styles.kpiVal, { color: colors.red }]}>
                    {depensesAnnee.toLocaleString("fr-FR")}
                  </Text>
                  <Text style={styles.kpiLabel}>Dépenses FC</Text>
                </View>
                <View
                  style={[
                    styles.kpiBox,
                    {
                      backgroundColor:
                        soldeAnnee >= 0 ? colors.greenBg : colors.redBg,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.kpiVal,
                      { color: soldeAnnee >= 0 ? colors.green : colors.red },
                    ]}
                  >
                    {soldeAnnee.toLocaleString("fr-FR")}
                  </Text>
                  <Text style={styles.kpiLabel}>Solde FC</Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>
                Dépenses par catégorie — {moisLabel}
              </Text>
              {CATEGORIES.map((cat, i) => {
                const total = getTotalCategorie(cat.key);
                const pct = (total / maxCategorie) * 100;
                const isLast = i === CATEGORIES.length - 1;
                return (
                  <TouchableOpacity
                    key={cat.key}
                    style={isLast ? styles.catItemLast : styles.catItem}
                    onPress={() => setCategorieSelectionnee(cat.key)}
                  >
                    <View style={[styles.catIcon, { backgroundColor: cat.bg }]}>
                      <Ionicons
                        name={cat.icon}
                        size={18}
                        color={cat.iconColor}
                      />
                    </View>
                    <View style={styles.catContent}>
                      <Text style={styles.catNom}>{cat.label}</Text>
                      <View style={styles.catBarTrack}>
                        <View
                          style={[
                            styles.catBarFill,
                            {
                              width: `${pct}%` as any,
                              backgroundColor: cat.barColor,
                            },
                          ]}
                        />
                      </View>
                    </View>
                    <Text style={styles.catMontant}>
                      {total > 0 ? `-${total.toLocaleString("fr-FR")}` : "0"}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={colors.border}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.infoCard}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Ionicons
                  name="bulb-outline"
                  size={18}
                  color={colors.tealDark}
                />
                <Text style={styles.infoTitle}>
                  À quoi servent vos cotisations ?
                </Text>
              </View>
              <Text style={styles.infoText}>
                Vos cotisations financent directement la collecte des déchets du
                quartier : le carburant du camion de collecte, le salaire de
                l&apos;agent de terrain, et l&apos;entretien du matériel et des
                points de collecte.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={categorieSelectionnee !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setCategorieSelectionnee(null)}
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
                marginBottom: 12,
              }}
            />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}
            >
              {catInfo && (
                <Ionicons
                  name={catInfo.icon}
                  size={20}
                  color={catInfo.iconColor}
                />
              )}
              <Text style={styles.modalTitle}>{catInfo?.label}</Text>
            </View>
            <Text style={styles.modalSub}>
              Détail des dépenses — {moisLabel}
            </Text>
            <View style={styles.modalTotal}>
              <Text style={styles.modalTotalVal}>
                {getTotalCategorie(categorieSelectionnee || "").toLocaleString(
                  "fr-FR",
                )}{" "}
                FC
              </Text>
              <Text style={styles.modalTotalLabel}>Total ce mois</Text>
            </View>
            <ScrollView style={{ maxHeight: 300 }}>
              {getDepensesCategorie(categorieSelectionnee || "").length ===
              0 ? (
                <Text
                  style={{
                    fontFamily: "InstrumentSans_400Regular",
                    textAlign: "center",
                    color: colors.textLabel,
                    fontSize: 13,
                    padding: 20,
                  }}
                >
                  Aucune dépense dans cette catégorie ce mois
                </Text>
              ) : (
                getDepensesCategorie(categorieSelectionnee || "").map(
                  (d, i) => (
                    <View key={i} style={styles.depenseItem}>
                      <View style={styles.depenseRow}>
                        <Text style={styles.depenseMontant}>
                          {parseFloat(d.montant).toLocaleString("fr-FR")} FC
                        </Text>
                        <Text style={styles.depenseDate}>
                          {new Date(d.date).toLocaleDateString("fr-FR")}
                        </Text>
                      </View>
                      {d.description && (
                        <Text style={styles.depenseDesc}>{d.description}</Text>
                      )}
                    </View>
                  ),
                )
              )}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setCategorieSelectionnee(null)}
            >
              <Text style={styles.closeBtnText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
