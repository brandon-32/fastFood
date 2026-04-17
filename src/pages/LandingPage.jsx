import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { supabase } from "../lib/supabaseClient"; 
import "../styles/landingPage.css"; 

export default function LandingPage() {
  const navigate = useNavigate(); 

  // --- ESTADOS ---
  const [destacados, setDestacados] = useState([]); // Platillos con la estrella activada
  const [selectedItem, setSelectedItem] = useState(null); // Producto para el modal
  const [orderForm, setOrderForm] = useState({
    nombreCliente: "",
    cantidad: 1,
    direccion: "",
    adicionales: ""
  });

  // --- CARGAR DATOS DESDE SUPABASE ---
  const cargarDestacados = async () => {
    const { data, error } = await supabase
      .from('platillos')
      .select('*')
      .eq('estado', 'Activo')
      .eq('destacado', true) // Solo los que marcaste en el panel
      .limit(4); // Límite para mantener el diseño limpio

    if (!error) setDestacados(data);
  };

  useEffect(() => {
    cargarDestacados();
  }, []);

  // --- LÓGICA DE PEDIDO ---
  const openModal = (item) => {
    setSelectedItem(item);
    // Reiniciamos el formulario cada vez que se abre
    setOrderForm({ nombreCliente: "", cantidad: 1, direccion: "", adicionales: "" });
  };

  // Cálculo del precio (ahora el precio es numérico desde la BD)
  const numericPrice = selectedItem ? Number(selectedItem.precio) : 0;
  const calculatedTotal = selectedItem ? (numericPrice * (orderForm.cantidad || 0)).toFixed(2) : "0.00";

  const handleConfirmOrder = () => {
    if (!orderForm.nombreCliente) {
      alert("Por favor ingresa tu nombre para el pedido.");
      return;
    }
    if (!orderForm.direccion) {
      alert("Por favor ingresa tu dirección para el envío.");
      return;
    }

    const numeroTelefono = "51999999999"; // Reemplaza con tu número real
    
    const mensaje = `*¡Hola! Quiero hacer un pedido:* 🛵\n\n` +
                    `👤 *A nombre de:* ${orderForm.nombreCliente}\n` +
                    `🍔 *Producto:* ${selectedItem.nombre}\n` +
                    `📦 *Cantidad:* ${orderForm.cantidad}\n` +
                    `💰 *Total a pagar:* S/. ${calculatedTotal}\n` +
                    `📍 *Dirección:* ${orderForm.direccion}\n` +
                    `📝 *Adicionales:* ${orderForm.adicionales || "Ninguno"}`;

    const url = `https://wa.me/${numeroTelefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
    
    setSelectedItem(null); 
  };

  return (
    <div className="landing">
      <div className="hero-bg" />
      <div className="dots-pattern" />

      {/* --- NAVBAR --- */}
      <nav className="navbar">
        <div className="logo">FAST<span>🔥</span>BITES</div>
        <button className="nav-btn" onClick={() => navigate('/login')}>
          Acceder al Panel
        </button>
      </nav>
      
      {/* --- HERO SECTION --- */}
      <section className="hero">
        <div className="hero-text">
          <div className="badge">🔥 Nuevo menú disponible</div>
          <h1>El sabor que <span className="accent">no puedes</span> olvidar</h1>
          <p>Ingredientes frescos, recetas auténticas y la mejor experiencia de comida rápida en Lima. ¡Pide ahora y recibe en 30 minutos!</p>
          <div className="hero-btns">
            <button className="btn-primary" onClick={() => navigate('/menu-completo')}>
              Ver Menú Completo →
            </button>
            {/* <button className="btn-secondary">Nuestras Sucursales</button> */}
          </div>
        </div>
        <div className="hero-visual">
          <div className="food-showcase">
            🍔
            <span className="food-orbit">🍟</span>
            <span className="food-orbit">🌮</span>
            <span className="food-orbit">🍕</span>
          </div>
        </div>
      </section>
      
      {/* --- SECCIÓN DESTACADOS (LO MÁS PEDIDO) --- */}
      <section className="menu-section">
        <p className="section-label">⭐ Nuestras especialidades</p>
        <h2 className="section-title">Lo más pedido</h2>
        <div className="menu-grid">
          {destacados.map((item) => (
            <div className="menu-card" key={item.id}>
              {item.is_new && <span className="card-badge-new">Nuevo</span>}
              
              {/* Imagen Dinámica */}
              <div className="card-image-container" style={{ width: '100%', height: '160px', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2B1400' }}>
                {item.imagen_url ? (
                  <img src={item.imagen_url} alt={item.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '3rem' }}>{item.emoji || '🍔'}</span>
                )}
              </div>

              <div className="card-name">{item.nombre}</div>
              <div className="card-desc" style={{ minHeight: '40px' }}>{item.descripcion}</div>
              <div className="card-price">S/. {Number(item.precio).toFixed(2)}</div>
              
              <div className="card-overlay">
                <button className="btn-pedir" onClick={() => openModal(item)}>
                  Pedir ahora
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- SECCIÓN GOOGLE MAPS --- */}
      <section className="location-section">
        <p className="section-label">📍 Visítanos</p>
        <h2 className="section-title">Nuestro punto de venta</h2>
        
        <div className="location-container">
          <div className="location-info">
            <h3>FAST🔥BITES - Local Principal</h3>
            <div className="info-item">
              <span className="info-icon">📍</span>
              <p>Av. Gral. Eugenio Garzón 799, Jesús María, Lima</p>
            </div>
            <div className="info-item">
              <span className="info-icon">🕒</span>
              <p>Lunes a Domingo<br/>12:00 PM a 11:00 PM</p>
            </div>
            <button 
              className="btn-secondary" 
              style={{marginTop: '24px'}}
              onClick={() => window.open('https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15607.728286950338!2d-77.056079!3d-12.07478!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c8c9bf726d69%3A0x7d6a5c13e7ec1e9a!2sJes%C3%BAs%20Mar%C3%ADa%2C%20Per%C3%BA!5e0!3m2!1ses!2s!4v1713290000000!5m2!1ses!2s', '_blank')}
            >
              Ver ruta en Google Maps 🗺️
            </button>
          </div>
          
          <div className="map-wrapper">
            {/* Iframe de Google Maps */}
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15607.728286950338!2d-77.056079!3d-12.07478!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c8c9bf726d69%3A0x7d6a5c13e7ec1e9a!2sJes%C3%BAs%20Mar%C3%ADa%2C%20Per%C3%BA!5e0!3m2!1ses!2s!4v1713290000000!5m2!1ses!2s" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>

      {/* --- MODAL DE PEDIDO --- */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Hacer Pedido</h3>
            <p className="modal-product-title">
              {selectedItem.nombre} - S/. {Number(selectedItem.precio).toFixed(2)}
            </p>

            <div className="form-group">
              <label>TU NOMBRE</label>
              <input 
                type="text" 
                placeholder="Ej: Juan Pérez" 
                value={orderForm.nombreCliente} 
                onChange={e => setOrderForm({...orderForm, nombreCliente: e.target.value})} 
              />
            </div>

            <div className="form-group">
              <label>CANTIDAD</label>
              <input 
                type="number" 
                min="1" 
                value={orderForm.cantidad} 
                onChange={e => setOrderForm({...orderForm, cantidad: e.target.value})} 
              />
            </div>
            
            <div className="form-group">
              <label>DIRECCIÓN DE ENTREGA</label>
              <input 
                type="text" 
                placeholder="Ej: Av. Brasil 456, Depto 201" 
                value={orderForm.direccion} 
                onChange={e => setOrderForm({...orderForm, direccion: e.target.value})} 
              />
            </div>

            <div className="form-group">
              <label>ADICIONALES (Opcional)</label>
              <input 
                type="text" 
                placeholder="Ej: Sin cremas, extra papas" 
                value={orderForm.adicionales} 
                onChange={e => setOrderForm({...orderForm, adicionales: e.target.value})} 
              />
            </div>

            <div className="modal-total">
              <span>Total a pagar:</span>
              <span className="total-amount">S/. {calculatedTotal}</span>
            </div>

            <div className="modal-btns">
              <button className="btn-cancel" onClick={() => setSelectedItem(null)}>Cancelar</button>
              <button className="btn-save" onClick={handleConfirmOrder}>Confirmar y Pedir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}