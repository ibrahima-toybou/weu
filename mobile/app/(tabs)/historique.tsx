import { useState, useCallback } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useFocusEffect } from "expo-router";
import { supabase } from "../supabase";
import { styles } from "./historique.styles";

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
      .select("*, menage(id_menage, nom, point_collecte(nom))")
      .eq("auth_id", user.id)
      .single();

    setMenage(utilisateur?.menage);

    const idMenage = utilisateur?.menage?.id_menage;

    if (idMenage) {
      const { data: pointagesData } = await supabase
        .from("pointage")
        .select("*, point_collecte(nom)")
        .eq("id_menage", idMenage)
        .order("date_heure", { ascending: false })
        .limit(10);

      setPointages(pointagesData || []);

      const { data: cotisationsData } = await supabase
        .from("cotisation")
        .select("*")
        .eq("id_menage", idMenage)
        .order("periode", { ascending: false })
        .limit(6);

      setCotisations(cotisationsData || []);
    }

    setLoading(false);
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

  const moisActuel = new Date().toISOString().slice(0, 7);
  const pointagesMoisActuel = pointages.filter((p) =>
    p.date_heure?.startsWith(moisActuel),
  ).length;
  const moisPayes = cotisations.filter((c) => c.statut === "payé").length;

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
          <Text style={styles.headerTitle}>Mon historique</Text>
          <Text style={styles.headerSub}>{menage?.nom}</Text>
        </View>

        <View style={styles.body}>
          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statVal}>{pointagesMoisActuel}</Text>
              <Text style={styles.statLabel}>Dépôts ce mois</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statVal}>{pointages.length}</Text>
              <Text style={styles.statLabel}>Total dépôts</Text>
            </View>
            <View style={styles.statCard}>
              <Text
                style={[
                  styles.statVal,
                  { color: moisPayes >= 5 ? "#1a8f69" : "#e8a020" },
                ]}
              >
                {moisPayes}/6
              </Text>
              <Text style={styles.statLabel}>Mois payés</Text>
            </View>
          </View>

          {/* Historique pointages */}
          <Text style={styles.sectionTitle}>Mes dépôts récents</Text>
          {pointages.length === 0 ? (
            <Text style={styles.empty}>Aucun dépôt enregistré</Text>
          ) : (
            pointages.map((p, i) => (
              <View key={i} style={styles.item}>
                <View
                  style={[
                    styles.itemDot,
                    {
                      backgroundColor:
                        p.statut_sync === "synchronisé" ? "#1a8f69" : "#e8a020",
                    },
                  ]}
                />
                <View style={styles.itemContent}>
                  <Text style={styles.itemTitle}>{p.point_collecte?.nom}</Text>
                  <Text style={styles.itemSub}>{formatDate(p.date_heure)}</Text>
                </View>
                <View
                  style={[
                    styles.itemBadge,
                    {
                      backgroundColor:
                        p.statut_sync === "synchronisé" ? "#e6f5ec" : "#fdf0e0",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.itemBadgeText,
                      {
                        color:
                          p.statut_sync === "synchronisé"
                            ? "#0d6349"
                            : "#7a4a00",
                      },
                    ]}
                  >
                    {p.statut_sync === "synchronisé" ? "sync" : "attente"}
                  </Text>
                </View>
              </View>
            ))
          )}

          {/* Historique cotisations */}
          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
            Mes cotisations
          </Text>
          {cotisations.length === 0 ? (
            <Text style={styles.empty}>Aucune cotisation enregistrée</Text>
          ) : (
            cotisations.map((c, i) => (
              <View key={i} style={styles.item}>
                <View
                  style={[
                    styles.itemDot,
                    {
                      backgroundColor:
                        c.statut === "payé"
                          ? "#1a5c99"
                          : c.statut === "exonéré"
                            ? "#7a9c8a"
                            : "#c0392b",
                    },
                  ]}
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
                <View
                  style={[
                    styles.itemBadge,
                    {
                      backgroundColor:
                        c.statut === "payé"
                          ? "#e5f1fd"
                          : c.statut === "exonéré"
                            ? "#f4faf7"
                            : "#fdecea",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.itemBadgeText,
                      {
                        color:
                          c.statut === "payé"
                            ? "#0a3d7a"
                            : c.statut === "exonéré"
                              ? "#7a9c8a"
                              : "#8b1a1a",
                      },
                    ]}
                  >
                    {c.statut === "payé"
                      ? "payé"
                      : c.statut === "exonéré"
                        ? "exonéré"
                        : "retard"}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
