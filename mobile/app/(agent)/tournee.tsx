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
import { styles } from "./tournee.styles";

export default function Tournee() {
  const [loading, setLoading] = useState(true);
  const [utilisateur, setUtilisateur] = useState<any>(null);
  const [tournee, setTournee] = useState<any>(null);
  const [pointsAVider, setPointsAVider] = useState<any[]>([]);
  const [pointsVides, setPointsVides] = useState<number[]>([]);
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

    // Récupérer la dernière tournée non terminée (du jour ou future, sans tous les points validés)
    const aujourdhui = new Date().toISOString().split("T")[0];

    const { data: tourneesData } = await supabase
      .from("tournee")
      .select("*")
      .eq("id_utilisateur", utilisateurData.id_utilisateur)
      .gte("date", aujourdhui)
      .order("date", { ascending: true })
      .limit(1);

    const tourneeActive = tourneesData?.[0] || null;
    setTournee(tourneeActive);

    if (tourneeActive) {
      // Récupérer les points déjà validés pour cette tournée
      const { data: tourneePointsData } = await supabase
        .from("tournee_point")
        .select("id_point")
        .eq("id_tournee", tourneeActive.id_tournee);

      const idsValides = tourneePointsData?.map((tp) => tp.id_point) || [];
      setPointsVides(idsValides);

      // Si la tournée vient d'être créée, on doit déterminer quels points elle concerne
      // On stocke ça en se basant sur les points actuellement pleins/moyens au moment de la création
      // Pour simplifier : on récupère tous les points et leur statut actuel
      const [pointsRes, pointagesRes, menagesRes] = await Promise.all([
        supabase.from("point_collecte").select("*, secteur(nom)").order("nom"),
        supabase
          .from("pointage")
          .select("id_point")
          .eq("statut_sync", "synchronisé"),
        supabase.from("menage").select("id_point").eq("statut", "actif"),
      ]);

      const points = pointsRes.data || [];
      const pointages = pointagesRes.data || [];
      const menages = menagesRes.data || [];

      function getPct(idPoint: number) {
        const nb = pointages.filter((p) => p.id_point === idPoint).length;
        const nm = menages.filter((m) => m.id_point === idPoint).length;
        if (nm === 0) return 0;
        return Math.min(Math.round((nb / nm) * 100), 100);
      }

      // Les points concernés sont ceux à >= 60% (logique de proposition) OU déjà dans tournee_point
      const pointsConcernes = points
        .filter(
          (p) => getPct(p.id_point) >= 60 || idsValides.includes(p.id_point),
        )
        .map((p) => ({ ...p, pct: getPct(p.id_point) }));

      setPointsAVider(pointsConcernes);
    }

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

    const { error: insertError } = await supabase.from("tournee_point").insert({
      id_tournee: tournee.id_tournee,
      id_point: idPoint,
      heure_vidage: new Date().toISOString(),
      nb_pointages_au_vidage: nbPointages,
    });

    if (insertError) {
      Alert.alert("Erreur", insertError.message);
      setValidationLoading(null);
      return;
    }

    await supabase
      .from("pointage")
      .update({ statut_sync: "archivé" })
      .eq("id_point", idPoint)
      .eq("statut_sync", "synchronisé");

    setPointsVides((prev) => [...prev, idPoint]);
    setValidationLoading(null);
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

  const tousValides =
    pointsAVider.length > 0 &&
    pointsAVider.every((p) => pointsVides.includes(p.id_point));

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
          <Text style={styles.headerTitle}>Ma tournée</Text>
          <Text style={styles.headerSub}>
            {tournee ? getDateLabel(tournee.date) : "Aucune tournée en cours"}
          </Text>
        </View>

        <View style={styles.body}>
          {!tournee ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>🚛</Text>
              <Text style={styles.emptyTitle}>Aucune tournée prévue</Text>
              <Text style={styles.emptyText}>
                Rendez-vous sur l’accueil pour accepter une proposition de
                tournée.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.card}>
                <View style={styles.tourneeHeader}>
                  <Text style={styles.tourneeDate}>
                    {getDateLabel(tournee.date)}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: "#1a5c99",
                    }}
                  >
                    {pointsVides.length}/{pointsAVider.length} validés
                  </Text>
                </View>
                {tournee.notes && (
                  <Text style={styles.tourneeNotes}>{tournee.notes}</Text>
                )}
              </View>

              <Text style={styles.cardLabel}>Points à vider</Text>

              {pointsAVider.map((p) => {
                const estValide = pointsVides.includes(p.id_point);
                return (
                  <View
                    key={p.id_point}
                    style={[
                      styles.pointCard,
                      estValide && styles.pointCardDone,
                    ]}
                  >
                    <View
                      style={[
                        styles.pointIcon,
                        {
                          backgroundColor: estValide ? "#e6f5ec" : "#fdecea",
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 20 }}>
                        {estValide ? "✅" : "🗑️"}
                      </Text>
                    </View>
                    <View style={styles.pointContent}>
                      <Text style={styles.pointNom}>{p.nom}</Text>
                      <Text style={styles.pointSecteur}>{p.secteur?.nom}</Text>
                      <Text
                        style={[
                          styles.pointStatus,
                          {
                            color: estValide ? "#1a8f69" : "#c0392b",
                          },
                        ]}
                      >
                        {estValide ? "Vidé" : `${p.pct}% rempli`}
                      </Text>
                    </View>
                    {estValide ? (
                      <View style={styles.valideBadge}>
                        <Text style={styles.valideBadgeText}>Fait</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.validerBtn}
                        onPress={() => validerPoint(p.id_point)}
                        disabled={validationLoading === p.id_point}
                      >
                        <Text style={styles.validerBtnText}>
                          {validationLoading === p.id_point ? "..." : "Valider"}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}

              {tousValides && (
                <View
                  style={[
                    styles.card,
                    {
                      backgroundColor: "#e6f5ec",
                      borderColor: "#b8ddc8",
                      alignItems: "center",
                    },
                  ]}
                >
                  <Text style={{ fontSize: 32, marginBottom: 8 }}>🎉</Text>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "800",
                      color: "#1a8f69",
                    }}
                  >
                    Tournée terminée !
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#4a6a58",
                      marginTop: 4,
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
      </ScrollView>
    </View>
  );
}
