import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient"; // 1. Importamos Supabase
import "../styles/loginPage.css"; 

export default function LoginPage() {
  const navigate = useNavigate(); 
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); // 2. Estado para mostrar errores

  const handleSubmit = async () => {
    // Validamos que no estén vacíos
    if (!email || !pass) {
      setErrorMsg("Por favor, completa todos los campos.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    // 3. Autenticación real con Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: pass,
    });

    setLoading(false);

    if (error) {
      // Si la clave o el correo están mal
      setErrorMsg("Correo o contraseña incorrectos.");
      console.error("Error de login:", error.message);
    } else if (data.user) {
      // 4. Si es exitoso, entramos al inventario
      navigate('/inventario');
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-left-content">
          <div className="login-logo">FAST🔥BITES</div>
          <div className="login-tagline">Panel de administración</div>
          <div className="login-emoji">🍔</div>
        </div>
      </div>
      <div className="login-right">
        <div className="login-form-box">
          <h2>Bienvenido 👋</h2>
          <p>Ingresa tus credenciales para acceder al panel</p>
          
          <div className="form-group">
            <label>Correo electrónico</label>
            <input 
              type="email" 
              placeholder="admin@fastbites.pe" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
          </div>
          
          <div className="form-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={pass} 
              onChange={e => setPass(e.target.value)} 
            />
          </div>

          {/* Mostrar mensaje de error si existe */}
          {errorMsg && (
            <div style={{ color: '#EF4444', fontSize: '0.85rem', marginBottom: '16px', fontWeight: 'bold' }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <button className="btn-login" onClick={handleSubmit} disabled={loading}>
            {loading ? "Verificando..." : "Ingresar al Panel →"}
          </button>
          
          <span className="back-link" onClick={() => navigate('/')}>
            ← Volver al inicio
          </span>
        </div>
      </div>
    </div>
  );
}