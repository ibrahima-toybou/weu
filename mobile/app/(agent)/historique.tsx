import { useState, useCallback } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { supabase } from "../supabase";
import { styles } from "./historique.styles";

export default function HistoriqueAgent() {
  const [loading, setLoading] = useState(true);
  const [tournees, setTournees] = useState<any[]>([]);

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
      .select("id_utilisateur")
      .eq("auth_id", user.id)
      .single();

    const { data: tourneesData } = await supabase
      .from("tournee")
      .select("*, tournee_point(*, point_collecte(nom))")
      .eq("id_utilisateur", utilisateur?.id_utilisateur)
      .eq("statut", "terminée")
      .order("date", { ascending: false })
      .limit(20);

    setTournees(tourneesData || []);
    setLoading(false);
  }

  const moisActuel = new Date().toISOString().slice(0, 7);
  const tourneesMois = tournees.filter((t) => t.date?.startsWith(moisActuel));
  const totalPointsVides = tournees.reduce(
    (sum, t) => sum + (t.tournee_point?.length || 0),
    0,
  );

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
          <Text style={styles.headerTitle}>Mon historique</Text>
          <Text style={styles.headerSub}>Tournées effectuées</Text>
        </View>

        <View style={styles.body}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statVal}>{tourneesMois.length}</Text>
              <Text style={styles.statLabel}>Tournées ce mois</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statVal}>{tournees.length}</Text>
              <Text style={styles.statLabel}>Total tournées</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statVal}>{totalPointsVides}</Text>
              <Text style={styles.statLabel}>Points vidés</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Tournées récentes</Text>
          {tournees.length === 0 ? (
            <Text style={styles.empty}>Aucune tournée enregistrée</Text>
          ) : (
            tournees.map((t, i) => (
              <View key={i} style={styles.item}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemDate}>
                    {new Date(t.date).toLocaleDateString("fr-FR", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </Text>
                  <View style={styles.itemBadge}>
                    <Text style={styles.itemBadgeText}>
                      {t.tournee_point?.length || 0} point(s)
                    </Text>
                  </View>
                </View>
                {t.notes && <Text style={styles.itemNotes}>{t.notes}</Text>}
                {t.tournee_point?.length > 0 && (
                  <Text style={styles.itemNotes}>
                    {t.tournee_point
                      .map((tp: any) => tp.point_collecte?.nom)
                      .join(", ")}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
