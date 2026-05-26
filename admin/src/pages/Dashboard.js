import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { supabase } from "../supabase";
import styles from "./Dashboard.module.css";

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [utilisateur, setUtilisateur] = useState(null);
  const [points, setPoints] = useState([]);
  const [pointages, setPointages] = useState([]);
  const [menages, setMenages] = useState([]);
  const [cotisations, setCotisations] = useState([]);
  const [depenses, setDepenses] = useState([]);
  const [derniersPointages, setDerniersPointages] = useState([]);
  const [dernieresTournees, setDernieresTournees] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const [
      utilisateurRes,
      pointsRes,
      pointagesRes,
      menagesRes,
      cotisationsRes,
      depensesRes,
      derniersPointagesRes,
      dernieresTourneesRes,
    ] = await Promise.all([
      supabase
        .from("utilisateur")
        .select("nom, role")
        .eq("auth_id", user.id)
        .single(),
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
        .from("pointage")
        .select("*, menage(nom), point_collecte(nom)")
        .eq("statut_sync", "synchronisé")
        .order("date_heure", { ascending: false })
        .limit(5),
      supabase
        .from("tournee")
        .select("*, agent:id_utilisateur(nom)")
        .order("date", { ascending: false })
        .limit(3),
    ]);

    if (!utilisateurRes.error) setUtilisateur(utilisateurRes.data);
    if (!pointsRes.error) setPoints(pointsRes.data);
    if (!pointagesRes.error) setPointages(pointagesRes.data);
    if (!menagesRes.error) setMenages(menagesRes.data);
    if (!cotisationsRes.error) setCotisations(cotisationsRes.data);
    if (!depensesRes.error) setDepenses(depensesRes.data);
    if (!derniersPointagesRes.error)
      setDerniersPointages(derniersPointagesRes.data);
    if (!dernieresTourneesRes.error)
      setDernieresTournees(dernieresTourneesRes.data);
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

  function formatTemps(d) {
    if (!d) return "—";
    return (
      new Date(d).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
      }) +
      " · " +
      new Date(d).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }

  const activite = [
    ...derniersPointages.map((p) => ({
      type: "pointage",
      titre: `${p.menage?.nom || "Ménage"} a déposé au ${p.point_collecte?.nom || "point"}`,
      temps: p.date_heure,
      couleur: "#1a8f69",
    })),
    ...dernieresTournees.map((t) => ({
      type: "tournee",
      titre: `Tournée effectuée par ${t.agent?.nom || "agent"}`,
      temps: t.date,
      couleur: "#1a5c99",
    })),
  ]
    .sort((a, b) => new Date(b.temps) - new Date(a.temps))
    .slice(0, 7);

  return (
    <Layout>
      <div className={styles.page}>
        {/* HERO */}
        <div className={styles.hero}>
          <div className={styles.heroPattern} />
          <div className={styles.heroInner}>
            <div className={styles.heroLeft}>
              <h1>Bonjour, {utilisateur?.nom || "Administrateur"} 👋</h1>
              <p>Quartier Madina · Plateforme de gestion Weu</p>
            </div>
            <div className={styles.heroRight}>
              <div className={styles.heroDate}>Aujourd'hui</div>
              <div className={styles.heroDateVal}>{dateAujourdhui}</div>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className={styles.kpiRow}>
          <div className={styles.kpiCard}>
            <span className={styles.kpiEmoji}>🏠</span>
            <div className={styles.kpiLabel}>Ménages actifs</div>
            <div className={styles.kpiVal} style={{ color: "#1a8f69" }}>
              {totalMenages}
            </div>
            <div className={styles.kpiSub}>familles inscrites</div>
          </div>
          <div className={styles.kpiCard}>
            <span className={styles.kpiEmoji}>💳</span>
            <div className={styles.kpiLabel}>Cotisations ce mois</div>
            <div
              className={styles.kpiVal}
              style={{ color: "#1a5c99", fontSize: 22, marginTop: 4 }}
            >
              {totalCotisations.toLocaleString("fr-FR")} FC
            </div>
            <div className={styles.kpiSub}>
              {cotisationsMois.length} paiements reçus
            </div>
          </div>
          <div className={styles.kpiCard}>
            <span className={styles.kpiEmoji}>📍</span>
            <div className={styles.kpiLabel}>Points urgents</div>
            <div
              className={styles.kpiVal}
              style={{ color: pointsPleins.length > 0 ? "#c0392b" : "#1a8f69" }}
            >
              {pointsPleins.length}
            </div>
            <div className={styles.kpiSub}>
              {pointsPleins.length > 0
                ? "collecte urgente requise"
                : "aucune urgence"}
            </div>
          </div>
          <div className={styles.kpiCard}>
            <span className={styles.kpiEmoji}>💰</span>
            <div className={styles.kpiLabel}>Solde du mois</div>
            <div
              className={styles.kpiVal}
              style={{
                color: solde >= 0 ? "#1a8f69" : "#c0392b",
                fontSize: 22,
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

        {/* BODY */}
        <div className={styles.body}>
          <div className={styles.gridMain}>
            {/* Points de collecte */}
            <div className={styles.card} style={{ marginBottom: 0 }}>
              <div className={styles.cardHead}>
                <span className={styles.cardTitle}>📍 Points de collecte</span>
                <span className={styles.cardBadge}>Temps réel</span>
              </div>
              {loading ? (
                <div className={styles.loading}>Chargement...</div>
              ) : (
                <div className={styles.pointsList}>
                  {points.map((p) => {
                    const pct = getPct(p.id_point);
                    const statut = getStatut(p.id_point);
                    return (
                      <div key={p.id_point} className={styles.pointRow}>
                        <div>
                          <div className={styles.pointName}>{p.nom}</div>
                          <div className={styles.pointSec}>
                            {p.secteur?.nom}
                          </div>
                        </div>
                        <div className={styles.barTrack}>
                          <div
                            className={`${styles.barFill} ${statut === "plein" ? styles.fillPlein : statut === "moyen" ? styles.fillMoyen : styles.fillVide}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div
                          className={styles.pct}
                          style={{
                            color:
                              statut === "plein"
                                ? "#c0392b"
                                : statut === "moyen"
                                  ? "#e8a020"
                                  : "#1a8f69",
                          }}
                        >
                          {pct}%
                        </div>
                        <span
                          className={`${styles.chip} ${statut === "plein" ? styles.chipPlein : statut === "moyen" ? styles.chipMoyen : styles.chipVide}`}
                        >
                          {statut === "plein"
                            ? "🔴 Plein"
                            : statut === "moyen"
                              ? "🟠 Bientôt"
                              : "🟢 OK"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Alertes */}
            <div className={styles.card} style={{ marginBottom: 0 }}>
              <div className={styles.cardHead}>
                <span className={styles.cardTitle}>🔔 Alertes</span>
              </div>
              <div className={styles.alertesList}>
                {pointsPleins.length === 0 &&
                  pointsMoyens.length === 0 &&
                  solde >= 0 && (
                    <div className={styles.alerteEmpty}>
                      ✅ Tout est sous contrôle
                    </div>
                  )}
                {pointsPleins.map((p) => (
                  <div
                    key={p.id_point}
                    className={`${styles.alerte} ${styles.alerteRed}`}
                  >
                    <div className={styles.alerteT}>🚨 {p.nom} — Plein</div>
                    <div className={styles.alerteB}>
                      Collecte urgente — {getPct(p.id_point)}%
                    </div>
                  </div>
                ))}
                {pointsMoyens.map((p) => (
                  <div
                    key={p.id_point}
                    className={`${styles.alerte} ${styles.alerteOrange}`}
                  >
                    <div className={styles.alerteT}>
                      ⚠️ {p.nom} — En remplissage
                    </div>
                    <div className={styles.alerteB}>
                      À surveiller — {getPct(p.id_point)}%
                    </div>
                  </div>
                ))}
                {solde < 0 && (
                  <div className={`${styles.alerte} ${styles.alerteRed}`}>
                    <div className={styles.alerteT}>💸 Solde négatif</div>
                    <div className={styles.alerteB}>
                      Dépenses supérieures aux cotisations
                    </div>
                  </div>
                )}
                {cotisationsMois.length < totalMenages * 0.5 &&
                  totalMenages > 0 && (
                    <div className={`${styles.alerte} ${styles.alerteOrange}`}>
                      <div className={styles.alerteT}>
                        ⚠️ Faible recouvrement
                      </div>
                      <div className={styles.alerteB}>
                        {cotisationsMois.length}/{totalMenages} ménages ont payé
                        ce mois
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Activité récente */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.cardTitle}>⚡ Activité récente</span>
              <span className={styles.cardBadge}>
                {activite.length} événements
              </span>
            </div>
            <div className={styles.timeline}>
              {loading ? (
                <div className={styles.loading}>Chargement...</div>
              ) : activite.length === 0 ? (
                <div className={styles.tlEmpty}>Aucune activité récente</div>
              ) : (
                activite.map((a, i) => (
                  <div key={i} className={styles.timelineItem}>
                    <div
                      className={styles.tlDot}
                      style={{ color: a.couleur, background: a.couleur }}
                    />
                    <div className={styles.tlContent}>
                      <div className={styles.tlTitle}>{a.titre}</div>
                      <div className={styles.tlTime}>
                        {formatTemps(a.temps)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
