export const PLANS = {
  SEMILLA: {
    name: "Semilla",
    price: 2000,
    monthlyPrice: 2000,
    maxCategories: 1,
    maxDisciplines: 1,
    trialDays: 14,
    benefits: ["Perfil profesional visible", "1 categoría para listar", "1 disciplina", "Sin comisiones en reservas", "Acceso al dashboard"],
  },
  ARBOL: {
    name: "Árbol",
    price: 4000,
    monthlyPrice: 4000,
    maxCategories: 3,
    maxDisciplines: 3,
    trialDays: 14,
    benefits: ["Todo lo de Semilla", "3 categorías", "3 disciplinas", "Estadísticas básicas", "Soporte prioritario"],
  },
  BOSQUE: {
    name: "Bosque",
    price: 7000,
    monthlyPrice: 7000,
    maxCategories: 999,
    maxDisciplines: 999,
    trialDays: 30,
    benefits: ["Todo lo de Árbol", "Categorías ilimitadas", "Disciplinas ilimitadas", "Estadísticas avanzadas", "Soporte VIP 24/7", "Acceso anticipado a nuevas funciones"],
  },
} as const

export const AD_PLANS = {
  DESTELLO: { name: "Destello", price: 2900, months: 1, label: "1 mes", benefits: ["Carrusel principal 1 mes", "Perfil destacado en tu categoría"] },
  BRILLO: { name: "Brillo", price: 6900, months: 3, label: "3 meses", benefits: ["Todo lo de Destello", "3 meses de visibilidad", "Ahorro del 17%"] },
  RESPLANDOR: { name: "Resplandor", price: 11900, months: 6, label: "6 meses", benefits: ["Todo lo de Brillo", "6 meses de visibilidad", "Ahorro del 32%"] },
  LUZ: { name: "Luz", price: 19900, months: 12, label: "12 meses", benefits: ["Todo lo de Resplandor", "12 meses de visibilidad", "Máximo ahorro (43%)", "Medalla de perfil destacado"] },
} as const
