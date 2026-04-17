import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient"; 
import { getStockStatus } from "../utils/data";
import "../styles/inventarioPage.css"; 

export default function InventarioPage() {
  const navigate = useNavigate(); 

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ nombre: "", cantidad: "", unidad: "kg", min: "", categoria: "" });
  
  // --- NUEVO ESTADO: Saber si estamos editando ---
  // Guardará el ID del ingrediente que estamos editando. Si es null, es un ingrediente nuevo.
  const [editingId, setEditingId] = useState(null); 

  const cargarIngredientes = async () => {
    const { data, error } = await supabase
      .from('ingredientes')
      .select('*')
      .order('id', { ascending: true }); 

    if (error) {
      console.error("Error al cargar inventario:", error);
    } else {
      setItems(data);
    }
  };

  useEffect(() => {
    cargarIngredientes();
  }, []);

  const filtered = items.filter(i => i.nombre.toLowerCase().includes(search.toLowerCase()));
  const low = items.filter(i => i.cantidad <= i.stock_minimo).length;

  // --- MODIFICADO: Función unificada para Guardar (Insertar o Actualizar) ---
  const saveItem = async () => {
    if (!form.nombre || !form.cantidad) return;

    if (editingId) {
      // 1. MODO EDICIÓN (UPDATE)
      const { data, error } = await supabase
        .from('ingredientes')
        .update({
          nombre: form.nombre,
          cantidad: Number(form.cantidad),
          unidad: form.unidad,
          stock_minimo: Number(form.min),
          categoria: form.categoria
        })
        .eq('id', editingId)
        .select();

      if (error) {
        console.error("Error al actualizar:", error);
      } else if (data) {
        // Actualizamos el estado local reemplazando el item viejo por el nuevo
        setItems(prev => prev.map(item => item.id === editingId ? data[0] : item));
        closeModal();
      }

    } else {
      // 2. MODO CREACIÓN (INSERT) - (Tu código original)
      const { data, error } = await supabase
        .from('ingredientes')
        .insert([
          {
            nombre: form.nombre,
            cantidad: Number(form.cantidad),
            unidad: form.unidad,
            stock_minimo: Number(form.min), 
            categoria: form.categoria
          }
        ])
        .select(); 

      if (error) {
        console.error("Error al guardar:", error);
      } else if (data) {
        setItems(prev => [...prev, data[0]]);
        closeModal();
      }
    }
  };

  const deleteItem = async (id) => {
    const { error } = await supabase
      .from('ingredientes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error al eliminar:", error);
    } else {
      setItems(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut(); 
    navigate('/'); 
  };

  // --- NUEVAS FUNCIONES PARA MANEJAR EL MODAL ---
  const openNewModal = () => {
    setEditingId(null);
    setForm({ nombre: "", cantidad: "", unidad: "kg", min: "", categoria: "" });
    setModal(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    // Llenamos el formulario con los datos existentes
    setForm({ 
      nombre: item.nombre, 
      cantidad: item.cantidad, 
      unidad: item.unidad, 
      min: item.stock_minimo, // Recuerda mapear stock_minimo a 'min' para el formulario
      categoria: item.categoria 
    });
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
    setEditingId(null);
    setForm({ nombre: "", cantidad: "", unidad: "kg", min: "", categoria: "" });
  };

  return (
    <div className="inventory-page">
      <div className="sidebar">
        <div className="sidebar-logo">FAST🔥BITES</div>
        <div className="sidebar-nav">
          <div className="sidebar-item" onClick={() => navigate('/')}>
            <span className="sidebar-icon">🏠</span>Inicio
          </div>
          <div className="sidebar-item active"><span className="sidebar-icon">📦</span>Inventario</div>
          <div className="sidebar-item"><span className="sidebar-icon">📊</span>Reportes</div>
          <div className="sidebar-item" onClick={() => navigate('/menu')}>
            <span className="sidebar-icon">🍔</span>Menú
          </div>
          <div className="sidebar-item"><span className="sidebar-icon">⚙️</span>Ajustes</div>
        </div>
        
        <div className="sidebar-logout" onClick={handleLogout}>
          <span>🚪</span>Cerrar sesión
        </div>
      </div>

      <div className="main-content">
        <div className="top-bar">
          <div>
            <div className="page-title">Inventario</div>
            <div className="page-sub">Gestión de ingredientes y stock</div>
          </div>
          {/* Cambiado para usar la nueva función */}
          <button className="btn-add" onClick={openNewModal}>+ Nuevo ingrediente</button>
        </div>

        <div className="stats-grid">
          {/* ... Tarjetas de estadísticas sin cambios ... */}
          <div className="stat-card">
            <div className="stat-label">Total ingredientes</div>
            <div className="stat-val">{items.length}</div>
            <div className="stat-sub">en inventario</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Stock bajo / crítico</div>
            <div className="stat-val" style={{ color: low > 0 ? "#EF4444" : "#22C55E" }}>{low}</div>
            <div className="stat-sub">{low > 0 ? "requieren atención" : "todo en orden"}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Categorías</div>
            <div className="stat-val">{[...new Set(items.map(i => i.categoria))].length}</div>
            <div className="stat-sub">tipos distintos</div>
          </div>
        </div>

        <div className="table-box">
          <div className="table-head">
            <h3>Ingredientes</h3>
            <input className="search-input" placeholder="🔍  Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <table>
            <thead>
              <tr>
                <th>Ingrediente</th>
                <th>Categoría</th>
                <th>Cantidad</th>
                <th>Mínimo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const status = getStockStatus(item.cantidad, item.stock_minimo);
                return (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 700, color: "white" }}>{item.nombre}</td>
                    <td>{item.categoria}</td>
                    <td>{item.cantidad} {item.unidad}</td>
                    <td>{item.stock_minimo} {item.unidad}</td>
                    <td><span className={`stock-badge ${status.cls}`}><span className="stat-dot" style={{ background: "currentColor" }} />{status.label}</span></td>
                    <td>
                      {/* --- MODIFICADO: Botón Editar --- */}
                      <button className="action-btn" onClick={() => openEditModal(item)}>Editar</button>
                      <button className="action-btn del" onClick={() => deleteItem(item.id)}>Eliminar</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            {/* El título cambia según el modo */}
            <h3>{editingId ? "Editar ingrediente" : "Nuevo ingrediente"}</h3>
            <div className="form-group">
              <label>Nombre</label>
              <input placeholder="Ej: Carne de res" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-group">
                <label>Cantidad</label>
                <input type="number" placeholder="50" value={form.cantidad} onChange={e => setForm(p => ({ ...p, cantidad: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Unidad</label>
                <input placeholder="kg / unidades" value={form.unidad} onChange={e => setForm(p => ({ ...p, unidad: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-group">
                <label>Stock mínimo</label>
                <input type="number" placeholder="10" value={form.min} onChange={e => setForm(p => ({ ...p, min: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Categoría</label>
                <input placeholder="Proteína / Vegetal" value={form.categoria} onChange={e => setForm(p => ({ ...p, categoria: e.target.value }))} />
              </div>
            </div>
            <div className="modal-btns">
              <button className="btn-cancel" onClick={closeModal}>Cancelar</button>
              {/* Cambiado a la función unificada saveItem */}
              <button className="btn-save" onClick={saveItem}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}