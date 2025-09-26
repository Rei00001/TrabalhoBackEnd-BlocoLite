// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/login";
import Notas from "./pages/notas";      // <— ajuste o caminho
import RequireAuth from "./components/RequireAuth";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Home />} />

        {/* protegidas */}
        <Route element={<RequireAuth />}>
          <Route path="/notas" element={<Notas />} />
        </Route>

        <Route path="*" element={<div style={{padding:24}}>Página não encontrada</div>} />
      </Routes>
    </BrowserRouter>
  );
}
