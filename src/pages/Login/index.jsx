import "../home/style.css";
import api from "../../services/api";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { saveAuth } from "../../services/auth";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function doLogin(e) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      // ajuste o payload conforme seu backend (ex.: { name, email, password })
      const { data } = await api.post("/login", { email, password: senha });
      // data esperado: { token, user: { id, name, email } }
      saveAuth(data);
      navigate("/notas", { replace: true });
    } catch (err) {
      setErro("Credenciais inválidas. Verifique e tente novamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="home-container">
      <h1>Bloco de Notas</h1>
      <p>Entre para acessar suas notas.</p>

      <div className="login-container">
        <form id="auth" onSubmit={doLogin}>
          <div className="field">
            <label htmlFor="Email">Email</label>
            <input id="Email" type="email" value={email}
                   onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="Senha">Senha</label>
            <input id="Senha" type="password" value={senha}
                   onChange={(e) => setSenha(e.target.value)} required />
          </div>

          {erro && <div className="error" style={{color:"#b91c1c"}}>{erro}</div>}

          <div className="actions" style={{display:"flex", gap:8}}>
            <button type="submit" id="entrar" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
            <Link to="/cadastro" className="btn-link">Registre-se</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
export default Login;
