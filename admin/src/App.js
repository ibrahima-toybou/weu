import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./supabase";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Menages from "./pages/Menages";
import Cotisations from "./pages/Cotisations";
import Points from "./pages/Points";
import Tournees from "./pages/Tournees";
import Finances from "./pages/Finances";
import Parametres from "./pages/Parametres";

function App() {
  useEffect(() => {
    async function checkJWT() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        console.log("JWT claims:", session.access_token);
        // Décoder le JWT pour voir les claims
        const payload = JSON.parse(atob(session.access_token.split(".")[1]));
        console.log("Payload décodé:", payload);
      }
    }
    checkJWT();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/menages" element={<Menages />} />
        <Route path="/cotisations" element={<Cotisations />} />
        <Route path="/points" element={<Points />} />
        <Route path="/tournees" element={<Tournees />} />
        <Route path="/finances" element={<Finances />} />
        <Route path="/parametres" element={<Parametres />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
