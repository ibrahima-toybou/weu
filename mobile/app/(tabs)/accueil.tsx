import { useState, useCallback, useEffect } from "react";
import { useFocusEffect } from "expo-router";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import NetInfo from "@react-native-community/netinfo";
import { supabase } from "../../lib/supabase";
import {
  ajouterPointage,
  syncPointages,
  getNbEnAttente,
  sauvegarderCache,
  chargerCache,
} from "../../lib/offlineQueue";
import { styles } from "../../styles/tabs/accueil.styles";

export default function Accueil() {
  const [loading, setLoading] = useState(true);
  const [utilisateur, setUtilisateur] = useState<any>(null);
  const [menage, setMenage] = useState<any>(null);
  const [point, setPoint] = useState<any>(null);
  const [cotisation, setCotisation] = useState<any>(null);
  const [nbPointages, setNbPointages] = useState(0);
  const [nbMenagesPoint, setNbMenagesPoint] = useState(0);
  const [pointageLoading, setPointageLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showModalPointage, setShowModalPointage] = useState(false);
  const [heurePointage, setHeurePointage] = useState("");
  const [nbEnAttente, setNbEnAttente] = useState(0);
  const [isOffline, setIsOffline] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      setIsOffline(!state.isConnected);
      if (state.isConnected) {
        const { synced } = await syncPointages();
        if (synced > 0) {
          const attente = await getNbEnAttente();
          setNbEnAttente(attente);
          fetchData();
        }
      }
    });
    return () => unsubscribe();
  }, []);

  async function fetchData() {
    // 1. Cache d'abord — affichage instantané
    const cache = await chargerCache();
    if (cache) {
      setUtilisateur(cache.utilisateur);
      setMenage(cache.menage);
      setPoint(cache.point);
      setCotisation(cache.cotisation);
      setNbPointages(cache.nbPointages || 0);
      setNbMenagesPoint(cache.nbMenagesPoint || 0);
      setLoading(false);
    }

    // 2. Charger le nb en attente
    const attente = await getNbEnAttente();
    setNbEnAttente(attente);

    // 3. Tenter le réseau
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      router.replace("/");
      return;
    }

    const { data: utilisateurData, error } = await supabase
      .from("utilisateur")
      .select("*, menage(*, point_collecte(*, secteur(nom)), secteur(nom))")
      .eq("auth_id", session.user.id)
      .single();

    if (error || !utilisateurData) {
      if (!cache) setLoading(false);
      return;
    }

    // 4. Réseau OK — mettre à jour
    setUtilisateur(utilisateurData);
    setMenage(utilisateurData.menage);

    const idPoint = utilisateurData.menage?.id_point;
    let pointagesCount = 0;
    let menagesCount = 0;

    if (idPoint) {
      setPoint(utilisateurData.menage?.point_collecte);
      const { data: pointagesData } = await supabase
        .from("pointage")
        .select("id_pointage")
        .eq("id_point", idPoint)
        .eq("statut_sync", "synchronisé");
      pointagesCount = pointagesData?.length || 0;
      setNbPointages(pointagesCount);
      const { data: menagesData } = await supabase
        .from("menage")
        .select("id_menage")
        .eq("id_point", idPoint)
        .eq("statut", "actif");
      menagesCount = menagesData?.length || 0;
      setNbMenagesPoint(menagesCount);
    }

    const moisActuel = new Date().toISOString().slice(0, 7);
    const { data: cotisationData } = await supabase
      .from("cotisation")
      .select("*")
      .eq("id_menage", utilisateurData.menage?.id_menage)
      .eq("periode", moisActuel + "-01")
      .single();
    setCotisation(cotisationData);

    await sauvegarderCache({
      utilisateur: utilisateurData,
      menage: utilisateurData.menage,
      point: utilisateurData.menage?.point_collecte,
      cotisation: cotisationData,
      nbPointages: pointagesCount,
      nbMenagesPoint: menagesCount,
    });

    syncPointages()
      .then(async () => {
        const a = await getNbEnAttente();
        setNbEnAttente(a);
      })
      .catch(() => {});

    setLoading(false);
  }

  async function handlePointage() {
    setShowModalPointage(false);
    setPointageLoading(true);

    const pointageLocal = await ajouterPointage({
      id_menage: menage.id_menage,
      id_utilisateur: utilisateur.id_utilisateur,
      id_point: menage.id_point,
    });

    const { synced } = await syncPointages().catch(() => ({ synced: 0 }));

    setHeurePointage(
      new Date(pointageLocal.date_heure).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );

    const attente = await getNbEnAttente();
    setNbEnAttente(attente);

    if (synced > 0) fetchData();

    setShowConfirmation(true);
    setPointageLoading(false);
  }

  function getPct() {
    if (nbMenagesPoint === 0) return 0;
    return Math.min(Math.round((nbPointages / nbMenagesPoint) * 100), 100);
  }

  function getStatutPoint() {
    const pct = getPct();
    if (pct >= 100)
      return {
        label: "Plein",
        color: "#FB7185",
        bg: "rgba(251,113,133,0.14)",
        dotColor: "#FB7185",
      };
    if (pct >= 60)
      return {
        label: "Bientôt plein",
        color: "#FBBF24",
        bg: "rgba(251,191,36,0.14)",
        dotColor: "#FBBF24",
      };
    return {
      label: "Disponible",
      color: "#0E9F6E",
      bg: "rgba(52,211,153,0.14)",
      dotColor: "#34D399",
    };
  }

  function getBarColor(): [string, string] {
    const pct = getPct();
    if (pct >= 100) return ["#FB7185", "#FB7185"];
    if (pct >= 60) return ["#FBBF24", "#FBBF24"];
    return ["#2DD4BF", "#34D399"];
  }

  function getCotisationInfo() {
    if (cotisation?.statut === "payé")
      return {
        label: "Payée",
        sublabel: "À jour",
        icon: "checkmark" as const,
        color: "#10B981",
        isOk: true,
      };
    if (cotisation?.statut === "exonéré")
      return {
        label: "Exonéré",
        sublabel: "Exonéré",
        icon: "remove" as const,
        color: "#8A90A0",
        isOk: true,
      };
    return {
      label: "En retard",
      sublabel: "À régler",
      icon: "alert" as const,
      color: "#FB7185",
      isOk: false,
    };
  }

  const statutPoint = getStatutPoint();
  const cotisationInfo = getCotisationInfo();
  const moisLabel = new Date()
    .toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
    .toUpperCase();
  const initiales =
    menage?.nom
      ?.split(" ")
      .map((w: string) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "WE";

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#2DD4BF" />
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
            style={styles.hero}
          >
            <View style={styles.heroBubble1} />
            <View style={styles.heroBubble2} />

            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerGreeting}>Bonjour</Text>
                <Text style={styles.headerName}>
                  {menage?.nom?.toUpperCase() || "FAMILLE"}
                </Text>
                <Text style={styles.headerSub}>
                  {menage?.secteur?.nom} · {point?.nom}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/parametres")}
              >
                <View style={styles.avatarBtn}>
                  <Text style={styles.avatarText}>{initiales}</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.glassCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.glassLabel}>Cotisation · {moisLabel}</Text>
                <Text style={styles.glassVal}>{cotisationInfo.label}</Text>
                {!cotisationInfo.isOk && (
                  <TouchableOpacity
                    onPress={() => router.push("/(tabs)/paiement")}
                    style={styles.glassPayerBtn}
                  >
                    <Text style={styles.glassPayerText}>Payer →</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.glassRight}>
                <View style={styles.glassCheck}>
                  <Ionicons
                    name={cotisationInfo.icon}
                    size={22}
                    color={cotisationInfo.color}
                  />
                </View>
                <Text style={styles.glassCheckLabel}>
                  {cotisationInfo.sublabel}
                </Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.body}>
            {nbEnAttente > 0 && (
              <View style={styles.bannerAttente}>
                <Ionicons
                  name="cloud-upload-outline"
                  size={20}
                  color="#D97706"
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.bannerAttenteTitle}>
                    {nbEnAttente} pointage{nbEnAttente > 1 ? "s" : ""} en
                    attente
                  </Text>
                  <Text style={styles.bannerSub}>
                    Sera synchronisé au retour du réseau
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <View
                  style={[
                    styles.statIconWrap,
                    { backgroundColor: "rgba(45,212,191,0.14)" },
                  ]}
                >
                  <Ionicons name="trash-outline" size={16} color="#0E9384" />
                </View>
                <Text style={[styles.statVal, { color: "#2DD4BF" }]}>
                  {nbPointages}
                </Text>
                <Text style={styles.statLabel}>Dépôts ce mois</Text>
              </View>
              <View style={styles.statCard}>
                <View
                  style={[
                    styles.statIconWrap,
                    { backgroundColor: "rgba(59,130,246,0.14)" },
                  ]}
                >
                  <Ionicons name="home-outline" size={16} color="#3B82F6" />
                </View>
                <Text style={[styles.statVal, { color: "#3B82F6" }]}>
                  {nbMenagesPoint}
                </Text>
                <Text style={styles.statLabel}>Ménages affectés</Text>
              </View>
            </View>

            <View style={styles.pointCard}>
              <Text style={styles.pointLabel}>Mon point de collecte</Text>
              <View style={styles.pointRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pointNom}>{point?.nom}</Text>
                  <Text style={styles.pointSecteur}>
                    Secteur {point?.secteur?.nom}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statutBadge,
                    { backgroundColor: statutPoint.bg },
                  ]}
                >
                  <View
                    style={[
                      styles.statutDot,
                      { backgroundColor: statutPoint.dotColor },
                    ]}
                  />
                  <Text
                    style={[styles.statutText, { color: statutPoint.color }]}
                  >
                    {statutPoint.label}
                  </Text>
                </View>
              </View>
              <View style={styles.barRow}>
                <Text style={styles.barLabel}>Remplissage</Text>
                <Text style={styles.barPct}>{getPct()}%</Text>
              </View>
              <View style={styles.barTrack}>
                <LinearGradient
                  colors={getBarColor()}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    width: `${getPct()}%` as any,
                    height: "100%",
                    borderRadius: 999,
                  }}
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setShowModalPointage(true)}
              disabled={pointageLoading}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={["#2DD4BF", "#2BB6CC", "#3B82F6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.cta, pointageLoading && styles.ctaDisabled]}
              >
                <View style={styles.ctaBubble} />
                <View style={styles.ctaIconWrap}>
                  {pointageLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
                  )}
                </View>
                <View style={{ flex: 1, zIndex: 1 }}>
                  <Text style={styles.ctaTitle}>Je dépose mes déchets</Text>
                  <Text style={styles.ctaSub}>
                    Appuyez pour enregistrer un dépôt
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color="#FFFFFF"
                  style={{ zIndex: 1 }}
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showModalPointage}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModalPointage(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <View
              style={[
                styles.modalIcon,
                { backgroundColor: "rgba(45,212,191,0.12)" },
              ]}
            >
              <Ionicons name="location" size={28} color="#2DD4BF" />
            </View>
            <Text style={styles.modalTitle}>Confirmer le dépôt</Text>
            <Text style={styles.modalSub}>
              Voulez-vous enregistrer un dépôt au point {point?.nom} ?
            </Text>
            <View style={styles.modalInfo}>
              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>Point de collecte</Text>
                <Text style={styles.modalInfoVal}>{point?.nom}</Text>
              </View>
              <View style={styles.modalInfoRowLast}>
                <Text style={styles.modalInfoLabel}>Secteur</Text>
                <Text style={styles.modalInfoVal}>{point?.secteur?.nom}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handlePointage} activeOpacity={0.88}>
              <LinearGradient
                colors={["#2DD4BF", "#3B82F6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalBtn}
              >
                <Ionicons name="checkmark" size={18} color="#0E1210" />
                <Text style={styles.modalBtnText}>Confirmer le dépôt</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowModalPointage(false)}
              style={styles.modalBtnOutline}
            >
              <Text style={styles.modalBtnOutlineText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showConfirmation}
        transparent
        animationType="slide"
        onRequestClose={() => setShowConfirmation(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <View
              style={[
                styles.modalIcon,
                {
                  backgroundColor:
                    nbEnAttente > 0
                      ? "rgba(251,191,36,0.12)"
                      : "rgba(52,211,153,0.12)",
                },
              ]}
            >
              <Ionicons
                name={nbEnAttente > 0 ? "cloud-upload-outline" : "checkmark"}
                size={32}
                color={nbEnAttente > 0 ? "#D97706" : "#10B981"}
              />
            </View>
            <Text style={styles.modalTitle}>
              {nbEnAttente > 0
                ? "Dépôt enregistré localement"
                : "Dépôt enregistré !"}
            </Text>
            <Text style={styles.modalSub}>
              {nbEnAttente > 0
                ? "Il sera synchronisé au retour du réseau"
                : "Votre dépôt a bien été enregistré dans le système"}
            </Text>
            <View style={styles.modalInfo}>
              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>Point de collecte</Text>
                <Text style={styles.modalInfoVal}>{point?.nom}</Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>Secteur</Text>
                <Text style={styles.modalInfoVal}>{point?.secteur?.nom}</Text>
              </View>
              <View style={styles.modalInfoRowLast}>
                <Text style={styles.modalInfoLabel}>Heure</Text>
                <Text style={styles.modalInfoVal}>{heurePointage}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setShowConfirmation(false)}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={["#2DD4BF", "#3B82F6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalBtn}
              >
                <Text style={styles.modalBtnText}>Retour à l&apos;accueil</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
