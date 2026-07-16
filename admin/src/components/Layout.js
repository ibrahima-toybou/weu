import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabase";
import styles from "./Layout.module.css";

const NAV = [
  {
    section: "Principal",
    items: [
      { path: "/dashboard", label: "Tableau de bord", icon: "grid" },
      { path: "/menages", label: "Ménages", icon: "home" },
      { path: "/cotisations", label: "Cotisations", icon: "card" },
    ],
  },
  {
    section: "Collecte",
    items: [
      { path: "/points", label: "Points de collecte", icon: "location" },
      { path: "/tournees", label: "Tournées", icon: "car" },
    ],
  },
  {
    section: "Finances",
    items: [{ path: "/finances", label: "Finances", icon: "wallet" }],
  },
  {
    section: "Compte",
    items: [{ path: "/parametres", label: "Paramètres", icon: "settings" }],
  },
];

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  return (
    <div className={styles.wrap}>
      <aside className={styles.sidebar}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <img
              src="/icon.png"
              alt="Weu"
              style={{ width: 38, height: 38, borderRadius: 11 }}
            />
          </div>
          <div className={styles.logoText}>
            <div className={styles.logoName}>Weu</div>
            <div className={styles.logoSub}>Admin · Madina</div>
          </div>
        </div>

        {/* Nav */}
        {NAV.map((group) => (
          <div key={group.section}>
            <div className={styles.navSection}>{group.section}</div>
            {group.items.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`${styles.navBtn} ${isActive ? styles.navBtnActive : ""}`}
                >
                  <ion-icon
                    name={isActive ? item.icon : `${item.icon}-outline`}
                    className={styles.navIcon}
                  ></ion-icon>
                  <span className={styles.navLabel}>{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}

        {/* Footer */}
        <div className={styles.footer}>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <ion-icon
              name="log-out-outline"
              className={styles.navIcon}
            ></ion-icon>
            <span className={styles.navLabel}>Déconnexion</span>
          </button>
        </div>
      </aside>

      <main className={styles.main}>{children}</main>
    </div>
  );
}

export default Layout;
