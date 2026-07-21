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

  // Popup détail
  const [menageDetail, setMenageDetail] = useState(null);
  const [detailPointages, setDetailPointages] = useState([]);
  const [detailCotisations, setDetailCotisations] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Modal changement de point
  const [showModalPoint, setShowModalPoint] = useState(false);
  const [nouveauSecteurId, setNouveauSecteurId] = useState("");
  const [nouveauPointId, setNouveauPointId] = useState("");
  const [pointsModalFiltres, setPointsModalFiltres] = useState([]);
  const [savingPoint, setSavingPoint] = useState(false);

  // Modal archivage
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

  async function ouvrirDetail(menage) {
    setMenageDetail(menage);
    setDetailLoading(true);

    const moisActuel = new Date().toISOString().slice(0, 7);

    const [pointagesRes, cotisationsRes, utilisateurRes] = await Promise.all([
      supabase
        .from("pointage")
        .select("*, point_collecte(nom)")
        .eq("id_menage", menage.id_menage)
        .order("date_heure", { ascending: false })
        .limit(10),
      supabase
        .from("cotisation")
        .select("*")
        .eq("id_menage", menage.id_menage)
        .order("periode", { ascending: false })
        .limit(6),
      supabase
        .from("utilisateur")
        .select("email, telephone")
        .eq("id_menage", menage.id_menage)
        .single(),
    ]);

    setDetailPointages(pointagesRes.data || []);
    setDetailCotisations(cotisationsRes.data || []);

    if (utilisateurRes.data) {
      setMenageDetail((prev) => ({
        ...prev,
        email: utilisateurRes.data.email,
        tel_utilisateur: utilisateurRes.data.telephone,
      }));
    }

    setDetailLoading(false);
  }

  function fermerDetail() {
    setMenageDetail(null);
    setDetailPointages([]);
    setDetailCotisations([]);
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
    if (!error) {
      fetchData();
      if (menageDetail) ouvrirDetail({ ...menage, statut: nouveauStatut });
    }
  }

  async function confirmerArchivage() {
    const { error } = await supabase
      .from("menage")
      .update({ statut: "archive" })
      .eq("id_menage", menageAArchiver.id_menage);
    if (!error) {
      setShowModalArchive(false);
      setMenageAArchiver(null);
      fermerDetail();
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
      .eq("id_menage", menageDetail.id_menage);
    if (!error) {
      setShowModalPoint(false);
      setNouveauSecteurId("");
      setNouveauPointId("");
      fetchData();
      ouvrirDetail({
        ...menageDetail,
        id_point: parseInt(nouveauPointId),
        id_secteur: parseInt(nouveauSecteurId),
      });
    }
    setSavingPoint(false);
  }

  function ouvrirModalPoint() {
    setNouveauSecteurId(String(menageDetail.id_secteur));
    setNouveauPointId(String(menageDetail.id_point));
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

  function getCotBadge(statut) {
    if (statut === "payé") return styles.badgeCotPaye;
    if (statut === "exonéré") return styles.badgeCotExonere;
    return styles.badgeCotRetard;
  }

  function getCotLabel(statut) {
    if (statut === "payé") return "Payé";
    if (statut === "exonéré") return "Exonéré";
    return "En retard";
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

  const moisActuel = new Date().toISOString().slice(0, 7);
  const detailPointagesMois = detailPointages.filter((p) =>
    p.date_heure?.startsWith(moisActuel),
  ).length;
  const detailCotPayees = detailCotisations.filter(
    (c) => c.statut === "payé",
  ).length;
  const detailCotRetard = detailCotisations.filter(
    (c) => c.statut === "en_retard" || !c.statut,
  ).length;

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
                </tr>
              </thead>
              <tbody>
                {menagesFiltres.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={styles.tdEmpty}>
                      Aucun ménage trouvé
                    </td>
                  </tr>
                ) : (
                  menagesFiltres.map((m) => (
                    <tr
                      key={m.id_menage}
                      className={styles.trClickable}
                      onClick={() => ouvrirDetail(m)}
                    >
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* POPUP DÉTAIL MÉNAGE */}
      {menageDetail && (
        <div className={styles.modalOverlay} onClick={fermerDetail}>
          <div
            className={styles.detailPopup}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.detailHeader}>
              <div>
                <div className={styles.detailNom}>{menageDetail.nom}</div>
                <div className={styles.detailSub}>
                  {menageDetail.point_collecte?.nom} ·{" "}
                  {menageDetail.secteur?.nom}
                  <span
                    className={getBadgeClass(menageDetail.statut)}
                    style={{ marginLeft: 10 }}
                  >
                    {getStatutLabel(menageDetail.statut)}
                  </span>
                </div>
              </div>
              <button className={styles.modalClose} onClick={fermerDetail}>
                ✕
              </button>
            </div>

            {detailLoading ? (
              <div
                style={{ padding: 40, textAlign: "center", color: "#8A90A0" }}
              >
                Chargement...
              </div>
            ) : (
              <div className={styles.detailBody}>
                <div className={styles.detailColumn}>
                  {/* INFOS */}
                  <div className={styles.detailSection}>Informations</div>
                  <div className={styles.detailInfoGrid}>
                    <div className={styles.detailInfoItem}>
                      <div className={styles.detailInfoLabel}>Nom</div>
                      <div className={styles.detailInfoVal}>
                        {menageDetail.nom}
                      </div>
                    </div>
                    <div className={styles.detailInfoItem}>
                      <div className={styles.detailInfoLabel}>Téléphone</div>
                      <div className={styles.detailInfoVal}>
                        {menageDetail.telephone || "—"}
                      </div>
                    </div>
                    <div className={styles.detailInfoItem}>
                      <div className={styles.detailInfoLabel}>Email</div>
                      <div className={styles.detailInfoVal}>
                        {menageDetail.email || "—"}
                      </div>
                    </div>
                    <div className={styles.detailInfoItem}>
                      <div className={styles.detailInfoLabel}>Inscription</div>
                      <div className={styles.detailInfoVal}>
                        {new Date(
                          menageDetail.date_inscription,
                        ).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                    <div className={styles.detailInfoItem}>
                      <div className={styles.detailInfoLabel}>
                        Point de collecte
                      </div>
                      <div className={styles.detailInfoVal}>
                        {menageDetail.point_collecte?.nom || "—"}
                      </div>
                    </div>
                    <div className={styles.detailInfoItem}>
                      <div className={styles.detailInfoLabel}>Secteur</div>
                      <div className={styles.detailInfoVal}>
                        {menageDetail.secteur?.nom || "—"}
                      </div>
                    </div>
                  </div>

                  {/* RÉSUMÉ ACTIVITÉ */}
                  <div className={styles.detailSection}>Résumé d'activité</div>
                  <div className={styles.detailStatsRow}>
                    <div className={styles.detailStatCard}>
                      <div
                        className={styles.detailStatVal}
                        style={{ color: "#2DD4BF" }}
                      >
                        {detailPointagesMois}
                      </div>
                      <div className={styles.detailStatLabel}>Dépôts/mois</div>
                    </div>
                    <div className={styles.detailStatCard}>
                      <div
                        className={styles.detailStatVal}
                        style={{ color: "#3B82F6" }}
                      >
                        {detailPointages.length}
                      </div>
                      <div className={styles.detailStatLabel}>Total</div>
                    </div>
                    <div className={styles.detailStatCard}>
                      <div
                        className={styles.detailStatVal}
                        style={{ color: "#34D399" }}
                      >
                        {detailCotPayees}
                      </div>
                      <div className={styles.detailStatLabel}>Payés</div>
                    </div>
                    <div className={styles.detailStatCard}>
                      <div
                        className={styles.detailStatVal}
                        style={{ color: "#FB7185" }}
                      >
                        {detailCotRetard}
                      </div>
                      <div className={styles.detailStatLabel}>Retard</div>
                    </div>
                  </div>
                </div>

                <div className={styles.detailColumn}>
                  {/* DERNIERS POINTAGES */}
                  <div className={styles.detailSection}>Derniers dépôts</div>
                  {detailPointages.length === 0 ? (
                    <div className={styles.detailEmpty}>
                      Aucun dépôt enregistré
                    </div>
                  ) : (
                    <div className={styles.detailList}>
                      {detailPointages.slice(0, 5).map((p, i) => (
                        <div key={i} className={styles.detailListItem}>
                          <div className={styles.detailListLeft}>
                            <div className={styles.detailListTitle}>
                              {p.point_collecte?.nom}
                            </div>
                            <div className={styles.detailListSub}>
                              {new Date(p.date_heure).toLocaleDateString(
                                "fr-FR",
                              )}{" "}
                              ·{" "}
                              {new Date(p.date_heure).toLocaleTimeString(
                                "fr-FR",
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* COTISATIONS */}
                  <div className={styles.detailSection}>
                    Cotisations récentes
                  </div>
                  {detailCotisations.length === 0 ? (
                    <div className={styles.detailEmpty}>Aucune cotisation</div>
                  ) : (
                    <div className={styles.detailList}>
                      {detailCotisations.map((c, i) => (
                        <div key={i} className={styles.detailListItem}>
                          <div className={styles.detailListLeft}>
                            <div className={styles.detailListTitle}>
                              {new Date(c.periode).toLocaleDateString("fr-FR", {
                                month: "long",
                                year: "numeric",
                              })}
                            </div>
                            <div className={styles.detailListSub}>
                              {c.statut === "payé"
                                ? `Payé le ${new Date(c.date_paiement).toLocaleDateString("fr-FR")}`
                                : getCotLabel(c.statut)}
                            </div>
                          </div>
                          <span className={getCotBadge(c.statut)}>
                            {getCotLabel(c.statut)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ACTIONS */}
                  <div className={styles.detailSection}>Actions</div>
                  <div className={styles.detailActions}>
                    {menageDetail.statut !== "archive" && (
                      <button
                        className={styles.btnSmallBlue}
                        onClick={ouvrirModalPoint}
                      >
                        Changer le point de collecte
                      </button>
                    )}
                    {menageDetail.statut === "actif" && (
                      <button
                        className={styles.btnSmallOrange}
                        onClick={() => changerStatut(menageDetail, "suspendu")}
                      >
                        Suspendre
                      </button>
                    )}
                    {menageDetail.statut === "suspendu" && (
                      <>
                        <button
                          className={styles.btnSmallGreen}
                          onClick={() => changerStatut(menageDetail, "actif")}
                        >
                          Réactiver
                        </button>
                        <button
                          className={styles.btnSmallRed}
                          onClick={() => changerStatut(menageDetail, "archive")}
                        >
                          Archiver
                        </button>
                      </>
                    )}
                    {menageDetail.statut === "en_attente" && (
                      <button
                        className={styles.btnSmallRed}
                        onClick={() => changerStatut(menageDetail, "archive")}
                      >
                        Archiver
                      </button>
                    )}
                    {menageDetail.statut === "archive" && (
                      <span className={styles.badgeArchiveLabel}>
                        Archivé définitivement
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
                Ménage : <strong>{menageDetail?.nom}</strong>
                <br />
                Point actuel :{" "}
                <strong>{menageDetail?.point_collecte?.nom}</strong>
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
