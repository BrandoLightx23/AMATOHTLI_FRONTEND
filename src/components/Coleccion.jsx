import { useState, useContext, useMemo, useEffect } from "react"
import { AppContext } from "../context/AppContext"
import { useLanguage } from "../context/useLanguage"
import { getFilters } from "../api/api"
import MuseumImage from "./MuseumImage"
import ColeccionSelector from "./ColeccionSelector"
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, X, ExternalLink, Image as ImageIcon } from "lucide-react"

// Valores internos (independientes del idioma) para la opción "todos" de los filtros
const ALL = "__all__"

export default function Coleccion() {
  const {
    allObjects,
    collections,
    selectedCollectionSlug,
    setSelectedCollectionSlug,
  } = useContext(AppContext)
  const { t, formatYear } = useLanguage()
  
  // Estados locales para filtrado y paginación
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCulture, setSelectedCulture] = useState(ALL)
  const [selectedMaterial, setSelectedMaterial] = useState(ALL)
  const [selectedRegion, setSelectedRegion] = useState(ALL)
  const [yearMin, setYearMin] = useState("")
  const [yearMax, setYearMax] = useState("")
  const [sinFecha, setSinFecha] = useState(false)
  const [filterOptions, setFilterOptions] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [detailedObject, setDetailedObject] = useState(null) // Objeto para el modal de detalle

  const itemsPerPage = 20

  const activeCollection = collections.find(collection => collection.slug === selectedCollectionSlug)

  // Opciones reales de filtro desde el backend (con conteos)
  useEffect(() => {
    let cancelled = false
    getFilters(activeCollection ? activeCollection.id : null)
      .then(data => { if (!cancelled) setFilterOptions(data) })
      .catch(err => console.error("Error al cargar los filtros:", err))
    return () => { cancelled = true }
  }, [activeCollection])

  // Obtener opciones de filtro dinámicamente
  const cultures = useMemo(() => {
    if (filterOptions?.culturas?.length) {
      return [ALL, ...filterOptions.culturas.map(c => c.valor)]
    }
    const list = new Set()
    allObjects.forEach(obj => {
      if (obj.estilo_cultura) list.add(obj.estilo_cultura)
    })
    return [ALL, ...Array.from(list).sort()]
  }, [allObjects, filterOptions])

  const materials = useMemo(() => {
    if (filterOptions?.materiales?.length) {
      return [ALL, ...filterOptions.materiales.map(m => m.valor)]
    }
    const list = new Set()
    allObjects.forEach(obj => {
      if (obj.material_tecnica) {
        const mat = obj.material_tecnica.split(",")[0].split(" ")[0]
        if (mat.length > 2) list.add(mat.charAt(0).toUpperCase() + mat.slice(1).toLowerCase())
      }
    })
    return [ALL, ...Array.from(list).sort().slice(0, 15)]
  }, [allObjects, filterOptions])

  const regions = useMemo(() => {
    if (filterOptions?.regiones?.length) {
      return [ALL, ...filterOptions.regiones.map(r => r.valor)]
    }
    const list = new Set()
    allObjects.forEach(obj => {
      if (obj.lugar_origen) list.add(obj.lugar_origen)
    })
    return [ALL, ...Array.from(list).sort()]
  }, [allObjects, filterOptions])

  // Si cambia el idioma, algunas opciones cambian de texto: volver a "todas" si la elegida ya no existe
  const activeCulture = cultures.includes(selectedCulture) ? selectedCulture : ALL
  const activeMaterial = materials.includes(selectedMaterial) ? selectedMaterial : ALL
  const activeRegion = regions.includes(selectedRegion) ? selectedRegion : ALL
  const collectionNames = useMemo(
    () => new Map(collections.map(collection => [String(collection.id), collection.nombre])),
    [collections]
  )
  const getCollectionName = (obj) =>
    collectionNames.get(String(obj.coleccion_id)) || obj.coleccion_nombre || obj.coleccion?.nombre || ""

  // Filtrado de objetos en memoria (extremadamente rápido)
  const collectionObjects = useMemo(() => activeCollection
    ? allObjects.filter(obj => String(obj.coleccion_id) === String(activeCollection.id))
    : allObjects, [allObjects, activeCollection])

  const filteredObjects = useMemo(() => {
    const yMin = yearMin === "" ? null : Number(yearMin)
    const yMax = yearMax === "" ? null : Number(yearMax)
    return collectionObjects.filter(obj => {
      const matchSearch = searchTerm === "" || 
        (obj.titulo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (obj.lugar_origen || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (obj.numero_inventario || "").toLowerCase().includes(searchTerm.toLowerCase())

      const matchCulture = activeCulture === ALL || obj.estilo_cultura === activeCulture
      
      const matchMaterial = activeMaterial === ALL || 
        (obj.material_tecnica || "").toLowerCase().includes(activeMaterial.toLowerCase())

      const matchRegion = activeRegion === ALL ||
        (obj.lugar_origen || "").toLowerCase().includes(activeRegion.toLowerCase())

      let matchYear = true
      if (sinFecha) {
        matchYear = obj.year === null || obj.year === undefined
      } else if (yMin !== null || yMax !== null) {
        if (obj.year === null || obj.year === undefined) matchYear = false
        else if (yMin !== null && obj.year < yMin) matchYear = false
        else if (yMax !== null && obj.year > yMax) matchYear = false
      }

      return matchSearch && matchCulture && matchMaterial && matchRegion && matchYear
    })
  }, [collectionObjects, searchTerm, activeCulture, activeMaterial, activeRegion, yearMin, yearMax, sinFecha])

  // Reiniciar a la página 1 cuando cambian los filtros
  const handleFilterChange = (type, value) => {
    if (type === "culture") setSelectedCulture(value)
    if (type === "material") setSelectedMaterial(value)
    if (type === "region") setSelectedRegion(value)
    if (type === "search") setSearchTerm(value)
    if (type === "yearMin") setYearMin(value)
    if (type === "yearMax") setYearMax(value)
    if (type === "sinFecha") setSinFecha(value)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCulture(ALL)
    setSelectedMaterial(ALL)
    setSelectedRegion(ALL)
    setYearMin("")
    setYearMax("")
    setSinFecha(false)
    setCurrentPage(1)
  }

  // Paginación
  const totalPages = Math.ceil(filteredObjects.length / itemsPerPage) || 1
  const paginatedObjects = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredObjects.slice(start, start + itemsPerPage)
  }, [filteredObjects, currentPage])

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8" style={{ background: "#f5f0e8" }}>
      
      {/* Encabezado */}
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-black text-[#2d6a5a] tracking-wider mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          {t("col.title")}
        </h2>
        <p className="text-xs text-[#7a6e5f]">
          {t("col.subtitle", { n: collectionObjects.length })}
        </p>
      </div>

      {/* Controles de Búsqueda y Filtro */}
      <div className="bg-[#ede8dc] border border-[#d9d0bc] rounded-2xl p-4 flex flex-wrap items-center gap-4 mb-6 shadow-sm">
        <div className="basis-full">
          <ColeccionSelector
            collections={collections}
            total={allObjects.length}
            selectedSlug={activeCollection?.slug || ""}
            t={t}
            onChange={(slug) => {
              setSelectedCollectionSlug(slug)
              clearFilters()
            }}
          />
        </div>
        
        {/* Buscador */}
        <div className="min-w-0 basis-full sm:basis-auto sm:flex-1 sm:min-w-[260px] bg-white border border-[#d9d0bc] rounded-xl px-4 py-2.5 flex items-center gap-2">
          <Search size={16} className="text-[#a09080]" />
          <input
            type="text"
            placeholder={t("col.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="w-full bg-transparent outline-none text-xs text-[#2c2416] placeholder-[#a09080]"
          />
        </div>

        {/* Filtro Cultura */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <SlidersHorizontal size={14} className="text-[#7a6e5f]" />
          <span className="text-[11px] font-bold text-[#7a6e5f] uppercase tracking-wider">{t("col.culture")}</span>
          <select
            value={activeCulture}
            onChange={(e) => handleFilterChange("culture", e.target.value)}
            className="flex-1 min-w-0 sm:flex-none sm:max-w-[14rem] bg-white border border-[#d9d0bc] rounded-xl px-3 py-2 text-xs text-[#2c2416] outline-none"
          >
            {cultures.map(c => (
              <option key={c} value={c}>{c === ALL ? t("col.allCultures") : c}</option>
            ))}
          </select>
        </div>

        {/* Filtro Material */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[11px] font-bold text-[#7a6e5f] uppercase tracking-wider">{t("col.material")}</span>
          <select
            value={activeMaterial}
            onChange={(e) => handleFilterChange("material", e.target.value)}
            className="flex-1 min-w-0 sm:flex-none sm:max-w-[14rem] bg-white border border-[#d9d0bc] rounded-xl px-3 py-2 text-xs text-[#2c2416] outline-none"
          >
            {materials.map(m => (
              <option key={m} value={m}>{m === ALL ? t("col.allMaterials") : m}</option>
            ))}
          </select>
        </div>

        {/* Filtro Región */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[11px] font-bold text-[#7a6e5f] uppercase tracking-wider">{t("col.region")}</span>
          <select
            value={activeRegion}
            onChange={(e) => handleFilterChange("region", e.target.value)}
            className="flex-1 min-w-0 sm:flex-none sm:max-w-[14rem] bg-white border border-[#d9d0bc] rounded-xl px-3 py-2 text-xs text-[#2c2416] outline-none"
          >
            {regions.map(r => (
              <option key={r} value={r}>{r === ALL ? t("col.allRegions") : r}</option>
            ))}
          </select>
        </div>

        {/* Filtro rango de años */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[11px] font-bold text-[#7a6e5f] uppercase tracking-wider">{t("col.yearFrom")}</span>
          <input
            type="number"
            value={yearMin}
            placeholder={filterOptions?.fechaMin ?? ""}
            onChange={(e) => handleFilterChange("yearMin", e.target.value)}
            className="w-24 bg-white border border-[#d9d0bc] rounded-xl px-3 py-2 text-xs text-[#2c2416] outline-none"
          />
          <span className="text-[11px] font-bold text-[#7a6e5f] uppercase tracking-wider">{t("col.yearTo")}</span>
          <input
            type="number"
            value={yearMax}
            placeholder={filterOptions?.fechaMax ?? ""}
            onChange={(e) => handleFilterChange("yearMax", e.target.value)}
            className="w-24 bg-white border border-[#d9d0bc] rounded-xl px-3 py-2 text-xs text-[#2c2416] outline-none"
          />
          <label className="flex items-center gap-1.5 text-xs text-[#2c2416] cursor-pointer">
            <input
              type="checkbox"
              checked={sinFecha}
              onChange={(e) => handleFilterChange("sinFecha", e.target.checked)}
              className="accent-[#2d6a5a]"
            />
            {t("col.withoutDate")}
          </label>
        </div>

        <button
          onClick={clearFilters}
          className="px-4 py-2 rounded-xl bg-white border border-[#d9d0bc] text-xs font-bold text-[#2d6a5a] hover:bg-[#f9f8f6] cursor-pointer"
        >
          {t("col.clearFilters")}
        </button>

      </div>

      {/* Grid de Objetos */}
      {paginatedObjects.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
          <p className="text-[#7a6e5f] text-sm">{t("col.empty")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8 mb-8">
          {paginatedObjects.map(obj => (
            <div
              key={obj.id}
              onClick={() => setDetailedObject(obj)}
              className="bg-white border border-[#d9d0bc] rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between transform hover:-translate-y-1"
            >
              <div className="w-full aspect-square overflow-hidden rounded-2xl bg-[#f9f8f6]">
                <MuseumImage
                  objeto={obj}
                  alt={obj.titulo || t("common.object")}
                  zoomable={false}
                  useThumbnail={true}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-4 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] uppercase font-extrabold text-[#c9830a] tracking-widest truncate">
                    {obj.estilo_cultura || t("common.mesoamerica")}
                  </p>
                  {getCollectionName(obj) && (
                    <span className="inline-block max-w-full mt-1 px-2 py-0.5 rounded-full bg-[#eaf0ec] text-[#2d6a5a] text-[9px] font-bold border border-[#c2d9cc] truncate">
                      {getCollectionName(obj)}
                    </span>
                  )}
                  <h4 className="text-sm font-bold text-[#2c2416] line-clamp-2 leading-snug mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {obj.titulo}
                  </h4>
                </div>
                <p className="text-xs text-[#7a6e5f] truncate mt-2">
                  {obj.lugar_origen || t("common.unknownOrigin")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row gap-2 sm:justify-between items-center bg-[#ede8dc] border border-[#d9d0bc] rounded-xl px-4 py-2 shadow-sm mt-auto">
          <span className="text-[11px] text-[#7a6e5f] font-semibold">
            {t("col.page")} <span className="text-[#2c2416] font-bold">{currentPage}</span> {t("col.of")} <span className="text-[#2c2416] font-bold">{totalPages}</span> — {t("col.showing", { n: filteredObjects.length })}
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 sm:p-1.5 rounded-lg bg-white border border-[#d9d0bc] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f9f8f6] cursor-pointer"
            >
              <ChevronLeft size={16} className="text-[#2c2416]" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 sm:p-1.5 rounded-lg bg-white border border-[#d9d0bc] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f9f8f6] cursor-pointer"
            >
              <ChevronRight size={16} className="text-[#2c2416]" />
            </button>
          </div>
        </div>
      )}

      {/* Modal de Detalle Completo del Objeto */}
      {detailedObject && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#f5f0e8] border-2 border-[#d9d0bc] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            
            {/* Botón cerrar */}
            <button
              onClick={() => setDetailedObject(null)}
              className="absolute right-4 top-4 p-2 rounded-full bg-white/80 hover:bg-white border border-[#d9d0bc] text-[#2c2416] transition-colors z-10 cursor-pointer shadow-sm"
            >
              <X size={18} />
            </button>

            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
              {/* Imagen izquierda */}
              <div className="w-full md:w-1/2 aspect-square rounded-2xl overflow-hidden bg-white shadow-inner">
                <MuseumImage
                  objeto={detailedObject}
                  alt={detailedObject.titulo}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Detalles derecho */}
              <div className="w-full md:w-1/2 flex flex-col justify-start">
                <span className="text-[10px] uppercase font-extrabold text-[#c9830a] tracking-wider">
                  {t("detail.inventoryNo", { value: detailedObject.numero_inventario || t("common.noNumber") })}
                </span>
                
                <h3 className="text-2xl font-black text-[#2c2416] mt-1 mb-3 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {detailedObject.titulo}
                </h3>

                <div className="flex flex-wrap gap-2 mb-4">
                  {getCollectionName(detailedObject) && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#eaf0ec] text-[#2d6a5a] text-[10px] font-bold border border-[#c2d9cc]">
                      {getCollectionName(detailedObject)}
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full bg-[#eaf0ec] text-[#2d6a5a] text-[10px] font-bold border border-[#c2d9cc]">
                    {detailedObject.estilo_cultura || t("common.unknownCulture")}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#ede8dc] text-[#7a6e5f] text-[10px] font-bold border border-[#d9d0bc]">
                    {detailedObject.yearRaw || (detailedObject.year ? formatYear(detailedObject.year) : t("common.unknownDate"))}
                  </span>
                </div>

                {detailedObject.descripcionCompleta && (
                  <div className="mb-4">
                    <span className="text-[#a09080] font-semibold text-xs">{t("detail.description")}</span>
                    <p className="text-[#2c2416] text-xs leading-relaxed mt-1">{detailedObject.descripcionCompleta}</p>
                  </div>
                )}

                <div className="flex flex-col gap-2.5 text-xs border-t border-[#d9d0bc]/50 pt-4">
                  {detailedObject.lugar_origen && (
                    <div>
                      <span className="text-[#a09080] font-semibold">{t("detail.region")}</span>
                      <p className="text-[#2c2416] font-medium">{detailedObject.lugar_origen}</p>
                    </div>
                  )}
                  {detailedObject.material_tecnica && detailedObject.material_tecnica !== "N/A" && (
                    <div>
                      <span className="text-[#a09080] font-semibold">{t("detail.material")}</span>
                      <p className="text-[#2c2416] font-medium">{detailedObject.material_tecnica}</p>
                    </div>
                  )}
                  {detailedObject.dimensiones && detailedObject.dimensiones !== "N/A" && (
                    <div>
                      <span className="text-[#a09080] font-semibold">{t("detail.dimensions")}</span>
                      <p className="text-[#2c2416] font-medium">{detailedObject.dimensiones}</p>
                    </div>
                  )}
                  {detailedObject.creditos && (
                    <div className="border-t border-[#d9d0bc]/20 pt-2 mt-2">
                      <span className="text-[#a09080] font-semibold">{t("detail.credits")}</span>
                      <p className="text-[#7a6e5f] text-[11px] leading-relaxed italic">{detailedObject.creditos}</p>
                    </div>
                  )}
                </div>

                {/* Acciones: museo / Commons / alta resolución */}
                <div className="flex flex-col gap-2 mt-5">
                  {detailedObject.urlMuseo && (
                    <a
                      href={detailedObject.urlMuseo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2d6a5a] hover:bg-[#1e4d40] text-white text-xs font-bold transition-colors"
                    >
                      <ExternalLink size={14} />
                      {t("detail.viewMuseum")}
                    </a>
                  )}
                  {detailedObject.commonsPageUrl && (
                    <a
                      href={detailedObject.commonsPageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#d9d0bc] text-[#2c2416] text-xs font-bold hover:bg-[#f9f8f6] transition-colors"
                    >
                      <ExternalLink size={14} />
                      {t("detail.viewCommons")}
                    </a>
                  )}
                  {(detailedObject.imagenAltaRes || detailedObject.url) && (
                    <a
                      href={detailedObject.imagenAltaRes || detailedObject.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#d9d0bc] text-[#2c2416] text-xs font-bold hover:bg-[#f9f8f6] transition-colors"
                    >
                      <ImageIcon size={14} />
                      {t("detail.viewHighRes")}
                    </a>
                  )}
                </div>

              </div>
            </div>

            {/* Pie de modal */}
            <div className="px-4 sm:px-8 py-4 bg-[#ede8dc]/50 border-t border-[#d9d0bc]/50 flex justify-end">
              <button
                onClick={() => setDetailedObject(null)}
                className="px-5 py-2 rounded-xl bg-[#2d6a5a] hover:bg-[#1e4d40] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                {t("detail.close")}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
