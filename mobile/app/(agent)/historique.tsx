import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { supabase } from "../supabase";
import { styles } from "./historique.styles";

export default function HistoriqueAgent() {
  const [loading, setLoading] = useState(true);
  const [tournees, setTournees] = useState<any[]>([]);
  const [tourneeSelectionnee, setTourneeSelectionnee] = useState<any>(null);

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
      .select("*, tournee_point(*, point_collecte(nom, secteur(nom)))")
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
              <TouchableOpacity
                key={i}
                style={styles.item}
                onPress={() => setTourneeSelectionnee(t)}
              >
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
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* MODAL DETAIL */}
      <Modal
        visible={tourneeSelectionnee !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setTourneeSelectionnee(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              paddingBottom: 40,
              maxHeight: "75%",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "800",
                color: "#0d1f16",
                marginBottom: 4,
              }}
            >
              Tournée du{" "}
              {tourneeSelectionnee &&
                new Date(tourneeSelectionnee.date).toLocaleDateString("fr-FR")}
            </Text>
            {tourneeSelectionnee?.notes && (
              <Text
                style={{ fontSize: 13, color: "#7a9c8a", marginBottom: 16 }}
              >
                {tourneeSelectionnee.notes}
              </Text>
            )}
            <ScrollView style={{ maxHeight: 320 }}>
              {tourneeSelectionnee?.tournee_point?.map((tp: any, i: number) => (
                <View
                  key={i}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingVertical: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: "#f0f4f9",
                  }}
                >
                  <View>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "600",
                        color: "#0d1f16",
                      }}
                    >
                      {tp.point_collecte?.nom}
                    </Text>
                    <Text style={{ fontSize: 11, color: "#7a9c8a" }}>
                      {tp.point_collecte?.secteur?.nom}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#1a8f69",
                      fontWeight: "600",
                    }}
                  >
                    {tp.heure_vidage
                      ? new Date(tp.heure_vidage).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={{
                backgroundColor: "#f4f8fc",
                borderRadius: 12,
                padding: 14,
                alignItems: "center",
                marginTop: 12,
                borderWidth: 1,
                borderColor: "#e0eaf5",
              }}
              onPress={() => setTourneeSelectionnee(null)}
            >
              <Text
                style={{ fontSize: 14, fontWeight: "600", color: "#4a6a58" }}
              >
                Fermer
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
