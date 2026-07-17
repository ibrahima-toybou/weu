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
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { styles } from "../../styles/agent/historique.styles";
import { colors } from "../../lib/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_KEY = "weu_agent_historique_cache";

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
    // Cache d'abord
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      const data = JSON.parse(cached);
      setTournees(data.tournees || []);
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
      .select("id_utilisateur")
      .eq("auth_id", session.user.id)
      .single();

    if (error || !utilisateur) {
      if (!cached) setLoading(false);
      return;
    }

    const { data: tourneesData } = await supabase
      .from("tournee")
      .select("*, tournee_point(*, point_collecte(nom, secteur(nom)))")
      .eq("id_utilisateur", utilisateur?.id_utilisateur)
      .eq("statut", "terminée")
      .order("date", { ascending: false })
      .limit(20);

    setTournees(tourneesData || []);

    await AsyncStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        tournees: tourneesData || [],
      }),
    );

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
          {/* HERO */}
          <LinearGradient
            colors={["#2DD4BF", "#20B8C4", "#3B82F6", "#3B82F6", "#F4F5F8"]}
            locations={[0, 0.25, 0.55, 0.72, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ paddingTop: 56, paddingHorizontal: 24, paddingBottom: 80 }}
          >
            <Text style={styles.headerTitle}>Mon historique</Text>
            <Text style={styles.headerSub}>Tournées effectuées</Text>
          </LinearGradient>

          <View style={styles.body}>
            {/* STATS */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={[styles.statVal, { color: colors.teal }]}>
                  {tourneesMois.length}
                </Text>
                <Text style={styles.statLabel}>Tournées ce mois</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statVal, { color: "#3B82F6" }]}>
                  {tournees.length}
                </Text>
                <Text style={styles.statLabel}>Total tournées</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statVal, { color: colors.green }]}>
                  {totalPointsVides}
                </Text>
                <Text style={styles.statLabel}>Points vidés</Text>
              </View>
            </View>

            {/* LISTE */}
            <Text style={styles.sectionTitle}>Tournées récentes</Text>
            {tournees.length === 0 ? (
              <Text style={styles.empty}>Aucune tournée enregistrée</Text>
            ) : (
              tournees.map((t, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.item}
                  onPress={() => setTourneeSelectionnee(t)}
                  activeOpacity={0.85}
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
        </View>
      </ScrollView>

      {/* MODAL DÉTAIL */}
      <Modal
        visible={tourneeSelectionnee !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setTourneeSelectionnee(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(15,23,42,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: colors.bgCard,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              paddingBottom: 40,
              maxHeight: "75%",
            }}
          >
            <View
              style={{
                width: 40,
                height: 4,
                backgroundColor: colors.border,
                borderRadius: 999,
                alignSelf: "center",
                marginBottom: 16,
              }}
            />
            <Text
              style={{
                fontFamily: "SpaceGrotesk_700Bold",
                fontSize: 18,
                color: colors.textPrimary,
                marginBottom: 4,
              }}
            >
              Tournée du{" "}
              {tourneeSelectionnee &&
                new Date(tourneeSelectionnee.date).toLocaleDateString("fr-FR")}
            </Text>
            {tourneeSelectionnee?.notes && (
              <Text
                style={{
                  fontFamily: "InstrumentSans_400Regular",
                  fontSize: 13,
                  color: colors.textSecondary,
                  marginBottom: 16,
                }}
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
                    borderBottomColor: colors.borderLight,
                  }}
                >
                  <View>
                    <Text
                      style={{
                        fontFamily: "InstrumentSans_600SemiBold",
                        fontSize: 13,
                        color: colors.textPrimary,
                      }}
                    >
                      {tp.point_collecte?.nom}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "InstrumentSans_400Regular",
                        fontSize: 11,
                        color: colors.textSecondary,
                      }}
                    >
                      {tp.point_collecte?.secteur?.nom}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={14}
                      color={colors.green}
                    />
                    <Text
                      style={{
                        fontFamily: "InstrumentSans_600SemiBold",
                        fontSize: 11,
                        color: colors.green,
                      }}
                    >
                      {tp.heure_vidage
                        ? new Date(tp.heure_vidage).toLocaleTimeString(
                            "fr-FR",
                            { hour: "2-digit", minute: "2-digit" },
                          )
                        : "—"}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={{
                backgroundColor: colors.bgPage,
                borderRadius: 14,
                padding: 14,
                alignItems: "center",
                marginTop: 12,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              onPress={() => setTourneeSelectionnee(null)}
            >
              <Text
                style={{
                  fontFamily: "InstrumentSans_600SemiBold",
                  fontSize: 14,
                  color: colors.textSecondary,
                }}
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
