import styles from "./Login.module.css";

function ResetConfirm() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* PANNEAU MARQUE */}
        <div className={styles.brand}>
          <div className={styles.brandBubble1} />
          <div className={styles.brandBubble2} />
          <div className={styles.brandTop}>
            <img
              src="/icon.png"
              alt="Weu"
              style={{ width: 46, height: 46, borderRadius: 14 }}
            />
            <span className={styles.logoText}>Weu</span>
          </div>
          <div className={styles.brandMiddle}>
            <div className={styles.brandSurtitle}>
              Mot de passe réinitialisé
            </div>
            <h1 className={styles.brandTitle}>
              Votre mot de passe a été mis à jour.
            </h1>
            <p className={styles.brandDesc}>
              Vous pouvez maintenant vous connecter à l'application Weu avec
              votre nouveau mot de passe.
            </p>
          </div>
          <div className={styles.brandFooter}>
            <span className={styles.brandDot} />
            Quartier Madina · Plateforme Weu
          </div>
        </div>

        {/* PANNEAU DROIT */}
        <div className={styles.form}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 999,
                background: "rgba(45,212,191,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2DD4BF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h2 className={styles.formTitle}>Mot de passe mis à jour !</h2>
            <p className={styles.formSub} style={{ marginBottom: 32 }}>
              Votre nouveau mot de passe a bien été enregistré.
            </p>

            <div
              style={{
                background: "#F4F5F8",
                borderRadius: 14,
                padding: "20px",
                border: "1px solid rgba(15,23,42,0.07)",
                textAlign: "left",
                marginBottom: 24,
              }}
            >
              <p
                style={{
                  margin: "0 0 12px",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#1B1F2B",
                }}
              >
                Comment vous connecter ?
              </p>
              <p
                style={{
                  margin: "0 0 12px",
                  fontSize: 13,
                  color: "#6B7185",
                  lineHeight: 1.6,
                }}
              >
                Ouvrez l'application <strong>Weu</strong> sur votre téléphone et
                connectez-vous avec votre email et votre nouveau mot de passe.
              </p>
              <div
                style={{
                  background: "#FFFFFF",
                  borderRadius: 10,
                  padding: "12px 16px",
                  border: "1px solid rgba(15,23,42,0.07)",
                }}
              >
                <p style={{ margin: 0, fontSize: 13, color: "#6B7185" }}>
                  Disponible sur
                </p>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#1B1F2B",
                  }}
                >
                  Google Play · App Store
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetConfirm;
