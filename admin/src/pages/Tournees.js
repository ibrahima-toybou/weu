import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { supabase } from "../supabase";
import styles from "./Tournees.module.css";

function Tournees() {
  const [tournees, setTournees] = useState([]);
  const [points, setPoints] = useState([]);
  const [pointages, setPointages] = useState([]);
  const [menages, setMenages] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tourneeSelectionnee, setTourneeSelectionnee] = useState(null);
  const [detailsTournee, setDetailsTournee] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [filtreMois, setFiltreMois] = useState(
    new Date().toISOString().slice(0, 7),
  );

  // Formulaire urgence
  const [pointsSelectionnes, setPointsSelectionnes] = useState([]);
  const [dateUrgence, setDateUrgence] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [agentId, setAgentId] = useState("");
  const [notesUrgence, setNotesUrgence] = useState("");
  const [successUrgence, setSuccessUrgence] = useState("");
  const [errorUrgence, setErrorUrgence] = useState("");
  const [loadingUrgence, setLoadingUrgence] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);

    // Récupérer l'utilisateur connecté d'abord
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const [tourneesRes, pointsRes, pointagesRes, menagesRes] =
      await Promise.all([
        supabase
          .from("tournee")
          .select(
            `
            *,
            agent:id_utilisateur(nom),
            createur:cree_par(nom)
          `,
          )
          .order("date", { ascending: false }),
        supabase.from("point_collecte").select("*, secteur(nom)").order("nom"),
        supabase
          .from("pointage")
          .select("id_point")
          .eq("statut_sync", "synchronisé"),
        supabase.from("menage").select("id_point").eq("statut", "actif"),
      ]);

    if (!tourneesRes.error) setTournees(tourneesRes.data);
    if (!pointsRes.error) setPoints(pointsRes.data);
    if (!pointagesRes.error) setPointages(pointagesRes.data);
    if (!menagesRes.error) setMenages(menagesRes.data);

    // L'agent est toujours Hamidou (id: 17)
    setAgents([{ id_utilisateur: 17, nom: "Hamidou" }]);
    setAgentId(17);
    setLoading(false);
    console.log("tourneesRes data:", tourneesRes.data);
    console.log("tourneesRes error:", tourneesRes.error);
  }

  async function ouvrirDetails(tournee) {
    setTourneeSelectionnee(tournee);
    setLoadingDetails(true);

    const { data } = await supabase
      .from("tournee_point")
      .select("*, point_collecte(nom, secteur(nom))")
      .eq("id_tournee", tournee.id_tournee)
      .order("heure_vidage");

    setDetailsTournee(data || []);
    setLoadingDetails(false);
  }

  function getNbPointages(idPoint) {
    return pointages.filter((p) => p.id_point === idPoint).length;
  }

  function getNbMenages(idPoint) {
    return menages.filter((m) => m.id_point === idPoint).length;
  }

  function getPct(idPoint) {
    const nb = getNbPointages(idPoint);
    const nbMenages = getNbMenages(idPoint);
    if (nbMenages === 0) return 0;
    return Math.min(Math.round((nb / nbMenages) * 100), 100);
  }

  function getStatut(idPoint) {
    const pct = getPct(idPoint);
    if (pct >= 100) return "plein";
    if (pct >= 60) return "moyen";
    return "vide";
  }

  function togglePointSelection(idPoint) {
    setPointsSelectionnes((prev) =>
      prev.includes(idPoint)
        ? prev.filter((id) => id !== idPoint)
        : [...prev, idPoint],
    );
  }

  async function creerTourneeUrgence(e) {
    e.preventDefault();
    setErrorUrgence("");
    setSuccessUrgence("");

    if (pointsSelectionnes.length === 0) {
      setErrorUrgence("Sélectionnez au moins un point de collecte");
      return;
    }

    if (!agentId) {
      setErrorUrgence("Aucun agent disponible");
      return;
    }

    setLoadingUrgence(true);

    // Récupérer l'admin connecté
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: adminData } = await supabase
      .from("utilisateur")
      .select("id_utilisateur")
      .eq("auth_id", user.id)
      .single();

    // Créer la tournée
    const { data: tournee, error: tourneeError } = await supabase
      .from("tournee")
      .insert({
        date: dateUrgence,
        id_utilisateur: 17, // Hamidou — agent qui effectue la tournée
        cree_par: adminData.id_utilisateur, // Admin qui a créé la tournée
        notes: notesUrgence || "Tournée d'urgence créée par l'admin",
      })
      .select()
      .single();

    if (tourneeError) {
      setErrorUrgence("Erreur lors de la création : " + tourneeError.message);
      setLoadingUrgence(false);
      return;
    }

    // Enregistrer les points et vider les pointages
    for (const idPoint of pointsSelectionnes) {
      await supabase.from("tournee_point").insert({
        id_tournee: tournee.id_tournee,
        id_point: idPoint,
        heure_vidage: new Date().toISOString(),
        nb_pointages_au_vidage: getNbPointages(idPoint),
      });

      await supabase
        .from("pointage")
        .update({ statut_sync: "archivé" })
        .eq("id_point", idPoint)
        .eq("statut_sync", "synchronisé");
    }

    setSuccessUrgence("Tournée d'urgence créée avec succès !");
    setPointsSelectionnes([]);
    setNotesUrgence("");
    setLoadingUrgence(false);
    fetchData();
  }

  // Propositions automatiques
  const pointsPleins = points.filter((p) => getStatut(p.id_point) === "plein");
  const pointsMoyens = points.filter((p) => getStatut(p.id_point) === "moyen");

  // Filtrage historique
  const tourneesFiltrees = tournees.filter((t) =>
    t.date?.startsWith(filtreMois),
  );

  const moisActuel = new Date().toISOString().slice(0, 7);
  const tourneesComois = tournees.filter((t) => t.date?.startsWith(moisActuel));
  const derniereTournee = tournees[0];

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.title}>Tournées</div>
        <div className={styles.sub}>
          Supervision et planification — Quartier Madina
        </div>

        {/* KPIs */}
        <div className={styles.kpiGrid}>
          <div className={styles.kpi}>
            <div className={styles.kpiLabel}>Tournées ce mois</div>
            <div className={styles.kpiVal} style={{ color: "#1a8f69" }}>
              {tourneesComois.length}
            </div>
            <div className={styles.kpiSub}>tournées effectuées</div>
          </div>
          <div className={styles.kpi}>
            <div className={styles.kpiLabel}>Total tournées</div>
            <div className={styles.kpiVal} style={{ color: "#0d6349" }}>
              {tournees.length}
            </div>
            <div className={styles.kpiSub}>depuis le début</div>
          </div>
          <div className={styles.kpi}>
            <div className={styles.kpiLabel}>Dernière tournée</div>
            <div
              className={styles.kpiVal}
              style={{ fontSize: 16, marginTop: 8, color: "#1a5c99" }}
            >
              {derniereTournee
                ? new Date(derniereTournee.date).toLocaleDateString("fr-FR")
                : "—"}
            </div>
            <div className={styles.kpiSub}>
              {derniereTournee?.utilisateur?.nom || "—"}
            </div>
          </div>
          <div className={styles.kpi}>
            <div className={styles.kpiLabel}>Points urgents</div>
            <div className={styles.kpiVal} style={{ color: "#c0392b" }}>
              {pointsPleins.length}
            </div>
            <div className={styles.kpiSub}>à vider maintenant</div>
          </div>
        </div>

        {/* Propositions automatiques */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>
              🚛 Propositions de tournées
            </span>
            <span style={{ fontSize: 12, color: "#7a9c8a" }}>
              Calculées en temps réel
            </span>
          </div>
          <div
            style={{
              padding: "16px 18px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {/* Proposition A - Immédiate */}
            <div
              style={{
                background: pointsPleins.length > 0 ? "#fdecea" : "#f4faf7",
                border: `1px solid ${pointsPleins.length > 0 ? "#f5b3b3" : "#d8eee4"}`,
                borderRadius: 12,
                padding: "14px 16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: pointsPleins.length > 0 ? "#8b1a1a" : "#7a9c8a",
                    }}
                  >
                    Proposition A — Tournée immédiate
                  </div>
                  <div style={{ fontSize: 12, color: "#7a9c8a", marginTop: 4 }}>
                    {pointsPleins.length > 0
                      ? `Points pleins : ${pointsPleins.map((p) => p.nom).join(", ")}`
                      : "Aucun point plein pour l'instant"}
                  </div>
                </div>
                {pointsPleins.length > 0 && (
                  <span className={styles.badgePlein}>
                    🔴 {pointsPleins.length} point(s)
                  </span>
                )}
              </div>
            </div>

            {/* Proposition B - Demain */}
            <div
              style={{
                background: pointsMoyens.length > 0 ? "#fdf0e0" : "#f4faf7",
                border: `1px solid ${pointsMoyens.length > 0 ? "#f5d4a0" : "#d8eee4"}`,
                borderRadius: 12,
                padding: "14px 16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: pointsMoyens.length > 0 ? "#7a4a00" : "#7a9c8a",
                    }}
                  >
                    Proposition B — Tournée demain
                  </div>
                  <div style={{ fontSize: 12, color: "#7a9c8a", marginTop: 4 }}>
                    {pointsPleins.length > 0 && pointsMoyens.length > 0
                      ? `Points pleins + en remplissage : ${[...pointsPleins, ...pointsMoyens].map((p) => p.nom).join(", ")}`
                      : pointsMoyens.length > 0
                        ? `Points en remplissage : ${pointsMoyens.map((p) => p.nom).join(", ")}`
                        : "Aucun point en remplissage pour l'instant"}
                  </div>
                </div>
                {pointsMoyens.length > 0 && (
                  <span className={styles.badgeMoyen}>
                    🟠 {pointsPleins.length + pointsMoyens.length} point(s)
                  </span>
                )}
              </div>
            </div>

            {pointsPleins.length === 0 && pointsMoyens.length === 0 && (
              <div
                style={{
                  background: "#e6f5ec",
                  border: "1px solid #b8ddc8",
                  borderRadius: 12,
                  padding: "14px 16px",
                  fontSize: 13,
                  color: "#1a5c35",
                  fontWeight: 500,
                }}
              >
                ✅ Tous les points sont dans un état acceptable — Aucune tournée
                nécessaire
              </div>
            )}
          </div>
        </div>

        {/* Tournée d'urgence */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>
              🚨 Créer une tournée d'urgence
            </span>
          </div>
          <form onSubmit={creerTourneeUrgence}>
            {errorUrgence && (
              <div
                style={{
                  margin: "14px 18px 0",
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: "#fdecea",
                  border: "1px solid #f5b3b3",
                  color: "#8b1a1a",
                  fontSize: 13,
                }}
              >
                {errorUrgence}
              </div>
            )}
            {successUrgence && (
              <div
                style={{
                  margin: "14px 18px 0",
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: "#e6f5ec",
                  border: "1px solid #b8ddc8",
                  color: "#1a5c35",
                  fontSize: 13,
                }}
              >
                {successUrgence}
              </div>
            )}

            <div style={{ padding: 18 }}>
              {/* Sélection des points */}
              <div style={{ marginBottom: 16 }}>
                <div
                  className={styles.cardTitle}
                  style={{
                    fontSize: 12,
                    marginBottom: 10,
                    color: "#4a6a58",
                    textTransform: "uppercase",
                    letterSpacing: 0.4,
                  }}
                >
                  Points à vider *
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 8,
                  }}
                >
                  {points.map((p) => {
                    const statut = getStatut(p.id_point);
                    const selected = pointsSelectionnes.includes(p.id_point);
                    return (
                      <div
                        key={p.id_point}
                        onClick={() => togglePointSelection(p.id_point)}
                        style={{
                          border: `2px solid ${selected ? "#1a8f69" : "#c0ddd0"}`,
                          borderRadius: 10,
                          padding: "10px 12px",
                          cursor: "pointer",
                          background: selected ? "#e6f5ec" : "#f4faf7",
                          transition: "all 0.15s",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#1a2a20",
                            }}
                          >
                            {p.nom}
                          </div>
                          {statut === "plein" && (
                            <span className={styles.badgePlein}>🔴</span>
                          )}
                          {statut === "moyen" && (
                            <span className={styles.badgeMoyen}>🟠</span>
                          )}
                          {statut === "vide" && (
                            <span className={styles.badgeVide}>🟢</span>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#7a9c8a",
                            marginTop: 2,
                          }}
                        >
                          {p.secteur?.nom} · {getPct(p.id_point)}%
                        </div>
                        {selected && (
                          <div
                            style={{
                              fontSize: 11,
                              color: "#1a8f69",
                              fontWeight: 600,
                              marginTop: 4,
                            }}
                          >
                            ✓ Sélectionné
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Date et notes */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 5 }}
                >
                  <label
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#4a6a58",
                      textTransform: "uppercase",
                      letterSpacing: 0.4,
                    }}
                  >
                    Date *
                  </label>
                  <input
                    type="date"
                    value={dateUrgence}
                    onChange={(e) => setDateUrgence(e.target.value)}
                    style={{
                      border: "1px solid #c0ddd0",
                      borderRadius: 8,
                      padding: "9px 12px",
                      fontSize: 13,
                      color: "#1a2a20",
                      background: "#f4faf7",
                      fontFamily: "inherit",
                      outline: "none",
                    }}
                  />
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 5 }}
                >
                  <label
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#4a6a58",
                      textTransform: "uppercase",
                      letterSpacing: 0.4,
                    }}
                  >
                    Raison de l'urgence
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Odeur forte signalée par les habitants"
                    value={notesUrgence}
                    onChange={(e) => setNotesUrgence(e.target.value)}
                    style={{
                      border: "1px solid #c0ddd0",
                      borderRadius: 8,
                      padding: "9px 12px",
                      fontSize: 13,
                      color: "#1a2a20",
                      background: "#f4faf7",
                      fontFamily: "inherit",
                      outline: "none",
                    }}
                  />
                </div>
              </div>
            </div>

            <div
              style={{
                padding: "14px 18px",
                borderTop: "1px solid #d8eee4",
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setPointsSelectionnes([]);
                  setNotesUrgence("");
                  setErrorUrgence("");
                  setSuccessUrgence("");
                }}
                style={{
                  background: "transparent",
                  border: "1px solid #c0ddd0",
                  color: "#4a6a58",
                  borderRadius: 8,
                  padding: "8px 18px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loadingUrgence}
                style={{
                  background: loadingUrgence ? "#9fd4be" : "#c0392b",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 18px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: loadingUrgence ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                {loadingUrgence
                  ? "Création..."
                  : "🚨 Créer la tournée d'urgence"}
              </button>
            </div>
          </form>
        </div>

        {/* Historique */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Historique des tournées</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="month"
                value={filtreMois}
                onChange={(e) => setFiltreMois(e.target.value)}
                style={{
                  border: "1px solid #c0ddd0",
                  borderRadius: 8,
                  padding: "5px 10px",
                  fontSize: 12,
                  color: "#1a2a20",
                  background: "#f4faf7",
                  fontFamily: "inherit",
                  outline: "none",
                }}
              />
              <span className={styles.cardCount}>
                {tourneesFiltrees.length} tournée(s)
              </span>
            </div>
          </div>
          {loading ? (
            <div className={styles.tdLoading}>Chargement...</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Date</th>
                  <th className={styles.th}>Agent</th>
                  <th className={styles.th}>Notes</th>
                  <th className={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {tourneesFiltrees.length === 0 ? (
                  <tr>
                    <td colSpan={4} className={styles.tdEmpty}>
                      Aucune tournée ce mois-ci
                    </td>
                  </tr>
                ) : (
                  tourneesFiltrees.map((t, i) => (
                    <tr
                      key={t.id_tournee}
                      style={{ background: i % 2 === 0 ? "#fff" : "#f9fdf9" }}
                    >
                      <td className={styles.tdBold}>
                        {new Date(t.date).toLocaleDateString("fr-FR")}
                      </td>
                      <td className={styles.td}>{t.agent?.nom || "—"}</td>
                      <td className={styles.td}>{t.notes || "—"}</td>
                      <td className={styles.td}>
                        <button
                          className={styles.btnVoir}
                          onClick={() => ouvrirDetails(t)}
                        >
                          Voir détails
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* POPUP DETAILS TOURNEE */}
      {tourneeSelectionnee && (
        <div
          className={styles.overlay}
          onClick={() => setTourneeSelectionnee(null)}
        >
          <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
            <div className={styles.popupHead}>
              <div>
                <div className={styles.popupTitle}>
                  Tournée du{" "}
                  {new Date(tourneeSelectionnee.date).toLocaleDateString(
                    "fr-FR",
                  )}
                </div>
                <div className={styles.popupSub}>
                  Agent : {tourneeSelectionnee.utilisateur?.nom || "—"}
                </div>
              </div>
              <button
                className={styles.btnFermer}
                onClick={() => setTourneeSelectionnee(null)}
              >
                ✕
              </button>
            </div>
            <div className={styles.popupBody}>
              {tourneeSelectionnee.notes && (
                <>
                  <div className={styles.popupSection}>Notes</div>
                  <div className={styles.popupInfo}>
                    {tourneeSelectionnee.notes}
                  </div>
                </>
              )}
              <div className={styles.popupSection}>Points vidés</div>
              {loadingDetails ? (
                <div
                  style={{ textAlign: "center", color: "#7a9c8a", padding: 16 }}
                >
                  Chargement...
                </div>
              ) : detailsTournee.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "#7a9c8a",
                    fontSize: 13,
                  }}
                >
                  Aucun détail disponible
                </div>
              ) : (
                detailsTournee.map((d, i) => (
                  <div key={i} className={styles.popupItem}>
                    <div>
                      <div className={styles.popupItemNom}>
                        {d.point_collecte?.nom || "—"}
                      </div>
                      <div className={styles.popupItemSub}>
                        Secteur {d.point_collecte?.secteur?.nom || "—"}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#0d6349",
                        }}
                      >
                        {d.nb_pointages_au_vidage} pointages
                      </div>
                      <div
                        style={{ fontSize: 11, color: "#7a9c8a", marginTop: 2 }}
                      >
                        {new Date(d.heure_vidage).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Tournees;
