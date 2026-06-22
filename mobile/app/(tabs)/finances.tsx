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
import { supabase } from "../supabase";
import { styles } from "./finances.styles";

const CATEGORIES = [
  {
    key: "carburant",
    label: "Carburant",
    icon: "speedometer" as const,
    color: "#fdf0e0",
    iconColor: "#e8a020",
    barColor: "#e8a020",
  },
  {
    key: "salaire",
    label: "Salaire",
    icon: "briefcase" as const,
    color: "#e5f1fd",
    iconColor: "#1a5c99",
    barColor: "#1a5c99",
  },
  {
    key: "maintenance",
    label: "Maintenance",
    icon: "build" as const,
    color: "#f4faf7",
    iconColor: "#7a9c8a",
    barColor: "#7a9c8a",
  },
  {
    key: "autre",
    label: "Autre",
    icon: "ellipsis-horizontal-circle" as const,
    color: "#f4faf7",
    iconColor: "#9b8aa6",
    barColor: "#9b8aa6",
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
    setLoading(true);

    const [cotisationsRes, depensesRes] = await Promise.all([
      supabase
        .from("cotisation")
        .select("montant, periode, statut")
        .eq("statut", "payé"),
      supabase.from("depense").select("*"),
    ]);

    setCotisations(cotisationsRes.data || []);
    setDepenses(depensesRes.data || []);
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
        <ActivityIndicator size="large" color="#1a8f69" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Finances du quartier</Text>
          <Text style={styles.headerSub}>
            Transparence sur les cotisations · {moisLabel}
          </Text>
        </View>

        <View style={styles.body}>
          {/* Solde du mois */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Solde du mois</Text>
            <View style={styles.soldeWrap}>
              <Text
                style={[
                  styles.soldeVal,
                  { color: soldeMois >= 0 ? "#1a8f69" : "#c0392b" },
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
              <View style={[styles.kpiBox, { backgroundColor: "#e6f5ec" }]}>
                <Text style={[styles.kpiVal, { color: "#1a8f69" }]}>
                  +{cotisationsMois.toLocaleString("fr-FR")}
                </Text>
                <Text style={styles.kpiLabel}>Cotisations FC</Text>
              </View>
              <View style={[styles.kpiBox, { backgroundColor: "#fdecea" }]}>
                <Text style={[styles.kpiVal, { color: "#c0392b" }]}>
                  -{depensesMois.toLocaleString("fr-FR")}
                </Text>
                <Text style={styles.kpiLabel}>Dépenses FC</Text>
              </View>
            </View>
          </View>

          {/* Année */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Total année {anneeActuelle}</Text>
            <View style={styles.kpiRow}>
              <View style={[styles.kpiBox, { backgroundColor: "#e6f5ec" }]}>
                <Text style={[styles.kpiVal, { color: "#1a8f69" }]}>
                  {cotisationsAnnee.toLocaleString("fr-FR")}
                </Text>
                <Text style={styles.kpiLabel}>Cotisations FC</Text>
              </View>
              <View style={[styles.kpiBox, { backgroundColor: "#fdecea" }]}>
                <Text style={[styles.kpiVal, { color: "#c0392b" }]}>
                  {depensesAnnee.toLocaleString("fr-FR")}
                </Text>
                <Text style={styles.kpiLabel}>Dépenses FC</Text>
              </View>
              <View style={[styles.kpiBox, { backgroundColor: "#f4faf7" }]}>
                <Text
                  style={[
                    styles.kpiVal,
                    { color: soldeAnnee >= 0 ? "#1a8f69" : "#c0392b" },
                  ]}
                >
                  {soldeAnnee.toLocaleString("fr-FR")}
                </Text>
                <Text style={styles.kpiLabel}>Solde FC</Text>
              </View>
            </View>
          </View>

          {/* Dépenses par catégorie */}
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
                  <View
                    style={[styles.catIcon, { backgroundColor: cat.color }]}
                  >
                    <Ionicons name={cat.icon} size={18} color={cat.iconColor} />
                  </View>
                  <View style={styles.catContent}>
                    <Text style={styles.catNom}>{cat.label}</Text>
                    <View style={styles.catBarTrack}>
                      <View
                        style={[
                          styles.catBarFill,
                          { width: `${pct}%`, backgroundColor: cat.barColor },
                        ]}
                      />
                    </View>
                  </View>
                  <Text style={styles.catMontant}>
                    {total > 0 ? `-${total.toLocaleString("fr-FR")}` : "0"}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#c0ddd0" />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Info */}
          <View style={styles.infoCard}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
              }}
            >
              <Ionicons name="bulb" size={18} color="#0d6349" />
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
      </ScrollView>

      {/* MODAL DÉTAIL CATÉGORIE */}
      <Modal
        visible={categorieSelectionnee !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setCategorieSelectionnee(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
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
                    textAlign: "center",
                    color: "#7a9c8a",
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
