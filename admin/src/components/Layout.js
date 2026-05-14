import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabase";

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  const navItems = [
    { path: "/dashboard", label: "Tableau de bord", icon: "📊" },
    { path: "/menages", label: "Ménages", icon: "🏠" },
    { path: "/cotisations", label: "Cotisations", icon: "💳" },
    { path: "/points", label: "Points de collecte", icon: "📍" },
    { path: "/tournees", label: "Tournées", icon: "🚛" },
    { path: "/finances", label: "Finances", icon: "💰" },
  ];

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "DM Sans, sans-serif",
      }}
    >
      {/* SIDEBAR */}
      <aside
        style={{
          width: 220,
          background: "#0f1a14",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "22px 20px 18px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              background: "#1a8f69",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 17,
            }}
          >
            🌿
          </div>
          <div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "#fff",
                letterSpacing: -0.3,
              }}
            >
              Weu
            </div>
            <div
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.4)",
                marginTop: 1,
              }}
            >
              Administration · Madina
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav
          style={{
            padding: "16px 12px",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <div
            style={{
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: 1,
              color: "rgba(255,255,255,0.25)",
              padding: "10px 8px 4px",
              fontWeight: 600,
            }}
          >
            Principal
          </div>
          {navItems.slice(0, 3).map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: "9px 10px",
                borderRadius: 8,
                cursor: "pointer",
                color:
                  location.pathname === item.path
                    ? "#fff"
                    : "rgba(255,255,255,0.5)",
                background:
                  location.pathname === item.path ? "#1a8f69" : "transparent",
                border: "none",
                width: "100%",
                textAlign: "left",
                fontSize: 13,
                fontFamily: "inherit",
                fontWeight: location.pathname === item.path ? 500 : 400,
              }}
            >
              <span style={{ fontSize: 15, width: 18, textAlign: "center" }}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}

          <div
            style={{
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: 1,
              color: "rgba(255,255,255,0.25)",
              padding: "10px 8px 4px",
              fontWeight: 600,
            }}
          >
            Collecte
          </div>
          {navItems.slice(3, 5).map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: "9px 10px",
                borderRadius: 8,
                cursor: "pointer",
                color:
                  location.pathname === item.path
                    ? "#fff"
                    : "rgba(255,255,255,0.5)",
                background:
                  location.pathname === item.path ? "#1a8f69" : "transparent",
                border: "none",
                width: "100%",
                textAlign: "left",
                fontSize: 13,
                fontFamily: "inherit",
                fontWeight: location.pathname === item.path ? 500 : 400,
              }}
            >
              <span style={{ fontSize: 15, width: 18, textAlign: "center" }}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}

          <div
            style={{
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: 1,
              color: "rgba(255,255,255,0.25)",
              padding: "10px 8px 4px",
              fontWeight: 600,
            }}
          >
            Finances
          </div>
          {navItems.slice(5).map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: "9px 10px",
                borderRadius: 8,
                cursor: "pointer",
                color:
                  location.pathname === item.path
                    ? "#fff"
                    : "rgba(255,255,255,0.5)",
                background:
                  location.pathname === item.path ? "#1a8f69" : "transparent",
                border: "none",
                width: "100%",
                textAlign: "left",
                fontSize: 13,
                fontFamily: "inherit",
                fontWeight: location.pathname === item.path ? 500 : 400,
              }}
            >
              <span style={{ fontSize: 15, width: 18, textAlign: "center" }}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div
          style={{
            padding: "14px 12px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "9px 10px",
              borderRadius: 8,
              cursor: "pointer",
              color: "rgba(255,255,255,0.5)",
              background: "transparent",
              border: "none",
              width: "100%",
              textAlign: "left",
              fontSize: 13,
              fontFamily: "inherit",
            }}
          >
            <span style={{ fontSize: 15, width: 18, textAlign: "center" }}>
              🚪
            </span>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main
        style={{
          marginLeft: 220,
          flex: 1,
          background: "#f4faf7",
          minHeight: "100vh",
        }}
      >
        {children}
      </main>
    </div>
  );
}

export default Layout;
