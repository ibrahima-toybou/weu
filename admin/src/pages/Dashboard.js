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
  const [tourneesUrgentes, setTourneesUrgentes] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const [
      pointsRes,
      pointagesRes,
      menagesRes,
      cotisationsRes,
      depensesRes,
      tourneesUrgentesRes,
    ] = await Promise.all([
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
      supabase
        .from("tournee")
        .select("id_tournee")
        .eq("statut", "en_cours")
        .eq("acceptee_par_agent", false),
    ]);
    if (!pointsRes.error) setPoints(pointsRes.data);
    if (!pointagesRes.error) setPointages(pointagesRes.data);
    if (!menagesRes.error) setMenages(menagesRes.data);
    if (!cotisationsRes.error) setCotisations(cotisationsRes.data);
    if (!depensesRes.error) setDepenses(depensesRes.data);
    if (!tourneesUrgentesRes.error)
      setTourneesUrgentes(tourneesUrgentesRes.data);
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
  const pointsOK = points.filter((p) => getStatut(p.id_point) === "vide");
  const totalMenages = menages.length;

  const totalPoints = points.length || 1;

  let angleStart = 0;
  const donutSegments = [
    { count: pointsPleins.length, color: "#FB7185" },
    { count: pointsMoyens.length, color: "#FBBF24" },
    { count: pointsOK.length, color: "#34D399" },
  ].filter((s) => s.count > 0);

  const donutPaths = donutSegments.map((s) => {
    const deg = (s.count / totalPoints) * 360;
    const path = { ...s, start: angleStart, end: angleStart + deg };
    angleStart += deg;
    return path;
  });

  const occupationPct =
    totalPoints > 0
      ? Math.round(
          ((pointsPleins.length + pointsMoyens.length) / totalPoints) * 100,
        )
      : 0;

  const occupationLabel =
    occupationPct >= 60 ? "critique" : occupationPct >= 30 ? "moyen" : "bon";

  const dateLabel = new Date().toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Layout>
      <div className={styles.page}>
        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.headerLogo}>
            <div className={styles.headerLogoIcon}>W</div>
            <div>
              <div className={styles.headerLogoName}>Weu</div>
              <div className={styles.headerLogoSub}>
                Administration · Madina
              </div>
            </div>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.headerDate}>
              <ion-icon
                name="calendar-outline"
                style={{ color: "#8A90A0", fontSize: 14 }}
              ></ion-icon>
              {dateLabel}
            </div>
            <div className={styles.headerAvatar}>MA</div>
          </div>
        </div>

        {/* MAIN */}
        <div className={styles.main}>
          {/* TITRE */}
          <div className={styles.pageTitle}>
            <div className={styles.pageTitleLeft}>
              <h1>Tableau de bord</h1>
              <p>Quartier Madina · Plateforme de gestion Weu</p>
            </div>
            <button
              className={styles.btnPlanifier}
              onClick={() => navigate("/tournees")}
            >
              <ion-icon name="add"></ion-icon>
              Planifier une tournée
            </button>
          </div>

          {/* KPIs */}
          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <div className={styles.kpiLabel}>Ménages actifs</div>
                <div
                  className={styles.kpiIconWrap}
                  style={{ background: "rgba(251,191,36,0.14)" }}
                >
                  <ion-icon
                    name="home-outline"
                    style={{ color: "#FBBF24", fontSize: 18 }}
                  ></ion-icon>
                </div>
              </div>
              <div>
                <div className={styles.kpiVal}>{totalMenages}</div>
                <div className={styles.kpiSub}>familles inscrites</div>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <div className={styles.kpiLabel}>Cotisations ce mois</div>
                <div
                  className={styles.kpiIconWrap}
                  style={{ background: "rgba(45,212,191,0.14)" }}
                >
                  <ion-icon
                    name="card-outline"
                    style={{ color: "#2DD4BF", fontSize: 18 }}
                  ></ion-icon>
                </div>
              </div>
              <div>
                <div className={styles.kpiVal} style={{ color: "#2DD4BF" }}>
                  {totalCotisations.toLocaleString("fr-FR")}
                  <span className={styles.kpiUnit}> FC</span>
                </div>
                <div className={styles.kpiSub}>
                  {cotisationsMois.length} paiements reçus
                </div>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <div className={styles.kpiLabel}>Points urgents</div>
                <div
                  className={styles.kpiIconWrap}
                  style={{ background: "rgba(251,113,133,0.12)" }}
                >
                  <ion-icon
                    name="location-outline"
                    style={{ color: "#FB7185", fontSize: 18 }}
                  ></ion-icon>
                </div>
              </div>
              <div>
                <div className={styles.kpiVal} style={{ color: "#FB7185" }}>
                  {pointsPleins.length}
                </div>
                <div className={styles.kpiSub}>
                  {pointsPleins.length > 0
                    ? "collecte urgente requise"
                    : "aucune urgence"}
                </div>
              </div>
            </div>

            <div className={`${styles.kpiCard} ${styles.kpiCardSolde}`}>
              <div className={styles.kpiHeader}>
                <div className={styles.kpiLabel}>Solde du mois</div>
                <div
                  className={styles.kpiIconWrap}
                  style={{ background: "rgba(52,211,153,0.14)" }}
                >
                  <ion-icon
                    name="trending-up-outline"
                    style={{ color: "#34D399", fontSize: 18 }}
                  ></ion-icon>
                </div>
              </div>
              <div>
                <div className={styles.kpiVal} style={{ color: "#34D399" }}>
                  {solde >= 0 ? "+" : ""}
                  {solde.toLocaleString("fr-FR")}
                  <span className={styles.kpiUnit}> FC</span>
                </div>
                <div className={styles.kpiSub}>
                  {solde >= 0 ? "excédent" : "déficit"}
                </div>
              </div>
            </div>
          </div>

          {/* BODY GRID */}
          <div className={styles.bodyGrid}>
            {/* Points de collecte */}
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div className={styles.cardTitle}>
                  Points de collecte
                  <span className={styles.cardBadge}>
                    {points.length} points
                  </span>
                </div>
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
                <>
                  <div className={styles.ptHeader}>
                    <div className={styles.ptHeaderCell}>Point de collecte</div>
                    <div className={styles.ptHeaderCell}>Ménages</div>
                    <div className={styles.ptHeaderCell}>Remplissage</div>
                    <div className={styles.ptHeaderCell}>Statut</div>
                  </div>
                  {points.map((p) => {
                    const pct = getPct(p.id_point);
                    const statut = getStatut(p.id_point);
                    const nbMenages = getNbMenages(p.id_point);
                    const barColor =
                      statut === "plein"
                        ? "#FB7185"
                        : statut === "moyen"
                          ? "#FBBF24"
                          : "#34D399";
                    const pctColor =
                      statut === "plein"
                        ? "#FB7185"
                        : statut === "moyen"
                          ? "#FBBF24"
                          : "#6B7185";
                    const chipStyle =
                      statut === "plein"
                        ? {
                            background: "rgba(251,113,133,0.14)",
                            color: "#FB7185",
                          }
                        : statut === "moyen"
                          ? {
                              background: "rgba(251,191,36,0.14)",
                              color: "#FBBF24",
                            }
                          : {
                              background: "rgba(52,211,153,0.12)",
                              color: "#34D399",
                            };
                    const chipLabel =
                      statut === "plein"
                        ? "Plein"
                        : statut === "moyen"
                          ? "Bientôt plein"
                          : "OK";
                    return (
                      <div
                        key={p.id_point}
                        className={`${styles.ptRow} ${statut === "plein" ? styles.ptRowPlein : statut === "moyen" ? styles.ptRowMoyen : ""}`}
                      >
                        <div>
                          <div className={styles.ptNom}>{p.nom}</div>
                          <div className={styles.ptZone}>{p.secteur?.nom}</div>
                        </div>
                        <div className={styles.ptMenages}>
                          <span className={styles.ptMenagesBadge}>
                            {nbMenages}
                          </span>
                        </div>
                        <div className={styles.ptBarWrap}>
                          <div className={styles.ptBarTrack}>
                            <div
                              className={styles.ptBarFill}
                              style={{ width: `${pct}%`, background: barColor }}
                            />
                          </div>
                          <span
                            className={styles.ptBarPct}
                            style={{ color: pctColor }}
                          >
                            {pct}%
                          </span>
                        </div>
                        <div className={styles.ptStatut}>
                          <span className={styles.ptChip} style={chipStyle}>
                            <span
                              className={styles.ptChipDot}
                              style={{ background: chipStyle.color }}
                            />
                            {chipLabel}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {/* Colonne droite */}
            <div className={styles.rightCol}>
              {/* Donut */}
              <div className={styles.donutCard}>
                <div className={styles.donutCardTitle}>
                  Occupation du réseau
                </div>
                <div className={styles.donutRow}>
                  <div className={styles.donutWrap}>
                    <svg className={styles.donutSvg} viewBox="0 0 124 124">
                      <circle
                        cx="62"
                        cy="62"
                        r="54"
                        fill="none"
                        stroke="rgba(15,23,42,0.08)"
                        strokeWidth="16"
                      />
                      {donutPaths.map((seg, i) => (
                        <circle
                          key={i}
                          cx="62"
                          cy="62"
                          r="54"
                          fill="none"
                          stroke={seg.color}
                          strokeWidth="16"
                          strokeDasharray={`${(seg.count / totalPoints) * 339.3} 339.3`}
                          strokeDashoffset={-((seg.start / 360) * 339.3)}
                          strokeLinecap="round"
                        />
                      ))}
                    </svg>
                    <div className={styles.donutCenter}>
                      <div className={styles.donutPct}>{occupationPct}%</div>
                      <div className={styles.donutLabel}>{occupationLabel}</div>
                    </div>
                  </div>
                  <div className={styles.donutLegend}>
                    <div className={styles.donutLegendItem}>
                      <div className={styles.donutLegendLeft}>
                        <div
                          className={styles.donutDot}
                          style={{ background: "#FB7185" }}
                        />
                        <span className={styles.donutLegendLabel}>Pleins</span>
                      </div>
                      <span className={styles.donutLegendVal}>
                        {pointsPleins.length}
                      </span>
                    </div>
                    <div className={styles.donutLegendItem}>
                      <div className={styles.donutLegendLeft}>
                        <div
                          className={styles.donutDot}
                          style={{ background: "#FBBF24" }}
                        />
                        <span className={styles.donutLegendLabel}>
                          Bientôt pleins
                        </span>
                      </div>
                      <span className={styles.donutLegendVal}>
                        {pointsMoyens.length}
                      </span>
                    </div>
                    <div className={styles.donutLegendItem}>
                      <div className={styles.donutLegendLeft}>
                        <div
                          className={styles.donutDot}
                          style={{ background: "#34D399" }}
                        />
                        <span className={styles.donutLegendLabel}>OK</span>
                      </div>
                      <span className={styles.donutLegendVal}>
                        {pointsOK.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alertes */}
              <div className={styles.alertesCard}>
                <div className={styles.alertesHeader}>
                  <div className={styles.alertesTitle}>Alertes</div>
                  <div className={styles.alertesSub}>
                    {pointsPleins.length +
                      pointsMoyens.length +
                      tourneesUrgentes.length}{" "}
                    à surveiller
                  </div>
                </div>
                <div className={styles.alertesList}>
                  {/* Tournées urgentes */}
                  {tourneesUrgentes.length > 0 && (
                    <div
                      className={styles.alerte}
                      style={{
                        background: "rgba(147,51,234,0.10)",
                        border: "1px solid rgba(147,51,234,0.18)",
                      }}
                      onClick={() => navigate("/tournees")}
                    >
                      <div
                        className={styles.alerteIcon}
                        style={{ background: "rgba(147,51,234,0.14)" }}
                      >
                        <ion-icon
                          name="flash-outline"
                          style={{ color: "#9333ea" }}
                        ></ion-icon>
                      </div>
                      <div className={styles.alerteContent}>
                        <div className={styles.alerteT}>
                          {tourneesUrgentes.length} tournée(s) urgente(s)
                        </div>
                        <div
                          className={styles.alerteB}
                          style={{ color: "#7e22ce" }}
                        >
                          En attente d'acceptation par l'agent
                        </div>
                      </div>
                      <span className={styles.alerteArrow}>›</span>
                    </div>
                  )}

                  {/* Tout sous contrôle */}
                  {pointsPleins.length === 0 &&
                    pointsMoyens.length === 0 &&
                    tourneesUrgentes.length === 0 &&
                    solde >= 0 && (
                      <div
                        className={styles.alerte}
                        style={{
                          background: "rgba(52,211,153,0.10)",
                          border: "1px solid rgba(52,211,153,0.18)",
                        }}
                      >
                        <div
                          className={styles.alerteIcon}
                          style={{ background: "rgba(52,211,153,0.14)" }}
                        >
                          <ion-icon
                            name="checkmark-outline"
                            style={{ color: "#34D399" }}
                          ></ion-icon>
                        </div>
                        <div className={styles.alerteContent}>
                          <div className={styles.alerteT}>
                            Tout est sous contrôle
                          </div>
                          <div
                            className={styles.alerteB}
                            style={{ color: "#3F9E76" }}
                          >
                            Aucune action requise
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Points pleins */}
                  {pointsPleins.length > 0 && (
                    <div
                      className={styles.alerte}
                      style={{
                        background: "rgba(251,113,133,0.10)",
                        border: "1px solid rgba(251,113,133,0.18)",
                      }}
                      onClick={() => navigate("/points")}
                    >
                      <div
                        className={styles.alerteIcon}
                        style={{ background: "rgba(251,113,133,0.14)" }}
                      >
                        <ion-icon
                          name="notifications-outline"
                          style={{ color: "#FB7185" }}
                        ></ion-icon>
                      </div>
                      <div className={styles.alerteContent}>
                        <div className={styles.alerteT}>
                          {pointsPleins.length} point(s) plein(s)
                        </div>
                        <div
                          className={styles.alerteB}
                          style={{ color: "#B06576" }}
                        >
                          Collecte urgente requise
                        </div>
                      </div>
                      <span className={styles.alerteArrow}>›</span>
                    </div>
                  )}

                  {/* Points bientôt pleins */}
                  {pointsMoyens.length > 0 && (
                    <div
                      className={styles.alerte}
                      style={{
                        background: "rgba(251,191,36,0.10)",
                        border: "1px solid rgba(251,191,36,0.18)",
                      }}
                      onClick={() => navigate("/points")}
                    >
                      <div
                        className={styles.alerteIcon}
                        style={{ background: "rgba(251,191,36,0.14)" }}
                      >
                        <ion-icon
                          name="warning-outline"
                          style={{ color: "#FBBF24" }}
                        ></ion-icon>
                      </div>
                      <div className={styles.alerteContent}>
                        <div className={styles.alerteT}>
                          {pointsMoyens.length} point(s) bientôt pleins
                        </div>
                        <div
                          className={styles.alerteB}
                          style={{ color: "#A07A1E" }}
                        >
                          À surveiller de près
                        </div>
                      </div>
                      <span className={styles.alerteArrow}>›</span>
                    </div>
                  )}

                  {/* Faible recouvrement */}
                  {cotisationsMois.length < totalMenages * 0.5 &&
                    totalMenages > 0 && (
                      <div
                        className={styles.alerte}
                        style={{
                          background: "rgba(251,191,36,0.10)",
                          border: "1px solid rgba(251,191,36,0.18)",
                        }}
                        onClick={() => navigate("/cotisations")}
                      >
                        <div
                          className={styles.alerteIcon}
                          style={{ background: "rgba(251,191,36,0.14)" }}
                        >
                          <ion-icon
                            name="stats-chart-outline"
                            style={{ color: "#FBBF24" }}
                          ></ion-icon>
                        </div>
                        <div className={styles.alerteContent}>
                          <div className={styles.alerteT}>
                            Faible recouvrement
                          </div>
                          <div
                            className={styles.alerteB}
                            style={{ color: "#A07A1E" }}
                          >
                            {cotisationsMois.length}/{totalMenages} ménages ont
                            payé
                          </div>
                        </div>
                        <span className={styles.alerteArrow}>›</span>
                      </div>
                    )}

                  {/* Solde */}
                  <div
                    className={styles.alerte}
                    style={{
                      background: "rgba(52,211,153,0.10)",
                      border: "1px solid rgba(52,211,153,0.18)",
                    }}
                  >
                    <div
                      className={styles.alerteIcon}
                      style={{ background: "rgba(52,211,153,0.14)" }}
                    >
                      <ion-icon
                        name="trending-up-outline"
                        style={{ color: "#34D399" }}
                      ></ion-icon>
                    </div>
                    <div className={styles.alerteContent}>
                      <div className={styles.alerteT}>
                        Solde {solde >= 0 ? "positif" : "négatif"}
                      </div>
                      <div
                        className={styles.alerteB}
                        style={{ color: "#3F9E76" }}
                      >
                        {solde >= 0
                          ? "Votre solde du mois est excédentaire"
                          : "Dépenses supérieures aux cotisations"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
