import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { supabase } from "../supabase";
import styles from "./Menages.module.css";
import Select from "../components/Select";

function Menages() {
  const [success, setSuccess] = useState("");
  const [menages, setMenages] = useState([]);
  const [secteurs, setSecteurs] = useState([]);
  const [points, setPoints] = useState([]);
  const [pointsFiltres, setPointsFiltres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [secteurId, setSecteurId] = useState("");
  const [pointId, setPointId] = useState("");
  const [email, setEmail] = useState("");

  const [filtreStatut, setFiltreStatut] = useState("tous");
  const [filtreSecteur, setFiltreSecteur] = useState("tous");
  const [recherche, setRecherche] = useState("");

  const [menageSelectionne, setMenageSelectionne] = useState(null);
  const [showModalPoint, setShowModalPoint] = useState(false);
  const [nouveauSecteurId, setNouveauSecteurId] = useState("");
  const [nouveauPointId, setNouveauPointId] = useState("");
  const [pointsModalFiltres, setPointsModalFiltres] = useState([]);
  const [savingPoint, setSavingPoint] = useState(false);

  const [showModalArchive, setShowModalArchive] = useState(false);
  const [menageAArchiver, setMenageAArchiver] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (secteurId) {
      setPointsFiltres(
        points.filter((p) => p.id_secteur === parseInt(secteurId)),
      );
      setPointId("");
    } else {
      setPointsFiltres([]);
    }
  }, [secteurId, points]);

  useEffect(() => {
    if (nouveauSecteurId) {
      setPointsModalFiltres(
        points.filter((p) => p.id_secteur === parseInt(nouveauSecteurId)),
      );
      setNouveauPointId("");
    } else {
      setPointsModalFiltres([]);
    }
  }, [nouveauSecteurId, points]);

  async function fetchData() {
    setLoading(true);
    const [menagesRes, secteursRes, pointsRes] = await Promise.all([
      supabase
        .from("menage")
        .select("*, secteur(nom), point_collecte(nom)")
        .order("nom"),
      supabase.from("secteur").select("*").order("nom"),
      supabase.from("point_collecte").select("*").order("nom"),
    ]);
    if (!menagesRes.error) setMenages(menagesRes.data);
    if (!secteursRes.error) setSecteurs(secteursRes.data);
    if (!pointsRes.error) setPoints(pointsRes.data);
    setLoading(false);
  }

  async function handleCreer(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!nom || !secteurId || !pointId || !email) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("L'adresse email n'est pas valide");
      return;
    }

    const { data: emailExistant } = await supabase
      .from("utilisateur")
      .select("id_utilisateur")
      .eq("email", email)
      .single();
    if (emailExistant) {
      setError("Cet email est déjà utilisé par un autre ménage");
      return;
    }

    const { data, error } = await supabase.functions.invoke("creer-menage", {
      body: {
        nom,
        telephone,
        id_secteur: parseInt(secteurId),
        id_point: parseInt(pointId),
        email,
      },
    });

    if (error) {
      try {
        const errBody = await error.context?.json();
        const msgAnglais = errBody?.error || "";
        let msgFrancais = "Erreur lors de la création";
        if (msgAnglais.includes("already been registered"))
          msgFrancais = "Cet email est déjà utilisé";
        else if (msgAnglais.includes("invalid email"))
          msgFrancais = "Adresse email invalide";
        setError(msgFrancais);
      } catch {
        setError("Erreur lors de la création");
      }
      return;
    }

    if (data?.error) {
      setError("Erreur : " + data.error);
      return;
    }

    setSuccess("Ménage créé ! Un email d'invitation a été envoyé à " + email);
    setNom("");
    setTelephone("");
    setSecteurId("");
    setPointId("");
    setEmail("");
    fetchData();
  }

  async function changerStatut(menage, nouveauStatut) {
    if (nouveauStatut === "archive") {
      setMenageAArchiver(menage);
      setShowModalArchive(true);
      return;
    }
    const { error } = await supabase
      .from("menage")
      .update({ statut: nouveauStatut })
      .eq("id_menage", menage.id_menage);
    if (!error) fetchData();
  }

  async function confirmerArchivage() {
    const { error } = await supabase
      .from("menage")
      .update({ statut: "archive" })
      .eq("id_menage", menageAArchiver.id_menage);
    if (!error) {
      setShowModalArchive(false);
      setMenageAArchiver(null);
      fetchData();
    }
  }

  async function handleChangerPoint() {
    if (!nouveauPointId) return;
    setSavingPoint(true);

    const { error } = await supabase
      .from("menage")
      .update({
        id_point: parseInt(nouveauPointId),
        id_secteur: parseInt(nouveauSecteurId),
      })
      .eq("id_menage", menageSelectionne.id_menage);

    if (!error) {
      setShowModalPoint(false);
      setMenageSelectionne(null);
      setNouveauSecteurId("");
      setNouveauPointId("");
      fetchData();
    }
    setSavingPoint(false);
  }

  function ouvrirModalPoint(menage) {
    setMenageSelectionne(menage);
    setNouveauSecteurId(String(menage.id_secteur));
    setNouveauPointId(String(menage.id_point));
    setShowModalPoint(true);
  }

  function getBadgeClass(statut) {
    switch (statut) {
      case "actif":
        return styles.badgeActif;
      case "suspendu":
        return styles.badgeSuspendu;
      case "archive":
        return styles.badgeArchive;
      default:
        return styles.badgeAttente;
    }
  }

  function getStatutLabel(statut) {
    switch (statut) {
      case "actif":
        return "Actif";
      case "suspendu":
        return "Suspendu";
      case "archive":
        return "Archivé";
      case "en_attente":
        return "En attente";
      default:
        return statut;
    }
  }

  const menagesFiltres = menages.filter((m) => {
    const matchStatut = filtreStatut === "tous" || m.statut === filtreStatut;
    const matchSecteur =
      filtreSecteur === "tous" || m.id_secteur === parseInt(filtreSecteur);
    const matchRecherche = m.nom
      .toLowerCase()
      .includes(recherche.toLowerCase());
    return matchStatut && matchSecteur && matchRecherche;
  });

  const total = menages.length;
  const actifs = menages.filter((m) => m.statut === "actif").length;
  const suspendus = menages.filter((m) => m.statut === "suspendu").length;
  const archives = menages.filter((m) => m.statut === "archive").length;

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div className={styles.title}>Gestion des ménages</div>
          <div className={styles.sub}>
            Quartier Madina · {total} ménages inscrits
          </div>
        </div>

        <div className={styles.gridTop}>
          {/* Formulaire */}
          <div className={styles.cardNoMargin}>
            <div className={styles.cardHead}>
              <span className={styles.cardTitle}>Créer un nouveau ménage</span>
            </div>
            <form onSubmit={handleCreer}>
              {error && <div className={styles.alertError}>{error}</div>}
              {success && <div className={styles.alertSuccess}>{success}</div>}
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nom du ménage *</label>
                  <input
                    className={styles.input}
                    placeholder="ex: Famille Ahmed"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Téléphone</label>
                  <input
                    className={styles.input}
                    placeholder="+269 XX XX XX XX"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email *</label>
                  <input
                    className={styles.input}
                    type="email"
                    placeholder="email@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Secteur *</label>
                  <Select
                    value={secteurId}
                    onChange={(e) => setSecteurId(e.target.value)}
                    placeholder="Sélectionner un secteur..."
                    options={secteurs.map((s) => ({
                      value: String(s.id_secteur),
                      label: s.nom,
                    }))}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Point de collecte *</label>
                  <Select
                    value={pointId}
                    onChange={(e) => setPointId(e.target.value)}
                    placeholder="Sélectionner un point..."
                    disabled={!secteurId}
                    options={pointsFiltres.map((p) => ({
                      value: String(p.id_point),
                      label: p.nom,
                    }))}
                  />
                </div>
              </div>
              <div className={styles.formFooter}>
                <button
                  type="button"
                  className={styles.btnOutline}
                  onClick={() => {
                    setNom("");
                    setTelephone("");
                    setSecteurId("");
                    setPointId("");
                    setEmail("");
                    setError("");
                    setSuccess("");
                  }}
                >
                  Annuler
                </button>
                <button type="submit" className={styles.btnGreen}>
                  Créer le ménage
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
                <div>
                  <div className={styles.statLabel}>Total</div>
                  <div className={styles.statSub}>ménages inscrits</div>
                </div>
                <div className={styles.statVal} style={{ color: "#1B1F2B" }}>
                  {total}
                </div>
              </div>
              <div className={styles.statItem}>
                <div>
                  <div className={styles.statLabel}>Actifs</div>
                  <div className={styles.statSub}>participent au projet</div>
                </div>
                <div className={styles.statVal} style={{ color: "#2DD4BF" }}>
                  {actifs}
                </div>
              </div>
              <div className={styles.statItem}>
                <div>
                  <div className={styles.statLabel}>Suspendus</div>
                  <div className={styles.statSub}>temporairement</div>
                </div>
                <div className={styles.statVal} style={{ color: "#FBBF24" }}>
                  {suspendus}
                </div>
              </div>
              <div className={styles.statItem}>
                <div>
                  <div className={styles.statLabel}>Archivés</div>
                  <div className={styles.statSub}>départs définitifs</div>
                </div>
                <div className={styles.statVal} style={{ color: "#FB7185" }}>
                  {archives}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Liste */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Liste des ménages</span>
            <span className={styles.cardCount}>
              {menagesFiltres.length} résultat(s)
            </span>
          </div>
          <div className={styles.searchBar}>
            <input
              className={styles.searchInput}
              placeholder="Rechercher un ménage..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
            />
            <Select
              value={filtreSecteur}
              onChange={(e) => setFiltreSecteur(e.target.value)}
              options={[
                { value: "tous", label: "Tous les secteurs" },
                ...secteurs.map((s) => ({
                  value: String(s.id_secteur),
                  label: s.nom,
                })),
              ]}
            />
            <Select
              value={filtreStatut}
              onChange={(e) => setFiltreStatut(e.target.value)}
              options={[
                { value: "tous", label: "Tous les statuts" },
                { value: "actif", label: "Actifs" },
                { value: "en_attente", label: "En attente" },
                { value: "suspendu", label: "Suspendus" },
                { value: "archive", label: "Archivés" },
              ]}
            />
          </div>
          {loading ? (
            <div className={styles.tdLoading}>Chargement...</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Ménage</th>
                  <th className={styles.th}>Secteur</th>
                  <th className={styles.th}>Point de collecte</th>
                  <th className={styles.th}>Téléphone</th>
                  <th className={styles.th}>Inscription</th>
                  <th className={styles.th}>Statut</th>
                  <th className={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {menagesFiltres.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={styles.tdEmpty}>
                      Aucun ménage trouvé
                    </td>
                  </tr>
                ) : (
                  menagesFiltres.map((m) => (
                    <tr key={m.id_menage}>
                      <td className={styles.tdBold}>{m.nom}</td>
                      <td className={styles.td}>{m.secteur?.nom || "—"}</td>
                      <td className={styles.td}>
                        {m.point_collecte?.nom || "—"}
                      </td>
                      <td className={styles.td}>{m.telephone || "—"}</td>
                      <td className={styles.td}>
                        {new Date(m.date_inscription).toLocaleDateString(
                          "fr-FR",
                        )}
                      </td>
                      <td className={styles.td}>
                        <span className={getBadgeClass(m.statut)}>
                          {getStatutLabel(m.statut)}
                        </span>
                      </td>
                      <td className={styles.td}>
                        <div className={styles.actionsWrap}>
                          {m.statut !== "archive" && (
                            <button
                              className={styles.btnSmallBlue}
                              onClick={() => ouvrirModalPoint(m)}
                            >
                              Changer point
                            </button>
                          )}
                          {m.statut === "actif" && (
                            <button
                              className={styles.btnSmallOrange}
                              onClick={() => changerStatut(m, "suspendu")}
                            >
                              Suspendre
                            </button>
                          )}
                          {m.statut === "suspendu" && (
                            <>
                              <button
                                className={styles.btnSmallGreen}
                                onClick={() => changerStatut(m, "actif")}
                              >
                                Réactiver
                              </button>
                              <button
                                className={styles.btnSmallRed}
                                onClick={() => changerStatut(m, "archive")}
                              >
                                Archiver
                              </button>
                            </>
                          )}
                          {m.statut === "en_attente" && (
                            <button
                              className={styles.btnSmallRed}
                              onClick={() => changerStatut(m, "archive")}
                            >
                              Archiver
                            </button>
                          )}
                          {m.statut === "archive" && (
                            <span className={styles.badgeArchiveLabel}>
                              Archivé définitivement
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL CHANGEMENT DE POINT */}
      {showModalPoint && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowModalPoint(false)}
        >
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>
                Changer le point de collecte
              </span>
              <button
                className={styles.modalClose}
                onClick={() => setShowModalPoint(false)}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalSub}>
                Ménage : <strong>{menageSelectionne?.nom}</strong>
                <br />
                Point actuel :{" "}
                <strong>{menageSelectionne?.point_collecte?.nom}</strong>
              </p>
              <div className={styles.formGroup}>
                <label className={styles.label}>Nouveau secteur</label>
                <Select
                  value={nouveauSecteurId}
                  onChange={(e) => setNouveauSecteurId(e.target.value)}
                  placeholder="Sélectionner un secteur..."
                  options={secteurs.map((s) => ({
                    value: String(s.id_secteur),
                    label: s.nom,
                  }))}
                />
              </div>
              <div className={styles.formGroup} style={{ marginTop: 14 }}>
                <label className={styles.label}>
                  Nouveau point de collecte
                </label>
                <Select
                  value={nouveauPointId}
                  onChange={(e) => setNouveauPointId(e.target.value)}
                  placeholder="Sélectionner un point..."
                  disabled={!nouveauSecteurId}
                  options={pointsModalFiltres.map((p) => ({
                    value: String(p.id_point),
                    label: p.nom,
                  }))}
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.btnOutline}
                onClick={() => setShowModalPoint(false)}
              >
                Annuler
              </button>
              <button
                className={styles.btnGreen}
                onClick={handleChangerPoint}
                disabled={!nouveauPointId || savingPoint}
              >
                {savingPoint ? "Enregistrement..." : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ARCHIVAGE */}
      {showModalArchive && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowModalArchive(false)}
        >
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>Archiver le ménage</span>
              <button
                className={styles.modalClose}
                onClick={() => setShowModalArchive(false)}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalSub}>
                Vous êtes sur le point d'archiver le ménage{" "}
                <strong>{menageAArchiver?.nom}</strong>.
              </p>
              <div
                style={{
                  background: "rgba(251,113,133,0.08)",
                  border: "1px solid rgba(251,113,133,0.2)",
                  borderRadius: 12,
                  padding: "14px 16px",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: "#fb7185",
                    lineHeight: 1.6,
                  }}
                >
                  Attention — une fois archivé, ce ménage ne pourra plus être
                  réactivé.
                </p>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.btnOutline}
                onClick={() => setShowModalArchive(false)}
              >
                Annuler
              </button>
              <button className={styles.btnRed} onClick={confirmerArchivage}>
                Confirmer l'archivage
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Menages;
