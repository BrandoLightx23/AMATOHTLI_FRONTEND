import { createContext, useState, useEffect, useMemo, useCallback } from "react"
import { getObjects, getCollections } from "../api/api"
import { UNKNOWN_YEAR } from "../constants"
import { useLanguage } from "./useLanguage"

export const AppContext = createContext()

export function AppProvider({ children }) {
  const { t, place, countryName, lang } = useLanguage()
  const [rawObjects, setRawObjects] = useState([])
  const [collections, setCollections] = useState([])
  const [selectedCollectionSlug, setSelectedCollectionSlugState] = useState(() =>
    typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("coleccion") || ""
  )
  const [selectedYear, setSelectedYear] = useState(400)
  const [selectedObjectRaw, setSelectedObject] = useState(null)
  const [search, setSearch] = useState("")
  const [objects, setObjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [availableYears, setAvailableYears] = useState([400])
  const [activeTab, setActiveTab] = useState("mapa") // Tab predeterminado: "mapa"
  const [activeGame, setActiveGame] = useState(null) // null, "memorama", "match_piece", "museo_match"
  const [activeZoomObject, setActiveZoomObject] = useState(null) // Para el visor de zoom "Examinar Objeto"

  const setSelectedCollectionSlug = useCallback((slug) => {
    const nextSlug = slug || ""
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      if (nextSlug) url.searchParams.set("coleccion", nextSlug)
      else url.searchParams.delete("coleccion")
      window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`)
    }
    setSelectedCollectionSlugState(nextSlug)
  }, [])

  useEffect(() => {
    const syncCollectionFromUrl = () => {
      setSelectedCollectionSlugState(new URLSearchParams(window.location.search).get("coleccion") || "")
    }
    window.addEventListener("popstate", syncCollectionFromUrl)
    return () => window.removeEventListener("popstate", syncCollectionFromUrl)
  }, [])

  // El backend rellena algunos campos vacíos con textos en español
  // ("Desconocida", "Sin título"...) y devuelve el país con su nombre en inglés.
  // Aquí los adaptamos al idioma elegido, así todos los componentes los muestran bien.
  const allObjects = useMemo(() => rawObjects.map(obj => {
    const lugar = place(obj.lugar_origen)
    const pais = countryName(obj.pais)
    const lugarEnPais = lugar && pais && lugar.toLowerCase().includes(pais.toLowerCase())
    return {
      ...obj,
      titulo: obj.titulo === "Sin título" ? t("common.untitled") : obj.titulo,
      estilo_cultura: obj.estilo_cultura === "Desconocida" ? t("common.unknown") : obj.estilo_cultura,
      autor: obj.autor === "Desconocido" ? "" : obj.autor,
      lugar_origen: lugar,
      pais,
      // Texto de procedencia para mostrar (sin repetir el país si ya viene incluido)
      regionLabel: lugar ? (lugarEnPais ? lugar : `${lugar}, ${pais}`) : pais,
    }
  }), [rawObjects, t, place, countryName])

  // El objeto seleccionado se resuelve contra la lista actual para respetar el idioma
  const selectedObject = useMemo(() => {
    if (!selectedObjectRaw) return null
    return allObjects.find(o => o.id === selectedObjectRaw.id) || selectedObjectRaw
  }, [selectedObjectRaw, allObjects])

  // Cargar todos los objetos de la colección al inicio
  useEffect(() => {
    let active = true
    const loadAll = async () => {
      setLoading(true)
      try {
        const [data, collectionsData] = await Promise.all([
          getObjects(null, {}, lang),
          getCollections(lang).catch(err => {
            console.error("Error al cargar las colecciones:", err)
            return []
          }),
        ])

        if (!active) return
        console.log("Objetos recibidos:", data)
        console.log("Cantidad:", data.length)

        setRawObjects(data)
        setCollections(collectionsData)
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
          sortedCenturies.push(UNKNOWN_YEAR)
        }

        setAvailableYears(sortedCenturies)

        // Establecer el primer año disponible como año por defecto
        if (sortedCenturies.length > 0) {
          setSelectedYear(sortedCenturies[0])
        }
      } catch (err) {
        if (active) console.error("Error al inicializar la colección completa:", err)
      } finally {
        if (active) setLoading(false)
      }
    }
    loadAll()
    return () => {
      active = false
    }
  }, [lang])

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
      if (selectedYear === UNKNOWN_YEAR) {
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
      collections,
      selectedCollectionSlug,
      setSelectedCollectionSlug,
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
