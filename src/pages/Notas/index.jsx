import "../home/style.css";
import api from "../../services/api";
import { useEffect, useState, useMemo } from "react";
import { getUser, logout } from "../../services/auth";
import { useNavigate } from "react-router-dom";

function Notas() {
  const navigate = useNavigate();
  const user = getUser(); // { id, name, email }
  const draftKey = useMemo(() => (user ? `draft:${user.id}` : null), [user]);

  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [notas, setNotas] = useState([]);
  const [contador, setContador] = useState(0);    // "Nota 1, 2, 3..."
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carrega notas do servidor + contador local + rascunho por usuário
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/notas"); // backend identifica o usuário pelo token
        setNotas(data || []);
      } catch (err) {
        console.error("Erro ao carregar notas:", err);
        if (err?.response?.status === 401) {
          logout(); navigate("/login", { replace: true });
        }
      } finally {
        setLoading(false);
      }
    })();

    const c = Number(localStorage.getItem("contadorNotas") || "0");
    setContador(c);

    // restaura rascunho por usuário
    if (draftKey) {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        try {
          const d = JSON.parse(raw);
          setTitulo(d.titulo || "");
          setConteudo(d.conteudo || "");
        } catch {}
      }
    }
  }, [draftKey, navigate]);

  // salva rascunho ao digitar (persistente por usuário)
  useEffect(() => {
    if (!draftKey) return;
    localStorage.setItem(draftKey, JSON.stringify({ titulo, conteudo }));
  }, [draftKey, titulo, conteudo]);

  function tituloMiniatura(tit, body, proxNumero, tituloAnterior) {
    const t = (tit || "").trim();
    if (t) return t.length > 40 ? t.slice(0, 40) + "…" : t;

    const b = (body || "").trim();
    if (b) {
      const primeiraLinha = b.split("\n")[0];
      return primeiraLinha.length > 40 ? primeiraLinha.slice(0, 40) + "…" : primeiraLinha;
    }
    if (tituloAnterior) return tituloAnterior; // editando e limpou tudo
    return `Nota ${proxNumero}`;               // nova nota vazia
  }

  async function salvarNota() {
    const agora = new Date().toISOString();

    try {
      if (editingId) {
        // ATUALIZAR
        const existente = notas.find(n => n.id === editingId);
        const novoTitulo = tituloMiniatura(titulo, conteudo, contador, existente?.titulo);

        const { data } = await api.put(`/notas/${editingId}`, {
          titulo: novoTitulo,
          conteudo,
        });

        setNotas((prev) => prev.map(n => n.id === editingId
          ? { ...n, ...data, titulo: novoTitulo, conteudo, atualizadoEm: data?.atualizadoEm || agora }
          : n
        ));

        setEditingId(null);
        setTitulo("");
        setConteudo("");
        return;
      }

      // CRIAR nova
      let proxNumero = contador;
      if (!titulo.trim() && !conteudo.trim()) {
        proxNumero = contador + 1;
        setContador(proxNumero);
        localStorage.setItem("contadorNotas", String(proxNumero));
      }

      const novoTitulo = tituloMiniatura(titulo, conteudo, proxNumero, null);
      const { data } = await api.post("/notas", {
        titulo: novoTitulo,
        conteudo,
      });

      // `data` deve conter id, criadoEm, atualizadoEm...
      setNotas((prev) => [
        { ...data, titulo: novoTitulo, conteudo },
        ...prev,
      ]);

      setTitulo("");
      setConteudo("");
    } catch (err) {
      console.error("Erro ao salvar nota:", err);
      if (err?.response?.status === 401) {
        logout(); navigate("/login", { replace: true });
      }
    }
  }

  async function excluirNota(id) {
    const ok = window.confirm("tem certeza que deseja excluir essa nota? Pois não existe lixeira");
    if (!ok) return;
    try {
      await api.delete(`/notas/${id}`);
      setNotas((prev) => prev.filter((n) => n.id !== id));
      if (editingId === id) {
        setEditingId(null); setTitulo(""); setConteudo("");
      }
    } catch (err) {
      console.error("Erro ao excluir:", err);
    }
  }

  function sair() {
    logout();
    navigate("/login", { replace: true });
  }

  if (loading) return <div style={{padding:24}}>Carregando suas notas...</div>;

  return (
    <div className="notes-container">
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <h1>Bloco de Notas</h1>
        <div style={{display:"flex", gap:12, alignItems:"center"}}>
          <span style={{opacity:.7, fontSize:14}}>
            {user ? `Olá, ${user.name || user.email}` : ""}
          </span>
          <button className="btn-link" onClick={sair}>Sair</button>
        </div>
      </div>

      <p>Digite sua nota e salve para ver a miniatura abaixo.</p>

      <textarea
        className="note-title"
        placeholder={editingId ? "Título (editando…)" : "Título (opcional)"}
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
      />

      <textarea
        className="note-editor"
        placeholder="Digite aqui..."
        value={conteudo}
        onChange={(e) => setConteudo(e.target.value)}
      />

      <div className="actions" style={{ display: "flex", gap: 8 }}>
        <button className="btn-save" onClick={salvarNota}>
          {editingId ? "Salvar alterações" : "Salvar"}
        </button>
        {editingId && (
          <button
            type="button"
            className="btn-cancel"
            onClick={() => { setEditingId(null); setTitulo(""); setConteudo(""); }}
          >
            Cancelar
          </button>
        )}
      </div>

      <div className="thumbs">
        {notas.map((n) => (
          <div key={n.id} className="thumb-item">
            <button
              className="thumb"
              onClick={() => { setEditingId(n.id); setTitulo(n.titulo); setConteudo(n.conteudo); }}
              title="Clique para editar"
            >
              <div className="thumb-title">{n.titulo}</div>

              {n.conteudo?.trim() && (
                <p className="thumb-text">
                  {n.conteudo.length > 80 ? n.conteudo.slice(0, 80) + "…" : n.conteudo}
                </p>
              )}

              <small className="thumb-date">
                Atualizado em {new Date(n.atualizadoEm || n.criadoEm).toLocaleString()}
              </small>
            </button>

            <button
              className="btn-delete"
              onClick={() => excluirNota(n.id)}
              aria-label={`Excluir ${n.titulo}`}
              title="Excluir nota"
            >
              Excluir
            </button>
          </div>
        ))}

        {notas.length === 0 && (
          <div className="thumb-empty">Nenhuma nota ainda :)</div>
        )}
      </div>
    </div>
  );
}
export default Notas;
