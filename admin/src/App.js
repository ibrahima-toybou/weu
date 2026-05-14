import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Menages from "./pages/Menages";
import Cotisations from "./pages/Cotisations";
import Points from "./pages/Points";
import Tournees from "./pages/Tournees";
import Finances from "./pages/Finances";

function App() {
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
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
