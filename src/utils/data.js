export const MENU_ITEMS = [
  { emoji: "🍔", name: "Burger Clásica", desc: "Carne angus, lechuga, tomate y salsa especial", price: "S/. 18.90", new: false },
  { emoji: "🍕", name: "Pizza Pepperoni", desc: "Masa crocante con doble pepperoni y queso mozzarella", price: "S/. 32.00", new: true },
  { emoji: "🌮", name: "Combo Tacos", desc: "3 tacos de pollo o carne con guacamole fresco", price: "S/. 24.50", new: false },
  { emoji: "🍟", name: "Papas XL", desc: "Papas doradas crujientes con dip de queso", price: "S/. 12.00", new: false },
];

export const INITIAL_INVENTORY = [
  { id: 1, nombre: "Carne de res", cantidad: 25, unidad: "kg", min: 10, categoria: "Proteína" },
  { id: 2, nombre: "Pan de hamburguesa", cantidad: 80, unidad: "unidades", min: 30, categoria: "Panadería" },
  { id: 3, nombre: "Queso mozzarella", cantidad: 8, unidad: "kg", min: 5, categoria: "Lácteos" },
  { id: 4, nombre: "Lechuga", cantidad: 4, unidad: "kg", min: 8, categoria: "Vegetal" },
  { id: 5, nombre: "Pepperoni", cantidad: 15, unidad: "kg", min: 6, categoria: "Proteína" },
  { id: 6, nombre: "Harina de pizza", cantidad: 30, unidad: "kg", min: 15, categoria: "Secos" },
  { id: 7, nombre: "Papas fritas", cantidad: 50, unidad: "kg", min: 20, categoria: "Vegetal" },
  { id: 8, nombre: "Tomate", cantidad: 6, unidad: "kg", min: 8, categoria: "Vegetal" },
];

export function getStockStatus(cantidad, min) {
  if (cantidad <= min * 0.5) return { label: "Crítico", cls: "stock-low" };
  if (cantidad <= min) return { label: "Bajo", cls: "stock-mid" };
  return { label: "OK", cls: "stock-ok" };
}