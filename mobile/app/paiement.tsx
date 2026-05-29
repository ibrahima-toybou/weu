import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "./supabase";
import { styles } from "./paiement.styles";

export default function Paiement() {
  const [loading, setLoading] = useState(true);
  const [menage, setMenage] = useState<any>(null);
  const [cotisation, setCotisation] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

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
      .select("*, menage(nom, point_collecte(nom), secteur(nom))")
      .eq("auth_id", user.id)
      .single();

    setMenage(utilisateur?.menage);

    const moisActuel = new Date().toISOString().slice(0, 7);
    const { data: cotisationData } = await supabase
      .from("cotisation")
      .select("*")
      .eq("id_menage", utilisateur?.menage?.id_menage)
      .like("periode", `${moisActuel}%`)
      .single();

    setCotisation(cotisationData);
    setLoading(false);
  }

  const moisLabel = new Date().toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

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
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payer ma cotisation</Text>
        </View>

        <View style={styles.body}>
          {/* Infos ménage */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Récapitulatif</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ménage</Text>
              <Text style={styles.infoVal}>{menage?.nom}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Point de collecte</Text>
              <Text style={styles.infoVal}>{menage?.point_collecte?.nom}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Période</Text>
              <Text style={styles.infoVal}>{moisLabel}</Text>
            </View>
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.infoLabel}>Montant</Text>
              <Text style={styles.infoValGreen}>3 000 FC</Text>
            </View>
            <View
              style={[
                styles.statutBadge,
                {
                  backgroundColor:
                    cotisation?.statut === "payé" ? "#e6f5ec" : "#fdecea",
                },
              ]}
            >
              <Text
                style={[
                  styles.statutText,
                  {
                    color:
                      cotisation?.statut === "payé" ? "#0d6349" : "#c0392b",
                  },
                ]}
              >
                {cotisation?.statut === "payé"
                  ? "✓ Payée"
                  : cotisation?.statut === "exonéré"
                    ? "🔘 Exonéré"
                    : "⚠️ En retard"}
              </Text>
            </View>
          </View>

          {/* Si déjà payé */}
          {cotisation?.statut === "payé" ? (
            <View style={styles.dejaPaye}>
              <Text style={styles.dejaPayeIcon}>✅</Text>
              <Text style={styles.dejaPayeTitle}>Cotisation payée !</Text>
              <Text style={styles.dejaPayeDate}>
                Payée le{" "}
                {new Date(cotisation.date_paiement).toLocaleDateString("fr-FR")}{" "}
                · {cotisation.mode_paiement}
              </Text>
            </View>
          ) : cotisation?.statut === "exonéré" ? (
            <View
              style={[
                styles.dejaPaye,
                { backgroundColor: "#f4faf7", borderColor: "#c0ddd0" },
              ]}
            >
              <Text style={styles.dejaPayeIcon}>🔘</Text>
              <Text style={[styles.dejaPayeTitle, { color: "#4a6a58" }]}>
                Exonéré ce mois
              </Text>
              <Text style={styles.dejaPayeDate}>
                Vous êtes exonéré pour {moisLabel}
              </Text>
            </View>
          ) : (
            <>
              {/* Paiement mobile */}
              <TouchableOpacity
                style={styles.btnMobile}
                onPress={() =>
                  Alert.alert(
                    "Paiement mobile",
                    "Cette fonctionnalité sera disponible prochainement.",
                  )
                }
              >
                <Text style={styles.btnMobileIcon}>📱</Text>
                <Text style={styles.btnMobileText}>Paiement mobile</Text>
              </TouchableOpacity>

              {/* Séparateur */}
              <View style={styles.separateur}>
                <View style={styles.separateurLine} />
                <Text style={styles.separateurText}>ou</Text>
                <View style={styles.separateurLine} />
              </View>

              {/* Cash */}
              <View style={styles.cashCard}>
                <Text style={styles.cashTitle}>💵 Payer en cash</Text>
                <Text style={styles.cashDesc}>
                  Remettez 3 000 FC à l'agent de votre secteur. Il enregistrera
                  votre paiement dans le système.
                </Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
