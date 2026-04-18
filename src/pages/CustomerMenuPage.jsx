import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "../styles/landingPage.css"; 

export default function CustomerMenuPage() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [orderForm, setOrderForm] = useState({
    nombreCliente: "",
    cantidad: 1,
    direccion: "",
    adicionales: ""
  });

  // 1. Cargar SOLO los platillos activos desde Supabase
  const cargarMenu = async () => {
    const { data, error } = await supabase
      .from('platillos')
      .select('*')
      .eq('estado', 'Activo') // Filtro clave para los inactivos
      .order('id', { ascending: true });

    if (!error) setItems(data);
  };

  useEffect(() => {
    cargarMenu();
  }, []);

  const openModal = (item) => {
    setSelectedItem(item);
    setOrderForm({ nombreCliente: "", cantidad: 1, direccion: "", adicionales: "" });
  };

  // 2. Cálculo del total (ahora el precio viene como número desde Supabase)
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

    const numeroTelefono = "51999999999"; // Cambiar por tu número real
    
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
    <div className="landing" style={{ minHeight: '100vh', paddingBottom: '60px' }}>
      <div className="hero-bg" />
      <div className="dots-pattern" />
      
      {/* Navbar simplificado con botón de volver */}
      <nav className="navbar">
        <div className="logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
           FAST<span>🔥</span>BITES
        </div>
        <button className="nav-btn" onClick={() => navigate('/')}>
          ← Volver al inicio
        </button>
      </nav>

      <section className="menu-section" style={{ paddingTop: '40px', background: 'transparent' }}>
        <p className="section-label">⭐ Para todos los gustos</p>
        <h2 className="section-title">Nuestro Menú Completo</h2>
        
        <div className="menu-grid">
          {items.map((item) => (
            <div className="menu-card" key={item.id}>
              {item.is_new && <span className="card-badge-new">Nuevo</span>}
              
              {/* Mostramos la imagen o el emoji si no hay imagen */}
              {item.imagen_url ? (
                <div style={{ width: '100%', height: '160px', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
                  <img src={item.imagen_url} alt={item.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : (
                <span className="card-emoji">{item.emoji || '🍔'}</span>
              )}
              
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

          {items.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#ffffff66', padding: '40px' }}>
              Cargando menú delicioso...
            </div>
          )}
        </div>
      </section>

      {/* --- FORMULARIO / MODAL DE PEDIDO --- */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Hacer Pedido</h3>
            <p className="modal-product-title">
              {selectedItem.emoji || '🍔'} {selectedItem.nombre} - S/. {Number(selectedItem.precio).toFixed(2)}
            </p>

            <div className="form-group">
              <label>TU NOMBRE</label>
              <input type="text" placeholder="Ej: Carlos Mendoza" value={orderForm.nombreCliente} onChange={e => setOrderForm({...orderForm, nombreCliente: e.target.value})} />
            </div>

            <div className="form-group">
              <label>CANTIDAD</label>
              <input type="number" min="1" value={orderForm.cantidad} onChange={e => setOrderForm({...orderForm, cantidad: e.target.value})} />
            </div>
            
            <div className="form-group">
              <label>DIRECCIÓN DE ENTREGA</label>
              <input type="text" placeholder="Ej: Av. Principal 123, Miraflores" value={orderForm.direccion} onChange={e => setOrderForm({...orderForm, direccion: e.target.value})} />
            </div>

            <div className="form-group">
              <label>ADICIONALES (Opcional)</label>
              <input type="text" placeholder="Ej: Sin cebolla, extra mayonesa" value={orderForm.adicionales} onChange={e => setOrderForm({...orderForm, adicionales: e.target.value})} />
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