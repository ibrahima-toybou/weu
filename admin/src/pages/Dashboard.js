import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { supabase } from "../supabase";
import styles from "./Dashboard.module.css";

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState([]);
  const [pointages, setPointages] = useState([]);
  const [menages, setMenages] = useState([]);
  const [cotisations, setCotisations] = useState([]);
  const [depenses, setDepenses] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);

    const [pointsRes, pointagesRes, menagesRes, cotisationsRes, depensesRes] =
      await Promise.all([
        supabase.from("point_collecte").select("*, secteur(nom)").order("nom"),
        supabase
          .from("pointage")
          .select("id_point")
          .eq("statut_sync", "synchronisé"),
        supabase.from("menage").select("id_point").eq("statut", "actif"),
        supabase
          .from("cotisation")
          .select("montant, periode, statut")
          .eq("statut", "payé"),
        supabase.from("depense").select("montant, date"),
      ]);

    if (!pointsRes.error) setPoints(pointsRes.data);
    if (!pointagesRes.error) setPointages(pointagesRes.data);
    if (!menagesRes.error) setMenages(menagesRes.data);
    if (!cotisationsRes.error) setCotisations(cotisationsRes.data);
    if (!depensesRes.error) setDepenses(depensesRes.data);
    setLoading(false);
  }

  const getNbPointages = (id) =>
    pointages.filter((p) => p.id_point === id).length;
  const getNbMenages = (id) => menages.filter((m) => m.id_point === id).length;

  function getPct(id) {
    const nb = getNbPointages(id);
    const nm = getNbMenages(id);
    if (nm === 0) return 0;
    return Math.min(Math.round((nb / nm) * 100), 100);
  }

  function getStatut(id) {
    const p = getPct(id);
    if (p >= 100) return "plein";
    if (p >= 60) return "moyen";
    return "vide";
  }

  const moisActuel = new Date().toISOString().slice(0, 7);
  const cotisationsMois = cotisations.filter((c) =>
    c.periode?.startsWith(moisActuel),
  );
  const totalCotisations = cotisationsMois.reduce(
    (s, c) => s + parseFloat(c.montant || 0),
    0,
  );
  const totalDepenses = depenses
    .filter((d) => d.date?.startsWith(moisActuel))
    .reduce((s, d) => s + parseFloat(d.montant || 0), 0);
  const solde = totalCotisations - totalDepenses;
  const pointsPleins = points.filter((p) => getStatut(p.id_point) === "plein");
  const pointsMoyens = points.filter((p) => getStatut(p.id_point) === "moyen");
  const totalMenages = menages.length;

  const dateAujourdhui = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Layout>
      <div className={styles.page}>
        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1>Tableau de bord</h1>
            <p>Quartier Madina · Plateforme de gestion Weu</p>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.headerDateIcon}>
              <ion-icon name="calendar-number"></ion-icon>
            </span>
            <div>
              <div className={styles.headerDateLabel}>Aujourd'hui</div>
              <div className={styles.headerDateVal}>{dateAujourdhui}</div>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className={styles.kpiRow}>
          <div className={styles.kpiCard}>
            <div
              className={styles.kpiIconWrap}
              style={{ background: "#e8f8f0" }}
            >
              <ion-icon name="home"></ion-icon>
            </div>
            <div className={styles.kpiInfo}>
              <div className={styles.kpiLabel}>Ménages actifs</div>
              <div className={styles.kpiVal} style={{ color: "#0d6349" }}>
                {totalMenages}
              </div>
              <div className={styles.kpiSub}>familles inscrites</div>
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div
              className={styles.kpiIconWrap}
              style={{ background: "#e8f0fd" }}
            >
              <ion-icon name="wallet"></ion-icon>
            </div>
            <div className={styles.kpiInfo}>
              <div className={styles.kpiLabel}>Cotisations ce mois</div>
              <div
                className={styles.kpiVal}
                style={{ color: "#1a5c99", fontSize: 20, marginTop: 4 }}
              >
                {totalCotisations.toLocaleString("fr-FR")} FC
              </div>
              <div className={styles.kpiSub}>
                {cotisationsMois.length} paiements reçus
              </div>
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div
              className={styles.kpiIconWrap}
              style={{
                background: pointsPleins.length > 0 ? "#fef2f2" : "#e8f8f0",
              }}
            >
              <ion-icon name="location"></ion-icon>
            </div>
            <div className={styles.kpiInfo}>
              <div className={styles.kpiLabel}>Points urgents</div>
              <div
                className={styles.kpiVal}
                style={{
                  color: pointsPleins.length > 0 ? "#c0392b" : "#1a8f69",
                }}
              >
                {pointsPleins.length}
              </div>
              <div className={styles.kpiSub}>
                {pointsPleins.length > 0
                  ? "collecte urgente requise"
                  : "aucune urgence"}
              </div>
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div
              className={styles.kpiIconWrap}
              style={{ background: solde >= 0 ? "#e8f8f0" : "#fef2f2" }}
            >
              <ion-icon name="cash"></ion-icon>
            </div>
            <div className={styles.kpiInfo}>
              <div className={styles.kpiLabel}>Solde du mois</div>
              <div
                className={styles.kpiVal}
                style={{
                  color: solde >= 0 ? "#0d6349" : "#c0392b",
                  fontSize: 20,
                  marginTop: 4,
                }}
              >
                {solde >= 0 ? "+" : ""}
                {solde.toLocaleString("fr-FR")} FC
              </div>
              <div className={styles.kpiSub}>
                {solde >= 0 ? "excédent" : "déficit"}
              </div>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className={styles.body}>
          <div className={styles.gridMain}>
            {/* Points de collecte */}
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <span className={styles.cardTitle}>Points de collecte</span>
                <button
                  className={styles.cardLink}
                  onClick={() => navigate("/points")}
                >
                  Voir tous les points →
                </button>
              </div>
              {loading ? (
                <div className={styles.loading}>Chargement...</div>
              ) : (
                <table className={styles.ptTable}>
                  <thead>
                    <tr>
                      <th className={styles.ptTh}>Point de collecte</th>
                      <th className={styles.ptTh}>Ménages</th>
                      <th className={styles.ptTh}>Remplissage</th>
                      <th className={styles.ptTh}>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {points.map((p) => {
                      const pct = getPct(p.id_point);
                      const statut = getStatut(p.id_point);
                      const nbMenages = getNbMenages(p.id_point);
                      return (
                        <tr key={p.id_point}>
                          <td className={styles.ptTd}>
                            <div className={styles.ptNom}>{p.nom}</div>
                            <div className={styles.ptSec}>{p.secteur?.nom}</div>
                          </td>
                          <td className={styles.ptTd}>
                            <span className={styles.menageBadge}>
                              {nbMenages}
                            </span>
                          </td>
                          <td className={styles.ptTd}>
                            <div className={styles.barWrap}>
                              <div className={styles.barTrack}>
                                <div
                                  className={`${styles.barFill} ${
                                    statut === "plein"
                                      ? styles.fillPlein
                                      : statut === "moyen"
                                        ? styles.fillMoyen
                                        : styles.fillVide
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span
                                className={styles.barPct}
                                style={{
                                  color:
                                    statut === "plein"
                                      ? "#c0392b"
                                      : statut === "moyen"
                                        ? "#e67e22"
                                        : "#1a8f69",
                                }}
                              >
                                {pct}%
                              </span>
                            </div>
                          </td>
                          <td className={styles.ptTd}>
                            <span
                              className={`${styles.chip} ${
                                statut === "plein"
                                  ? styles.chipPlein
                                  : statut === "moyen"
                                    ? styles.chipMoyen
                                    : styles.chipVide
                              }`}
                            >
                              {statut === "plein"
                                ? "● Plein"
                                : statut === "moyen"
                                  ? "● Bientôt plein"
                                  : "● OK"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Alertes */}
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <span className={styles.cardTitle}>Alertes</span>
                <span style={{ fontSize: 11, color: "#7a9c8a" }}>
                  {pointsPleins.length + pointsMoyens.length} point(s) à
                  surveiller
                </span>
              </div>
              <div className={styles.alertesList}>
                {pointsPleins.length === 0 &&
                  pointsMoyens.length === 0 &&
                  solde >= 0 && (
                    <div className={styles.alerteEmpty}>
                      <ion-icon name="checkmark-circle"></ion-icon> Tout est
                      sous contrôle
                    </div>
                  )}
                {pointsPleins.length > 0 && (
                  <div
                    className={`${styles.alerte} ${styles.alerteRed}`}
                    onClick={() => navigate("/points")}
                  >
                    <div
                      className={styles.alerteIconWrap}
                      style={{ background: "#fdecea" }}
                    >
                      <ion-icon name="notifications"></ion-icon>
                    </div>
                    <div className={styles.alerteContent}>
                      <div className={styles.alerteT}>
                        {pointsPleins.length} point(s) plein(s)
                      </div>
                      <div className={styles.alerteB}>
                        Collecte urgente requise
                      </div>
                    </div>
                    <span className={styles.alerteArrow}>›</span>
                  </div>
                )}
                {pointsMoyens.length > 0 && (
                  <div
                    className={`${styles.alerte} ${styles.alerteOrange}`}
                    onClick={() => navigate("/points")}
                  >
                    <div
                      className={styles.alerteIconWrap}
                      style={{ background: "#fef5e7" }}
                    >
                      <ion-icon name="warning"></ion-icon>
                    </div>
                    <div className={styles.alerteContent}>
                      <div className={styles.alerteT}>
                        {pointsMoyens.length} point(s) bientôt pleins
                      </div>
                      <div className={styles.alerteB}>À surveiller de près</div>
                    </div>
                    <span className={styles.alerteArrow}>›</span>
                  </div>
                )}
                {cotisationsMois.length < totalMenages * 0.5 &&
                  totalMenages > 0 && (
                    <div
                      className={`${styles.alerte} ${styles.alerteOrange}`}
                      onClick={() => navigate("/cotisations")}
                    >
                      <div
                        className={styles.alerteIconWrap}
                        style={{ background: "#fef5e7" }}
                      >
                        <ion-icon name="stats-chart"></ion-icon>
                      </div>
                      <div className={styles.alerteContent}>
                        <div className={styles.alerteT}>
                          Faible recouvrement
                        </div>
                        <div className={styles.alerteB}>
                          {cotisationsMois.length} / {totalMenages} ménages ont
                          payé ce mois
                        </div>
                      </div>
                      <span className={styles.alerteArrow}>›</span>
                    </div>
                  )}
                {solde >= 0 && (
                  <div className={`${styles.alerte} ${styles.alerteGreen}`}>
                    <div
                      className={styles.alerteIconWrap}
                      style={{ background: "#e8f8f0" }}
                    >
                      <ion-icon name="checkmark"></ion-icon>
                    </div>
                    <div className={styles.alerteContent}>
                      <div className={styles.alerteT}>Solde positif</div>
                      <div className={styles.alerteB}>
                        Votre solde du mois est excédentaire
                      </div>
                    </div>
                  </div>
                )}
                {solde < 0 && (
                  <div
                    className={`${styles.alerte} ${styles.alerteRed}`}
                    onClick={() => navigate("/finances")}
                  >
                    <div
                      className={styles.alerteIconWrap}
                      style={{ background: "#fdecea" }}
                    >
                      <ion-icon name="trending-down"></ion-icon>
                    </div>
                    <div className={styles.alerteContent}>
                      <div className={styles.alerteT}>Solde négatif</div>
                      <div className={styles.alerteB}>
                        Dépenses supérieures aux cotisations
                      </div>
                    </div>
                    <span className={styles.alerteArrow}>›</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
