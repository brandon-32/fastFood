import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient"; 
import "../styles/inventarioPage.css"; 

export default function MenuPage() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [mostrarInactivos, setMostrarInactivos] = useState(false);

  // --- NUEVO: Estado para manejar el archivo de imagen seleccionado ---
  const [imageFile, setImageFile] = useState(null);

  // Cambiamos "emoji" por "imagen_url" en el estado inicial
  const [form, setForm] = useState({ 
    imagen_url: "", 
    nombre: "", 
    descripcion: "", 
    precio: "", 
    is_new: false,
    destacado: false, 
    estado: "Activo" 
  });

  const cargarMenu = async () => {
    const { data, error } = await supabase
      .from('platillos')
      .select('*')
      .order('id', { ascending: true });

    if (!error) setItems(data);
  };

  useEffect(() => {
    cargarMenu();
  }, []);

  const platillosVisibles = items.filter(item => 
    mostrarInactivos ? true : item.estado === 'Activo'
  );

  // --- FUNCIÓN GUARDAR MEJORADA CON SUBIDA DE IMÁGENES ---
  const saveItem = async () => {
    if (!form.nombre || !form.precio) {
      alert("El nombre y el precio son obligatorios.");
      return;
    }

    let finalImageUrl = form.imagen_url;

    // Si el usuario seleccionó una imagen nueva, la subimos a Supabase Storage primero
    if (imageFile) {
      // 1. Generamos un nombre único para la imagen
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `platillos/${fileName}`;

      // 2. Subimos el archivo al bucket 'menu-imagenes'
      const { error: uploadError } = await supabase.storage
        .from('menu-imagenes')
        .upload(filePath, imageFile);

      if (uploadError) {
        alert("Error al subir la imagen: " + uploadError.message);
        return;
      }

      // 3. Obtenemos el link público de la imagen recién subida
      const { data: publicUrlData } = supabase.storage
        .from('menu-imagenes')
        .getPublicUrl(filePath);

      finalImageUrl = publicUrlData.publicUrl;
    }

    // Ahora guardamos los datos en la tabla (incluyendo el nuevo link de la imagen)
    const platilloData = {
      imagen_url: finalImageUrl,
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio: Number(form.precio),
      is_new: form.is_new,
      destacado: form.destacado,
      estado: form.estado
    };

    if (editingId) {
      const { data, error } = await supabase.from('platillos').update(platilloData).eq('id', editingId).select();
      if (!error && data) {
        setItems(prev => prev.map(item => item.id === editingId ? data[0] : item));
        closeModal();
      }
    } else {
      const { data, error } = await supabase.from('platillos').insert([platilloData]).select(); 
      if (!error && data) {
        setItems(prev => [...prev, data[0]]);
        closeModal();
      }
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este platillo por completo?")) return;
    const { error } = await supabase.from('platillos').delete().eq('id', id);
    if (!error) setItems(prev => prev.filter(i => i.id !== id));
  };

  const openNewModal = () => {
    setEditingId(null);
    setImageFile(null); // Limpiamos el archivo seleccionado
    setForm({ imagen_url: "", nombre: "", descripcion: "", precio: "", is_new: false, estado: "Activo" });
    setModal(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setImageFile(null); // Limpiamos el archivo por si acaso
    setForm({ 
      imagen_url: item.imagen_url || "", 
      nombre: item.nombre, 
      descripcion: item.descripcion, 
      precio: item.precio, 
      is_new: item.is_new, 
      destacado: item.destacado || false,
      estado: item.estado 
    });
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
    setEditingId(null);
    setImageFile(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut(); 
    navigate('/'); 
  };

  return (
    <div className="inventory-page">
      <div className="sidebar">
        <div className="sidebar-logo">FAST🔥BITES</div>
        <div className="sidebar-nav">
          <div className="sidebar-item" onClick={() => navigate('/')}><span className="sidebar-icon">🏠</span>Inicio</div>
          <div className="sidebar-item" onClick={() => navigate('/inventario')}><span className="sidebar-icon">📦</span>Inventario</div>
          <div className="sidebar-item"><span className="sidebar-icon">📊</span>Reportes</div>
          <div className="sidebar-item active"><span className="sidebar-icon">🍔</span>Menú</div>
          <div className="sidebar-item"><span className="sidebar-icon">⚙️</span>Ajustes</div>
        </div>
        <div className="sidebar-logout" onClick={handleLogout}><span>🚪</span>Cerrar sesión</div>
      </div>

      <div className="main-content">
        <div className="top-bar">
          <div>
            <div className="page-title">Menú Completo</div>
            <div className="page-sub">Visualización y gestión de platillos</div>
          </div>
          <button className="btn-add" onClick={openNewModal}>+ Nuevo platillo</button>
        </div>

        {/* Interruptor Inactivos */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', background: '#1A0A00', padding: '16px 24px', borderRadius: '16px', border: '1px solid #ffffff08', width: 'fit-content' }}>
          <span style={{ fontSize: '0.9rem', color: '#ffffff88', fontWeight: 'bold' }}>Mostrar platillos inactivos</span>
          <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
            <input type="checkbox" style={{ opacity: 0, width: 0, height: 0 }} checked={mostrarInactivos} onChange={(e) => setMostrarInactivos(e.target.checked)} />
            <span style={{ position: 'absolute', cursor: 'pointer', inset: 0, backgroundColor: mostrarInactivos ? 'var(--orange)' : '#2B1400', transition: '0.4s', borderRadius: '34px' }}>
              <span style={{ position: 'absolute', content: '""', height: '18px', width: '18px', left: mostrarInactivos ? '22px' : '3px', bottom: '3px', backgroundColor: 'white', transition: '0.4s', borderRadius: '50%' }} />
            </span>
          </label>
        </div>

        {/* Grilla de Menú */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {platillosVisibles.map(item => (
            <div key={item.id} style={{ 
              background: '#1A0A00', 
              border: item.estado === 'Activo' ? '1px solid #ffffff15' : '1px dashed #ffffff20', 
              borderRadius: '16px', 
              padding: '20px',
              position: 'relative',
              opacity: item.estado === 'Activo' ? 1 : 0.5 
            }}>
              {item.is_new && <span style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--red)', color: 'white', fontSize: '0.65rem', padding: '4px 8px', borderRadius: '50px', fontWeight: 'bold', zIndex: 10 }}>NUEVO</span>}
              {item.estado === 'Inactivo' && <span style={{ position: 'absolute', top: '12px', left: '12px', background: '#EF444420', color: '#EF4444', fontSize: '0.65rem', padding: '4px 8px', borderRadius: '50px', fontWeight: 'bold', zIndex: 10 }}>INACTIVO</span>}
              
              {/* --- RENDERIZADO DE LA IMAGEN --- */}
              <div style={{ width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', backgroundColor: '#2B1400' }}>
                {item.imagen_url ? (
                  <img src={item.imagen_url} alt={item.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff44', fontSize: '3rem' }}>🍔</div>
                )}
              </div>

              <h3 style={{ fontFamily: "'Boogaloo', cursive", fontSize: '1.4rem', color: 'white', marginBottom: '8px' }}>{item.nombre}</h3>
              <p style={{ fontSize: '0.85rem', color: '#ffffff66', marginBottom: '16px', minHeight: '40px' }}>{item.descripcion}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #ffffff10', paddingTop: '16px' }}>
                <span style={{ color: 'var(--orange)', fontFamily: "'Boogaloo', cursive", fontSize: '1.5rem' }}>S/. {Number(item.precio).toFixed(2)}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="action-btn" onClick={() => openEditModal(item)}>Editar</button>
                  <button className="action-btn del" onClick={() => deleteItem(item.id)}>Borrar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editingId ? "Editar platillo" : "Nuevo platillo"}</h3>
            
            {/* --- NUEVO CAMPO: Subir Imagen --- */}
            <div className="form-group">
              <label>Imagen del platillo (PNG / JPG)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/jpg" 
                  onChange={e => setImageFile(e.target.files[0])} 
                  style={{ padding: '8px', border: '1px dashed #ffffff40' }}
                />
              </div>
              {form.imagen_url && !imageFile && (
                <p style={{ fontSize: '0.8rem', color: 'var(--green)', marginTop: '8px' }}>✓ Ya tiene una imagen guardada.</p>
              )}
            </div>

            <div className="form-group">
              <label>Nombre</label>
              <input placeholder="Ej: Burger Clásica" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} />
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <input placeholder="Ingredientes o descripción..." value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-group">
                <label>Precio (S/.)</label>
                <input type="number" placeholder="15.50" value={form.precio} onChange={e => setForm(p => ({ ...p, precio: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Estado</label>
                <select 
                  style={{ width: '100%', background: '#2B1400', border: '1px solid #ffffff10', borderRadius: '12px', padding: '14px', color: 'white', fontFamily: 'Nunito', outline: 'none' }}
                  value={form.estado} 
                  onChange={e => setForm(p => ({ ...p, estado: e.target.value }))}
                >
                  <option value="Activo">Activo (Visible)</option>
                  <option value="Inactivo">Inactivo (Oculto)</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
              <input type="checkbox" id="isNew" style={{ width: 'auto', accentColor: 'var(--orange)', transform: 'scale(1.2)' }} checked={form.is_new} onChange={e => setForm(p => ({ ...p, is_new: e.target.checked }))} />
              <label htmlFor="isNew" style={{ margin: 0, cursor: 'pointer', fontSize: '0.9rem', color: 'white', textTransform: 'none' }}>Marcar con etiqueta "NUEVO" 🔥</label>
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
              <input type="checkbox" id="isDestacado" style={{ width: 'auto', accentColor: 'var(--yellow)', transform: 'scale(1.2)' }} checked={form.destacado} onChange={e => setForm(p => ({ ...p, destacado: e.target.checked }))} />
              <label htmlFor="isDestacado" style={{ margin: 0, cursor: 'pointer', fontSize: '0.9rem', color: 'white', textTransform: 'none' }}>⭐ Mostrar en la sección "Lo más pedido" (Inicio)</label>
            </div>

            <div className="modal-btns">
              <button className="btn-cancel" onClick={closeModal}>Cancelar</button>
              <button className="btn-save" onClick={saveItem}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}