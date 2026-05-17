import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // 1. Connexion via Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      setError("Email ou mot de passe incorrect");
      setLoading(false);
      return;
    }

    // 2. Récupérer le rôle dans notre table utilisateur
    const { data: userData, error: userError } = await supabase
      .from("utilisateur")
      .select("role, nom")
      .eq("auth_id", authData.user.id)
      .single();

    if (userError || !userData) {
      setError("Compte non trouvé dans le système");
      setLoading(false);
      return;
    }

    // 3. Redirection selon le rôle
    if (userData.role === "super_admin") {
      navigate("/dashboard");
    } else {
      setError("Accès refusé — interface réservée aux administrateurs");
      await supabase.auth.signOut();
    }

    setLoading(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #d6f0e6, #f4faf7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "DM Sans, sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "40px 36px",
          width: 380,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          border: "1px solid #c0ddd0",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 54,
              height: 54,
              background: "#1a8f69",
              borderRadius: 15,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              margin: "0 auto 12px",
            }}
          >
            🌿
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#0d6349" }}>
            Weu
          </div>
          <div style={{ fontSize: 13, color: "#7a9c8a", marginTop: 4 }}>
            Administration - Madina
          </div>
        </div>

        {/* Formulaire */}
        <form
          onSubmit={handleLogin}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#4a6a58",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              style={{
                width: "100%",
                marginTop: 6,
                border: "1px solid #c0ddd0",
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
                background: "#f4faf7",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#4a6a58",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: "100%",
                marginTop: 6,
                border: "1px solid #c0ddd0",
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
                background: "#f4faf7",
                boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <div
              style={{
                background: "#fdecea",
                border: "1px solid #f5b3b3",
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 13,
                color: "#8b1a1a",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? "#9fd4be" : "#1a8f69",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "12px",
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              marginTop: 4,
            }}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
