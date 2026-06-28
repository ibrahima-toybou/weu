import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { supabase } from "../supabase";
import styles from "./Tournees.module.css";

function Tournees() {
  const [tournees, setTournees] = useState([]);
  const [points, setPoints] = useState([]);
  const [pointages, setPointages] = useState([]);
  const [menages, setMenages] = useState([]);
  const [tourneesUrgentes, setTourneesUrgentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tourneeSelectionnee, setTourneeSelectionnee] = useState(null);
  const [detailsTournee, setDetailsTournee] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [filtreMois, setFiltreMois] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const [pointsSelectionnes, setPointsSelectionnes] = useState([]);
  const [dateUrgence, setDateUrgence] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [notesUrgence, setNotesUrgence] = useState("");
  const [successUrgence, setSuccessUrgence] = useState("");
  const [errorUrgence, setErrorUrgence] = useState("");
  const [loadingUrgence, setLoadingUrgence] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const [
      tourneesRes,
      pointsRes,
      pointagesRes,
      menagesRes,
      tourneesUrgentesRes,
    ] = await Promise.all([
      supabase
        .from("tournee")
        .select("*, agent:id_utilisateur(nom), createur:cree_par(nom)")
        .order("date", { ascending: false }),
      supabase.from("point_collecte").select("*, secteur(nom)").order("nom"),
      supabase
        .from("pointage")
        .select("id_point")
        .eq("statut_sync", "synchronisé"),
      supabase.from("menage").select("id_point").eq("statut", "actif"),
      supabase
        .from("tournee")
        .select("*, tournee_point(*, point_collecte(nom))")
        .eq("statut", "en_cours")
        .eq("acceptee_par_agent", false),
    ]);
    if (!tourneesRes.error) setTournees(tourneesRes.data);
    if (!pointsRes.error) setPoints(pointsRes.data);
    if (!pointagesRes.error) setPointages(pointagesRes.data);
    if (!menagesRes.error) setMenages(menagesRes.data);
    if (!tourneesUrgentesRes.error)
      setTourneesUrgentes(tourneesUrgentesRes.data);
    setLoading(false);
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
    const nm = getNbMenages(idPoint);
    if (nm === 0) return 0;
    return Math.min(Math.round((nb / nm) * 100), 100);
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

    setLoadingUrgence(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: adminData } = await supabase
      .from("utilisateur")
      .select("id_utilisateur")
      .eq("auth_id", user.id)
      .single();

    const { data: tourneeExistante } = await supabase
      .from("tournee")
      .select("*, tournee_point(id_point)")
      .eq("statut", "en_cours")
      .eq("acceptee_par_agent", false)
      .limit(1)
      .single();

    let idTournee;

    if (tourneeExistante) {
      idTournee = tourneeExistante.id_tournee;
      const pointsExistants =
        tourneeExistante.tournee_point?.map((tp) => tp.id_point) || [];
      const nouveauxPoints = pointsSelectionnes.filter(
        (id) => !pointsExistants.includes(id),
      );

      if (nouveauxPoints.length === 0) {
        setErrorUrgence(
          "Ces points sont déjà inclus dans la tournée urgente en attente",
        );
        setLoadingUrgence(false);
        return;
      }

      const notesActuelles = tourneeExistante.notes || "";
      const nouvelleNote = notesUrgence
        ? notesActuelles.includes(notesUrgence)
          ? notesActuelles
          : `${notesActuelles} · ${notesUrgence}`
        : notesActuelles;

      await supabase
        .from("tournee")
        .update({ notes: nouvelleNote })
        .eq("id_tournee", idTournee);

      for (const idPoint of nouveauxPoints) {
        await supabase.from("tournee_point").insert({
          id_tournee: idTournee,
          id_point: idPoint,
          heure_vidage: null,
          nb_pointages_au_vidage: getNbPointages(idPoint),
        });
      }
      setSuccessUrgence(
        `${nouveauxPoints.length} point(s) ajouté(s) à la tournée urgente existante !`,
      );
    } else {
      const { data: tournee, error: tourneeError } = await supabase
        .from("tournee")
        .insert({
          date: dateUrgence,
          id_utilisateur: 17,
          cree_par: adminData.id_utilisateur,
          notes: notesUrgence || "Tournée d'urgence créée par l'admin",
          statut: "en_cours",
          acceptee_par_agent: false,
        })
        .select()
        .single();

      if (tourneeError) {
        setErrorUrgence("Erreur lors de la création : " + tourneeError.message);
        setLoadingUrgence(false);
        return;
      }

      idTournee = tournee.id_tournee;
      for (const idPoint of pointsSelectionnes) {
        await supabase.from("tournee_point").insert({
          id_tournee: idTournee,
          id_point: idPoint,
          heure_vidage: null,
          nb_pointages_au_vidage: getNbPointages(idPoint),
        });
      }
      setSuccessUrgence("Tournée d'urgence créée et envoyée à l'agent !");
    }

    setPointsSelectionnes([]);
    setNotesUrgence("");
    setLoadingUrgence(false);
    fetchData();
  }

  function getStatutBadge(t) {
    if (t.statut === "terminée")
      return {
        bg: "rgba(52,211,153,0.12)",
        color: "#34D399",
        label: "Terminée",
      };
    if (t.statut === "en_cours" && !t.acceptee_par_agent)
      return {
        bg: "rgba(139,0,139,0.12)",
        color: "#9333ea",
        label: "Urgente — Non acceptée",
      };
    if (t.statut === "en_cours" && t.acceptee_par_agent)
      return {
        bg: "rgba(45,212,191,0.12)",
        color: "#2DD4BF",
        label: "En cours",
      };
    return {
      bg: "rgba(251,191,36,0.12)",
      color: "#FBBF24",
      label: "En attente",
    };
  }

  const pointsPleins = points.filter((p) => getStatut(p.id_point) === "plein");
  const pointsMoyens = points.filter((p) => getStatut(p.id_point) === "moyen");
  const tourneesFiltrees = tournees.filter((t) =>
    t.date?.startsWith(filtreMois),
  );
  const moisActuel = new Date().toISOString().slice(0, 7);
  const tourneesComois = tournees.filter((t) => t.date?.startsWith(moisActuel));
  const derniereTournee = tournees.find((t) => t.statut === "terminée");

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div className={styles.title}>Tournées</div>
          <div className={styles.sub}>
            Supervision et planification — Quartier Madina
          </div>
        </div>

        <div className={styles.gridTop}>
          {/* Propositions + Urgence */}
          <div className={styles.cardNoMargin}>
            <div className={styles.cardHead}>
              <div className={styles.cardTitle}>
                <ion-icon name="car-outline"></ion-icon>
                Propositions de tournées
              </div>
              <span style={{ fontSize: 12, color: "#6B7185" }}>
                Calculées en temps réel
              </span>
            </div>
            <div className={styles.propositionsBody}>
              {/* Tournées urgentes en attente */}
              {tourneesUrgentes.map((tu) => (
                <div
                  key={tu.id_tournee}
                  className={styles.propositionItem}
                  style={{
                    background: "rgba(147,51,234,0.08)",
                    border: "1px solid rgba(147,51,234,0.20)",
                  }}
                >
                  <div>
                    <div
                      className={styles.propositionTitre}
                      style={{
                        color: "#9333ea",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <ion-icon name="flash-outline"></ion-icon>
                      Tournée urgente — En attente d'acceptation
                    </div>
                    <div className={styles.propositionDesc}>
                      {tu.tournee_point
                        ?.map((tp) => tp.point_collecte?.nom)
                        .join(", ")}
                      {tu.notes ? ` — ${tu.notes}` : ""}
                    </div>
                  </div>
                  <span
                    style={{
                      background: "rgba(147,51,234,0.12)",
                      color: "#9333ea",
                      padding: "3px 10px",
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {tu.tournee_point?.length || 0} point(s)
                  </span>
                </div>
              ))}

              <div
                className={`${styles.propositionItem} ${pointsPleins.length > 0 ? styles.propositionPlein : styles.propositionOk}`}
              >
                <div>
                  <div
                    className={styles.propositionTitre}
                    style={{
                      color: pointsPleins.length > 0 ? "#FB7185" : "#34D399",
                    }}
                  >
                    Proposition A — Tournée immédiate
                  </div>
                  <div className={styles.propositionDesc}>
                    {pointsPleins.length > 0
                      ? `Points pleins : ${pointsPleins.map((p) => p.nom).join(", ")}`
                      : "Aucun point plein pour l'instant"}
                  </div>
                </div>
                {pointsPleins.length > 0 && (
                  <span className={styles.badgePlein}>
                    <ion-icon name="ellipse" style={{ fontSize: 8 }}></ion-icon>
                    {pointsPleins.length} point(s)
                  </span>
                )}
              </div>

              <div
                className={`${styles.propositionItem} ${pointsMoyens.length > 0 ? styles.propositionMoyen : styles.propositionOk}`}
              >
                <div>
                  <div
                    className={styles.propositionTitre}
                    style={{
                      color: pointsMoyens.length > 0 ? "#FBBF24" : "#34D399",
                    }}
                  >
                    Proposition B — Tournée demain
                  </div>
                  <div className={styles.propositionDesc}>
                    {pointsMoyens.length > 0
                      ? `Points en remplissage : ${[...pointsPleins, ...pointsMoyens].map((p) => p.nom).join(", ")}`
                      : "Aucun point en remplissage pour l'instant"}
                  </div>
                </div>
                {pointsMoyens.length > 0 && (
                  <span className={styles.badgeMoyen}>
                    <ion-icon name="ellipse" style={{ fontSize: 8 }}></ion-icon>
                    {pointsPleins.length + pointsMoyens.length} point(s)
                  </span>
                )}
              </div>

              {tourneesUrgentes.length === 0 &&
                pointsPleins.length === 0 &&
                pointsMoyens.length === 0 && (
                  <div
                    className={`${styles.propositionItem} ${styles.propositionOk}`}
                  >
                    <div
                      className={styles.propositionTitre}
                      style={{ color: "#34D399" }}
                    >
                      Tous les points sont dans un état acceptable
                    </div>
                    <div className={styles.propositionDesc}>
                      Aucune tournée nécessaire pour le moment
                    </div>
                  </div>
                )}
            </div>

            {/* Formulaire urgence */}
            <div
              className={styles.cardHead}
              style={{
                borderTop: "1px solid rgba(15,23,42,0.06)",
                borderBottom: "1px solid rgba(15,23,42,0.06)",
              }}
            >
              <div className={styles.cardTitle}>
                <ion-icon
                  name="alert-circle-outline"
                  style={{ color: "#FB7185" }}
                ></ion-icon>
                Créer une tournée d'urgence
              </div>
            </div>

            <form onSubmit={creerTourneeUrgence}>
              {errorUrgence && (
                <div className={styles.alertError}>{errorUrgence}</div>
              )}
              {successUrgence && (
                <div className={styles.alertSuccess}>{successUrgence}</div>
              )}

              <div className={styles.formSection}>
                <div className={styles.formSectionTitle}>Points à vider *</div>
                <div className={styles.pointsGrid}>
                  {points.map((p) => {
                    const statut = getStatut(p.id_point);
                    const selected = pointsSelectionnes.includes(p.id_point);
                    return (
                      <div
                        key={p.id_point}
                        onClick={() => togglePointSelection(p.id_point)}
                        className={`${styles.pointSelectCard} ${selected ? styles.pointSelectCardActive : ""}`}
                      >
                        <div className={styles.pointSelectNom}>
                          <span>{p.nom}</span>
                          {statut === "plein" && (
                            <span className={styles.badgePlein}>
                              <ion-icon
                                name="ellipse"
                                style={{ fontSize: 7 }}
                              ></ion-icon>
                            </span>
                          )}
                          {statut === "moyen" && (
                            <span className={styles.badgeMoyen}>
                              <ion-icon
                                name="ellipse"
                                style={{ fontSize: 7 }}
                              ></ion-icon>
                            </span>
                          )}
                          {statut === "vide" && (
                            <span className={styles.badgeVide}>
                              <ion-icon
                                name="ellipse"
                                style={{ fontSize: 7 }}
                              ></ion-icon>
                            </span>
                          )}
                        </div>
                        <div className={styles.pointSelectSub}>
                          {p.secteur?.nom} · {getPct(p.id_point)}%
                        </div>
                        {selected && (
                          <div className={styles.pointSelectCheck}>
                            <ion-icon name="checkmark-outline"></ion-icon>{" "}
                            Sélectionné
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Date *</label>
                    <input
                      type="date"
                      className={styles.input}
                      value={dateUrgence}
                      onChange={(e) => setDateUrgence(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Raison de l'urgence</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="ex: Odeur forte signalée"
                      value={notesUrgence}
                      onChange={(e) => setNotesUrgence(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.formFooter}>
                <button
                  type="button"
                  className={styles.btnOutline}
                  onClick={() => {
                    setPointsSelectionnes([]);
                    setNotesUrgence("");
                    setErrorUrgence("");
                    setSuccessUrgence("");
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className={styles.btnRed}
                  disabled={loadingUrgence}
                >
                  <ion-icon name="alert-circle-outline"></ion-icon>
                  {loadingUrgence
                    ? "Création..."
                    : "Créer la tournée d'urgence"}
                </button>
              </div>
            </form>
          </div>

          {/* Stats */}
          <div className={styles.cardNoMargin}>
            <div className={styles.cardHead}>
              <span className={styles.cardTitle}>Vue d'ensemble</span>
            </div>
            <div className={styles.statsBox}>
              <div className={styles.statItem}>
                <div className={styles.statLeft}>
                  <div
                    className={styles.statIconWrap}
                    style={{ background: "rgba(45,212,191,0.12)" }}
                  >
                    <ion-icon
                      name="car-outline"
                      style={{ color: "#2DD4BF", fontSize: 18 }}
                    ></ion-icon>
                  </div>
                  <div>
                    <div className={styles.statLabel}>Ce mois</div>
                    <div className={styles.statSub}>tournées effectuées</div>
                  </div>
                </div>
                <div className={styles.statVal} style={{ color: "#2DD4BF" }}>
                  {tourneesComois.length}
                </div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statLeft}>
                  <div
                    className={styles.statIconWrap}
                    style={{ background: "rgba(52,211,153,0.12)" }}
                  >
                    <ion-icon
                      name="checkmark-circle-outline"
                      style={{ color: "#34D399", fontSize: 18 }}
                    ></ion-icon>
                  </div>
                  <div>
                    <div className={styles.statLabel}>Total</div>
                    <div className={styles.statSub}>depuis le début</div>
                  </div>
                </div>
                <div className={styles.statVal} style={{ color: "#34D399" }}>
                  {tournees.length}
                </div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statLeft}>
                  <div
                    className={styles.statIconWrap}
                    style={{ background: "rgba(147,51,234,0.12)" }}
                  >
                    <ion-icon
                      name="flash-outline"
                      style={{ color: "#9333ea", fontSize: 18 }}
                    ></ion-icon>
                  </div>
                  <div>
                    <div className={styles.statLabel}>Urgentes</div>
                    <div className={styles.statSub}>
                      non acceptées par agent
                    </div>
                  </div>
                </div>
                <div className={styles.statVal} style={{ color: "#9333ea" }}>
                  {tourneesUrgentes.length}
                </div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statLeft}>
                  <div
                    className={styles.statIconWrap}
                    style={{ background: "rgba(251,113,133,0.12)" }}
                  >
                    <ion-icon
                      name="alert-circle-outline"
                      style={{ color: "#FB7185", fontSize: 18 }}
                    ></ion-icon>
                  </div>
                  <div>
                    <div className={styles.statLabel}>Points urgents</div>
                    <div className={styles.statSub}>à vider maintenant</div>
                  </div>
                </div>
                <div className={styles.statVal} style={{ color: "#FB7185" }}>
                  {pointsPleins.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Historique */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Historique des tournées</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="month"
                className={styles.moisInput}
                value={filtreMois}
                onChange={(e) => setFiltreMois(e.target.value)}
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
                  <th className={styles.th}>Statut</th>
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
                  tourneesFiltrees.map((t) => {
                    const badge = getStatutBadge(t);
                    return (
                      <tr key={t.id_tournee}>
                        <td className={styles.tdBold}>
                          {new Date(t.date).toLocaleDateString("fr-FR")}
                        </td>
                        <td className={styles.td}>
                          <span
                            className={styles.badgeStatut}
                            style={{ background: badge.bg, color: badge.color }}
                          >
                            ● {badge.label}
                          </span>
                        </td>
                        <td className={styles.td}>{t.notes || "—"}</td>
                        <td className={styles.td}>
                          <button
                            className={styles.btnVoir}
                            onClick={() => ouvrirDetails(t)}
                          >
                            <ion-icon name="eye-outline"></ion-icon>
                            Voir détails
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* POPUP DETAILS */}
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
                  {(() => {
                    const b = getStatutBadge(tourneeSelectionnee);
                    return <span style={{ color: b.color }}>● {b.label}</span>;
                  })()}
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
              <div className={styles.popupSection}>Points de la tournée</div>
              {loadingDetails ? (
                <div
                  style={{ textAlign: "center", color: "#8A90A0", padding: 16 }}
                >
                  Chargement...
                </div>
              ) : detailsTournee.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "#8A90A0",
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
                          color: "#2DD4BF",
                        }}
                      >
                        {d.nb_pointages_au_vidage} pointages
                      </div>
                      <div
                        style={{ fontSize: 11, color: "#6B7185", marginTop: 2 }}
                      >
                        {d.heure_vidage
                          ? new Date(d.heure_vidage).toLocaleTimeString(
                              "fr-FR",
                              { hour: "2-digit", minute: "2-digit" },
                            )
                          : "Non encore vidé"}
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
