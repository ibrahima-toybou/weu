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
import { supabase } from "../lib/supabase";
import { styles } from "./_styles/tournee.styles";
import { colors } from "../lib/theme";

export default function Tournee() {
  const [loading, setLoading] = useState(true);
  const [utilisateur, setUtilisateur] = useState<any>(null);
  const [tournee, setTournee] = useState<any>(null);
  const [pointsTournee, setPointsTournee] = useState<any[]>([]);
  const [validationLoading, setValidationLoading] = useState<number | null>(
    null,
  );

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

    const { data: tourneeActiveData } = await supabase
      .from("tournee")
      .select("*, tournee_point(*, point_collecte(nom, secteur(nom)))")
      .eq("id_utilisateur", utilisateurData.id_utilisateur)
      .eq("statut", "en_cours")
      .eq("acceptee_par_agent", true)
      .limit(1)
      .single();

    setTournee(tourneeActiveData || null);
    setPointsTournee(tourneeActiveData?.tournee_point || []);
    setLoading(false);
  }

  async function validerPoint(idPoint: number) {
    setValidationLoading(idPoint);

    const { data: pointagesData } = await supabase
      .from("pointage")
      .select("id_pointage")
      .eq("id_point", idPoint)
      .eq("statut_sync", "synchronisé");
    const nbPointages = pointagesData?.length || 0;

    await supabase
      .from("tournee_point")
      .update({
        heure_vidage: new Date().toISOString(),
        nb_pointages_au_vidage: nbPointages,
      })
      .eq("id_tournee", tournee.id_tournee)
      .eq("id_point", idPoint);

    await supabase
      .from("pointage")
      .update({ statut_sync: "archivé" })
      .eq("id_point", idPoint)
      .eq("statut_sync", "synchronisé");

    const { data: pointsRestants } = await supabase
      .from("tournee_point")
      .select("id_point, heure_vidage")
      .eq("id_tournee", tournee.id_tournee);

    const tousVides = pointsRestants?.every((p) => p.heure_vidage !== null);
    if (tousVides) {
      await supabase
        .from("tournee")
        .update({ statut: "terminée" })
        .eq("id_tournee", tournee.id_tournee);
    }

    setValidationLoading(null);
    fetchData();
  }

  async function retirerPoint(idPoint: number, nomPoint: string) {
    Alert.alert(
      "Retirer ce point",
      `Voulez-vous retirer "${nomPoint}" de cette tournée ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Retirer",
          style: "destructive",
          onPress: async () => {
            await supabase
              .from("tournee_point")
              .delete()
              .eq("id_tournee", tournee.id_tournee)
              .eq("id_point", idPoint);

            const { data: pointsRestants } = await supabase
              .from("tournee_point")
              .select("id_point, heure_vidage")
              .eq("id_tournee", tournee.id_tournee);

            const aucunPointNonVide = !pointsRestants?.some(
              (p) => p.heure_vidage === null,
            );
            if (aucunPointNonVide) {
              await supabase
                .from("tournee")
                .update({ statut: "terminée" })
                .eq("id_tournee", tournee.id_tournee);
            }
            fetchData();
          },
        },
      ],
    );
  }

  function getDateLabel(date: string) {
    const d = new Date(date);
    const aujourdhui = new Date().toISOString().split("T")[0];
    const demain = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    if (date === aujourdhui) return "Aujourd'hui";
    if (date === demain) return "Demain";
    return d.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }

  const pointsValides = pointsTournee.filter((p) => p.heure_vidage !== null);
  const pointsRestants = pointsTournee.filter((p) => p.heure_vidage === null);

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
            <Text style={styles.headerTitle}>Ma tournée</Text>
            <Text style={styles.headerSub}>
              {tournee ? getDateLabel(tournee.date) : "Aucune tournée en cours"}
            </Text>
          </LinearGradient>

          <View style={styles.body}>
            {!tournee ? (
              <View style={styles.emptyCard}>
                <Ionicons
                  name="car-outline"
                  size={40}
                  color={colors.textLabel}
                />
                <Text style={styles.emptyTitle}>Aucune tournée en cours</Text>
                <Text style={styles.emptyText}>
                  Rendez-vous sur l&apos;accueil pour accepter une proposition
                  de tournée.
                </Text>
              </View>
            ) : (
              <>
                {/* INFOS TOURNÉE */}
                <View style={styles.card}>
                  <View style={styles.tourneeHeader}>
                    <Text style={styles.tourneeDate}>
                      {getDateLabel(tournee.date)}
                    </Text>
                    <Text style={styles.tourneeProgress}>
                      {pointsValides.length}/{pointsTournee.length} validés
                    </Text>
                  </View>
                  {tournee.notes && (
                    <Text style={styles.tourneeNotes}>{tournee.notes}</Text>
                  )}
                </View>

                <Text style={styles.cardLabel}>Points à vider</Text>

                {pointsTournee.map((tp) => {
                  const estValide = tp.heure_vidage !== null;
                  return (
                    <View
                      key={tp.id_point}
                      style={[
                        styles.pointCard,
                        estValide && styles.pointCardDone,
                      ]}
                    >
                      <View
                        style={[
                          styles.pointIcon,
                          {
                            backgroundColor: estValide
                              ? colors.greenBg
                              : colors.redBg,
                          },
                        ]}
                      >
                        <Ionicons
                          name={
                            estValide ? "checkmark-circle" : "trash-outline"
                          }
                          size={22}
                          color={estValide ? colors.green : colors.red}
                        />
                      </View>
                      <View style={styles.pointContent}>
                        <Text style={styles.pointNom}>
                          {tp.point_collecte?.nom}
                        </Text>
                        <Text style={styles.pointSecteur}>
                          {tp.point_collecte?.secteur?.nom}
                        </Text>
                        <Text
                          style={[
                            styles.pointStatus,
                            { color: estValide ? colors.green : colors.red },
                          ]}
                        >
                          {estValide ? "Vidé" : "À vider"}
                        </Text>
                      </View>
                      {estValide ? (
                        <View style={styles.valideBadge}>
                          <Text style={styles.valideBadgeText}>Fait ✓</Text>
                        </View>
                      ) : (
                        <View style={{ gap: 6, alignItems: "center" }}>
                          <TouchableOpacity
                            onPress={() => validerPoint(tp.id_point)}
                            disabled={validationLoading === tp.id_point}
                            activeOpacity={0.88}
                          >
                            <LinearGradient
                              colors={["#2DD4BF", "#3B82F6"]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                              style={[
                                styles.validerBtn,
                                {
                                  opacity:
                                    validationLoading === tp.id_point ? 0.6 : 1,
                                },
                              ]}
                            >
                              <Text style={styles.validerBtnText}>
                                {validationLoading === tp.id_point
                                  ? "..."
                                  : "Valider"}
                              </Text>
                            </LinearGradient>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() =>
                              retirerPoint(tp.id_point, tp.point_collecte?.nom)
                            }
                            style={styles.retirerBtn}
                          >
                            <Text style={styles.retirerBtnText}>Retirer</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })}

                {/* TOURNÉE TERMINÉE */}
                {pointsRestants.length === 0 && pointsTournee.length > 0 && (
                  <View
                    style={[
                      styles.card,
                      {
                        backgroundColor: colors.greenBg,
                        borderColor: colors.green + "40",
                        alignItems: "center",
                        gap: 6,
                      },
                    ]}
                  >
                    <Ionicons name="trophy" size={32} color={colors.green} />
                    <Text
                      style={{
                        fontFamily: "SpaceGrotesk_700Bold",
                        fontSize: 15,
                        color: colors.green,
                      }}
                    >
                      Tournée terminée !
                    </Text>
                    <Text
                      style={{
                        fontFamily: "InstrumentSans_400Regular",
                        fontSize: 12,
                        color: colors.textSecondary,
                        textAlign: "center",
                      }}
                    >
                      Tous les points ont été vidés avec succès.
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
