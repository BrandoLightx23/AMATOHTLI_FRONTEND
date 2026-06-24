import { createContext, useState, useEffect } from "react"
import { getObjects } from "../api/api"

export const AppContext = createContext()

export function AppProvider({ children }) {
  const [allObjects, setAllObjects] = useState([])
  const [selectedYear, setSelectedYear] = useState(400)
  const [selectedObject, setSelectedObject] = useState(null)
  const [search, setSearch] = useState("")
  const [objects, setObjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [availableYears, setAvailableYears] = useState([400])
  const [activeTab, setActiveTab] = useState("mapa") // Tab predeterminado: "mapa"
  const [activeGame, setActiveGame] = useState(null) // null, "memorama", "match_piece", "museo_match"
  const [activeZoomObject, setActiveZoomObject] = useState(null) // Para el visor de zoom "Examinar Objeto"

  // Cargar todos los objetos de la colección al inicio
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true)
      try {
        const data = await getObjects()

        console.log("Objetos recibidos:", data)
        console.log("Cantidad:", data.length)

        setAllObjects(data)
        setObjects(data.slice(0, 10)) // temporal

        // Calcular dinámicamente los siglos (inicios de siglo) con al menos un objeto
        const centuries = new Set()
        let hasUnknown = false

        data.forEach(obj => {
          if (obj.year === null) {
            hasUnknown = true
          } else {
            const centuryStart = Math.floor(obj.year / 100) * 100
            centuries.add(centuryStart)
          }
        })

        const sortedCenturies = Array.from(centuries).sort((a, b) => a - b)
        if (hasUnknown) {
          sortedCenturies.push("Fecha desconocida")
        }

        setAvailableYears(sortedCenturies)

        // Establecer el primer año disponible como año por defecto
        if (sortedCenturies.length > 0) {
          setSelectedYear(sortedCenturies[0])
        }
      } catch (err) {
        console.error("Error al inicializar la colección completa:", err)
      } finally {
        setLoading(false)
      }
    }
    loadAll()
  }, [])

  // Filtrado reactivo en local para evitar latencias de red
  useEffect(() => {
    if (allObjects.length === 0) return

    if (search.trim() !== "") {
      const q = search.toLowerCase()
      const filtered = allObjects.filter(obj =>
        (obj.titulo || '').toLowerCase().includes(q) ||
        (obj.descripcion || '').toLowerCase().includes(q) ||
        (obj.region || '').toLowerCase().includes(q)
      )
      setObjects(filtered)
    } else {
      let filtered = []
      if (selectedYear === "Fecha desconocida") {
        filtered = allObjects.filter(obj => obj.year === null)
      } else {
        filtered = allObjects.filter(obj =>
          obj.year !== null &&
          obj.year >= selectedYear &&
          obj.year < selectedYear + 100
        )
      }
      setObjects(filtered)
    }
  }, [allObjects, selectedYear, search])

  console.log("Objetos filtrados:", objects.length)
  console.log("Año seleccionado:", selectedYear)

  return (
    <AppContext.Provider value={{
      allObjects,
      selectedYear, setSelectedYear,
      selectedObject, setSelectedObject,
      search, setSearch,
      objects, setObjects,
      loading,
      availableYears,
      activeTab, setActiveTab,
      activeGame, setActiveGame,
      activeZoomObject, setActiveZoomObject
    }}>
      {children}
    </AppContext.Provider>
  )
}