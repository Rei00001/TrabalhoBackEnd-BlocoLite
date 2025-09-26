import "./style.css";
import api from "../../services/api";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const inputName = useRef(null);
  const inputEmail = useRef(null);
  const inputPassword = useRef(null);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [mensagem, setMensagem] = useState("");   // ✅ feedback de sucesso
  const [erro, setErro] = useState("");           // ❌ feedback de erro
  const [loading, setLoading] = useState(false);  // ⏳ estado de envio

  async function getUsers() {
    try {
      const { data } = await api.get("/usuarios");
      setUsers(data);
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
    }
  }

  async function createUsers(e) {
    if (e) e.preventDefault();
    setErro("");
    setMensagem("");
    setLoading(true);

    try {
      await api.post("/usuarios", {
        name: inputName.current.value,
        email: inputEmail.current.value,
        password: inputPassword.current.value,
      });

      await getUsers();

      // limpa inputs
      inputName.current.value = "";
      inputEmail.current.value = "";
      inputPassword.current.value = "";

      // mostra mensagem de sucesso
      setMensagem("Registrado!");

      // opcional: esconder após 2s
      setTimeout(() => setMensagem(""), 2000);
    } catch (err) {
      console.error("Erro ao criar usuário:", err);
      setErro("Não foi possível registrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div className="home-container">
      <h1>Bloco de Notas</h1>
      <p>Simples, prático e necessário</p>

      <div className="login-container">
        <form id="auth" method="post" onSubmit={createUsers}>
          <div className="field">
            <label htmlFor="Usuario">Usuário</label>
            <input
              type="text"
              id="Usuario"
              name="Usuario"
              placeholder="Digite seu nome"
              autoComplete="username"
              required
              minLength={3}
              ref={inputName}
            />
          </div>

          <div className="field">
            <label htmlFor="Email">Email</label>
            <input
              type="email"
              id="Email"
              name="Email"
              placeholder="Digite seu e-mail"
              autoComplete="email"
              required
              ref={inputEmail}
            />
          </div>

          <div className="field">
            <label htmlFor="Senha">Senha</label>
            <input
              type="password"
              id="Senha"
              name="Senha"
              placeholder="Digite sua senha"
              autoComplete="current-password"
              required
              minLength={6}
              ref={inputPassword}
            />
          </div>

          <div className="actions">
            <button type="submit" className="btn-main" disabled={loading}>
              {loading ? "Registrando..." : "Registrar"}
            </button>
          </div>

          <div className="actions">
            <button
              type="button"
              className="btn-link"
              onClick={() => navigate("/login")}
            >
              Já tenho conta
            </button>
          </div>

          {/* Área de feedback */}
          <div aria-live="polite" style={{ minHeight: 24, marginTop: 8 }}>
            {mensagem && <p className="msg-success">{mensagem}</p>}
            {erro && <p className="msg-error">{erro}</p>}
          </div>
        </form>
      </div>
    </div>
  );
}

export default Home;

