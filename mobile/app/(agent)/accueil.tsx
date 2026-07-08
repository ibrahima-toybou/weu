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
import { styles } from "./_styles/accueil.styles";
import { colors } from "../lib/theme";

export default function AccueilAgent() {
  const [loading, setLoading] = useState(true);
  const [utilisateur, setUtilisateur] = useState<any>(null);
  const [points, setPoints] = useState<any[]>([]);
  const [pointages, setPointages] = useState<any[]>([]);
  const [menages, setMenages] = useState<any[]>([]);
  const [tourneesUrgentes, setTourneesUrgentes] = useState<any[]>([]);
  const [tourneeEnCours, setTourneeEnCours] = useState<any>(null);
  const [creationLoading, setCreationLoading] = useState(false);

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

    const [pointsRes, pointagesRes, menagesRes] = await Promise.all([
      supabase.from("point_collecte").select("*, secteur(nom)").order("nom"),
      supabase
        .from("pointage")
        .select("id_point")
        .eq("statut_sync", "synchronisé"),
      supabase.from("menage").select("id_point").eq("statut", "actif"),
    ]);

    setPoints(pointsRes.data || []);
    setPointages(pointagesRes.data || []);
    setMenages(menagesRes.data || []);

    const { data: tourneeEnCoursData } = await supabase
      .from("tournee")
      .select("*")
      .eq("id_utilisateur", utilisateurData.id_utilisateur)
      .eq("statut", "en_cours")
      .eq("acceptee_par_agent", true)
      .limit(1)
      .single();
    setTourneeEnCours(tourneeEnCoursData || null);

    const { data: tourneesAdminData } = await supabase
      .from("tournee")
      .select("*, tournee_point(*, point_collecte(nom, secteur(nom)))")
      .eq("statut", "en_cours")
      .eq("acceptee_par_agent", false)
      .order("date", { ascending: true });
    setTourneesUrgentes(tourneesAdminData || []);

    setLoading(false);
  }

  const getNbPointages = (idPoint: number) =>
    pointages.filter((p) => p.id_point === idPoint).length;
  const getNbMenages = (idPoint: number) =>
    menages.filter((m) => m.id_point === idPoint).length;

  function getPct(idPoint: number) {
    const nb = getNbPointages(idPoint);
    const nm = getNbMenages(idPoint);
    if (nm === 0) return 0;
    return Math.min(Math.round((nb / nm) * 100), 100);
  }

  function getStatut(idPoint: number) {
    const pct = getPct(idPoint);
    if (pct >= 100) return "plein";
    if (pct >= 60) return "moyen";
    return "vide";
  }

  function getCouleur(statut: string) {
    if (statut === "plein") return colors.red;
    if (statut === "moyen") return colors.amber;
    return colors.green;
  }

  const pointsPleins = points.filter((p) => getStatut(p.id_point) === "plein");
  const pointsMoyens = points.filter((p) => getStatut(p.id_point) === "moyen");

  async function accepterProposition(
    type: "immediate" | "demain" | "urgence",
    idTourneeUrgente?: number,
  ) {
    setCreationLoading(true);

    if (type === "urgence" && idTourneeUrgente) {
      await supabase
        .from("tournee")
        .update({ acceptee_par_agent: true })
        .eq("id_tournee", idTourneeUrgente);
      setCreationLoading(false);
      router.push("/(agent)/tournee");
      return;
    }

    const pointsConcernes =
      type === "immediate" ? pointsPleins : [...pointsPleins, ...pointsMoyens];
    if (pointsConcernes.length === 0) {
      setCreationLoading(false);
      return;
    }

    const date =
      type === "immediate"
        ? new Date().toISOString().split("T")[0]
        : new Date(Date.now() + 86400000).toISOString().split("T")[0];

    const { data: tournee, error } = await supabase
      .from("tournee")
      .insert({
        date,
        id_utilisateur: utilisateur.id_utilisateur,
        cree_par: utilisateur.id_utilisateur,
        statut: "en_cours",
        acceptee_par_agent: true,
        notes:
          type === "immediate"
            ? "Tournée immédiate — points pleins"
            : "Tournée planifiée — points pleins et en remplissage",
      })
      .select()
      .single();

    if (error) {
      Alert.alert("Erreur", error.message);
      setCreationLoading(false);
      return;
    }

    for (const p of pointsConcernes) {
      await supabase.from("tournee_point").insert({
        id_tournee: tournee.id_tournee,
        id_point: p.id_point,
        heure_vidage: null,
        nb_pointages_au_vidage: getNbPointages(p.id_point),
      });
    }

    setCreationLoading(false);
    router.push("/(agent)/tournee");
  }

  const initiales = utilisateur?.nom?.charAt(0).toUpperCase() || "A";

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
            style={{
              paddingTop: 56,
              paddingHorizontal: 24,
              paddingBottom: 80,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                position: "absolute",
                top: -60,
                right: -40,
                width: 200,
                height: 200,
                borderRadius: 999,
                backgroundColor: "rgba(255,255,255,0.08)",
              }}
            />
            <View
              style={{
                position: "absolute",
                top: 70,
                right: 90,
                width: 90,
                height: 90,
                borderRadius: 999,
                backgroundColor: "rgba(255,255,255,0.06)",
              }}
            />

            {/* HEADER */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.headerGreeting}>Bonjour 👋</Text>
                <Text style={styles.headerName}>
                  {utilisateur?.nom?.toUpperCase()}
                </Text>
                <Text style={styles.headerSub}>Agent de terrain · Madina</Text>
              </View>

              {/* AVATAR → paramètres */}
              <TouchableOpacity
                onPress={() => router.push("/(agent)/parametres")}
              >
                <View
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 999,
                    backgroundColor: "rgba(255,255,255,0.18)",
                    borderWidth: 1.5,
                    borderColor: "rgba(255,255,255,0.45)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "SpaceGrotesk_700Bold",
                      fontSize: 17,
                      color: "#FFFFFF",
                    }}
                  >
                    {initiales}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <View style={styles.body}>
            {/* TOURNÉE EN COURS */}
            {tourneeEnCours ? (
              <View
                style={[
                  styles.propositionCard,
                  {
                    backgroundColor: colors.greenBg,
                    borderColor: colors.green + "40",
                  },
                ]}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  <Ionicons name="car" size={18} color={colors.green} />
                  <Text
                    style={[styles.propositionTitle, { color: colors.green }]}
                  >
                    Tournée en cours
                  </Text>
                </View>
                <Text style={styles.propositionPoints}>
                  Vous avez une tournée en cours. Rendez-vous dans l&apos;onglet
                  Tournée pour continuer.
                </Text>
                <TouchableOpacity
                  style={[
                    styles.propositionBtn,
                    { backgroundColor: colors.green },
                  ]}
                  onPress={() => router.push("/(agent)/tournee")}
                >
                  <Text style={styles.propositionBtnText}>Voir ma tournée</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.cardLabelHero}>
                  Propositions de tournées
                </Text>

                {pointsPleins.length === 0 &&
                pointsMoyens.length === 0 &&
                tourneesUrgentes.length === 0 ? (
                  <View
                    style={[styles.propositionCard, styles.propositionVide]}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 6,
                      }}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color={colors.green}
                      />
                      <Text
                        style={[
                          styles.propositionTitle,
                          { color: colors.green },
                        ]}
                      >
                        Tout va bien
                      </Text>
                    </View>
                    <Text style={styles.propositionPoints}>
                      Aucun point ne nécessite de collecte pour le moment.
                    </Text>
                  </View>
                ) : (
                  <>
                    {tourneesUrgentes.map((tu) => (
                      <View
                        key={tu.id_tournee}
                        style={[
                          styles.propositionCard,
                          {
                            backgroundColor: colors.purpleBg,
                            borderColor: colors.purple + "40",
                          },
                        ]}
                      >
                        <View style={styles.propositionHeader}>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <Ionicons
                              name="flash"
                              size={18}
                              color={colors.purple}
                            />
                            <Text
                              style={[
                                styles.propositionTitle,
                                { color: colors.purple },
                              ]}
                            >
                              Tournée urgente (Admin)
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.propositionBadge,
                              { backgroundColor: colors.bgCard },
                            ]}
                          >
                            <Text
                              style={[
                                styles.propositionBadgeText,
                                { color: colors.purple },
                              ]}
                            >
                              {tu.tournee_point?.length || 0} point(s)
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.propositionPoints}>
                          {tu.tournee_point
                            ?.map((tp: any) => tp.point_collecte?.nom)
                            .join(", ")}
                          {tu.notes ? ` — ${tu.notes}` : ""}
                        </Text>
                        <TouchableOpacity
                          style={[
                            styles.propositionBtn,
                            { backgroundColor: colors.purple },
                          ]}
                          onPress={() =>
                            accepterProposition("urgence", tu.id_tournee)
                          }
                          disabled={creationLoading}
                        >
                          <Text style={styles.propositionBtnText}>
                            {creationLoading
                              ? "Chargement..."
                              : "Accepter cette tournée"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))}

                    {pointsPleins.length > 0 && (
                      <View
                        style={[
                          styles.propositionCard,
                          styles.propositionUrgent,
                        ]}
                      >
                        <View style={styles.propositionHeader}>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <Ionicons
                              name="alert"
                              size={18}
                              color={colors.red}
                            />
                            <Text
                              style={[
                                styles.propositionTitle,
                                { color: colors.red },
                              ]}
                            >
                              Tournée immédiate
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.propositionBadge,
                              { backgroundColor: colors.bgCard },
                            ]}
                          >
                            <Text
                              style={[
                                styles.propositionBadgeText,
                                { color: colors.red },
                              ]}
                            >
                              {pointsPleins.length} point(s)
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.propositionPoints}>
                          {pointsPleins.map((p) => p.nom).join(", ")} —
                          Plein(s), à vider aujourd&apos;hui.
                        </Text>
                        <TouchableOpacity
                          style={[
                            styles.propositionBtn,
                            { backgroundColor: colors.red },
                          ]}
                          onPress={() => accepterProposition("immediate")}
                          disabled={creationLoading}
                        >
                          <Text style={styles.propositionBtnText}>
                            {creationLoading
                              ? "Création..."
                              : "Accepter cette tournée"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {pointsMoyens.length > 0 && (
                      <View
                        style={[
                          styles.propositionCard,
                          styles.propositionDemain,
                        ]}
                      >
                        <View style={styles.propositionHeader}>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <Ionicons
                              name="calendar-outline"
                              size={18}
                              color={colors.amber}
                            />
                            <Text
                              style={[
                                styles.propositionTitle,
                                { color: colors.amber },
                              ]}
                            >
                              Tournée demain
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.propositionBadge,
                              { backgroundColor: colors.bgCard },
                            ]}
                          >
                            <Text
                              style={[
                                styles.propositionBadgeText,
                                { color: colors.amber },
                              ]}
                            >
                              {pointsPleins.length + pointsMoyens.length}{" "}
                              point(s)
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.propositionPoints}>
                          {[...pointsPleins, ...pointsMoyens]
                            .map((p) => p.nom)
                            .join(", ")}{" "}
                          — Inclut les points pleins et en remplissage.
                        </Text>
                        <TouchableOpacity
                          style={[
                            styles.propositionBtn,
                            { backgroundColor: colors.amber },
                          ]}
                          onPress={() => accepterProposition("demain")}
                          disabled={creationLoading}
                        >
                          <Text
                            style={[
                              styles.propositionBtnText,
                              { color: "#0E1210" },
                            ]}
                          >
                            {creationLoading
                              ? "Création..."
                              : "Planifier pour demain"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                )}
              </>
            )}

            {/* ÉTAT DES POINTS */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>État des points de collecte</Text>
              {points.map((p, i) => {
                const pct = getPct(p.id_point);
                const statut = getStatut(p.id_point);
                const isLast = i === points.length - 1;
                return (
                  <View
                    key={p.id_point}
                    style={isLast ? styles.pointRowLast : styles.pointRow}
                  >
                    <View
                      style={[
                        styles.statutDot,
                        { backgroundColor: getCouleur(statut) },
                      ]}
                    />
                    <View style={styles.pointInfo}>
                      <Text style={styles.pointNom}>{p.nom}</Text>
                      <Text style={styles.pointSecteur}>{p.secteur?.nom}</Text>
                    </View>
                    <Text
                      style={[styles.pointPct, { color: getCouleur(statut) }]}
                    >
                      {pct}%
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
