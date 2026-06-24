import { useState, useContext, useMemo } from "react"
import { AppContext } from "../context/AppContext"
import MuseumImage from "./MuseumImage"
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, X } from "lucide-react"

export default function Coleccion() {
  const { allObjects } = useContext(AppContext)
  
  // Estados locales para filtrado y paginación
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCulture, setSelectedCulture] = useState("Todas")
  const [selectedMaterial, setSelectedMaterial] = useState("Todos")
  const [currentPage, setCurrentPage] = useState(1)
  const [detailedObject, setDetailedObject] = useState(null) // Objeto para el modal de detalle

  const itemsPerPage = 20

  // Obtener opciones de filtro dinámicamente
  const cultures = useMemo(() => {
    const list = new Set()
    allObjects.forEach(obj => {
      if (obj.estilo_cultura) list.add(obj.estilo_cultura)
    })
    return ["Todas", ...Array.from(list).sort()]
  }, [allObjects])

  const materials = useMemo(() => {
    const list = new Set()
    allObjects.forEach(obj => {
      // Extraemos la primera palabra o material clave
      if (obj.material_tecnica) {
        const mat = obj.material_tecnica.split(",")[0].split(" ")[0]
        if (mat.length > 2) list.add(mat.charAt(0).toUpperCase() + mat.slice(1).toLowerCase())
      }
    })
    return ["Todos", ...Array.from(list).sort().slice(0, 15)] // Limitar a los 15 más comunes
  }, [allObjects])

  // Filtrado de objetos en memoria (extremadamente rápido)
  const filteredObjects = useMemo(() => {
    return allObjects.filter(obj => {
      const matchSearch = searchTerm === "" || 
        (obj.titulo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (obj.lugar_origen || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (obj.numero_inventario || "").toLowerCase().includes(searchTerm.toLowerCase())

      const matchCulture = selectedCulture === "Todas" || obj.estilo_cultura === selectedCulture
      
      const matchMaterial = selectedMaterial === "Todos" || 
        (obj.material_tecnica || "").toLowerCase().includes(selectedMaterial.toLowerCase())

      return matchSearch && matchCulture && matchMaterial
    })
  }, [allObjects, searchTerm, selectedCulture, selectedMaterial])

  // Reiniciar a la página 1 cuando cambian los filtros
  const handleFilterChange = (type, value) => {
    if (type === "culture") setSelectedCulture(value)
    if (type === "material") setSelectedMaterial(value)
    if (type === "search") setSearchTerm(value)
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
        <h2 className="text-3xl font-black text-[#2d6a5a] tracking-wider mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          CATÁLOGO DE LA COLECCIÓN
        </h2>
        <p className="text-xs text-[#7a6e5f]">
          Explora los {allObjects.length} objetos históricos catalogados. Filtra por cultura, material o realiza búsquedas en tiempo real.
        </p>
      </div>

      {/* Controles de Búsqueda y Filtro */}
      <div className="bg-[#ede8dc] border border-[#d9d0bc] rounded-2xl p-4 flex flex-wrap items-center gap-4 mb-6 shadow-sm">
        
        {/* Buscador */}
        <div className="flex-1 min-w-[260px] bg-white border border-[#d9d0bc] rounded-xl px-4 py-2.5 flex items-center gap-2">
          <Search size={16} className="text-[#a09080]" />
          <input
            type="text"
            placeholder="Buscar título, procedencia o inventario..."
            value={searchTerm}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="w-full bg-transparent outline-none text-xs text-[#2c2416] placeholder-[#a09080]"
          />
        </div>

        {/* Filtro Cultura */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-[#7a6e5f]" />
          <span className="text-[11px] font-bold text-[#7a6e5f] uppercase tracking-wider">Cultura:</span>
          <select
            value={selectedCulture}
            onChange={(e) => handleFilterChange("culture", e.target.value)}
            className="bg-white border border-[#d9d0bc] rounded-xl px-3 py-2 text-xs text-[#2c2416] outline-none"
          >
            {cultures.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Filtro Material */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-[#7a6e5f] uppercase tracking-wider">Material:</span>
          <select
            value={selectedMaterial}
            onChange={(e) => handleFilterChange("material", e.target.value)}
            className="bg-white border border-[#d9d0bc] rounded-xl px-3 py-2 text-xs text-[#2c2416] outline-none"
          >
            {materials.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Grid de Objetos */}
      {paginatedObjects.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
          <p className="text-[#7a6e5f] text-sm">No se encontraron objetos que coincidan con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-8">
          {paginatedObjects.map(obj => (
            <div
              key={obj.id}
              onClick={() => setDetailedObject(obj)}
              className="bg-white border border-[#d9d0bc] rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between transform hover:-translate-y-1"
            >
              <div className="w-full aspect-square overflow-hidden rounded-2xl bg-[#f9f8f6]">
                <MuseumImage
                  objeto={obj}
                  alt={obj.titulo || "Objeto"}
                  zoomable={false}
                  useThumbnail={true}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-4 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] uppercase font-extrabold text-[#c9830a] tracking-widest truncate">
                    {obj.estilo_cultura || "Mesoamérica"}
                  </p>
                  <h4 className="text-sm font-bold text-[#2c2416] line-clamp-2 leading-snug mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {obj.titulo}
                  </h4>
                </div>
                <p className="text-xs text-[#7a6e5f] truncate mt-2">
                  {obj.lugar_origen || "Procedencia desconocida"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-[#ede8dc] border border-[#d9d0bc] rounded-xl px-4 py-2 shadow-sm mt-auto">
          <span className="text-[11px] text-[#7a6e5f] font-semibold">
            Página <span className="text-[#2c2416] font-bold">{currentPage}</span> de <span className="text-[#2c2416] font-bold">{totalPages}</span> — Mostrando {filteredObjects.length} objetos
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-white border border-[#d9d0bc] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f9f8f6] cursor-pointer"
            >
              <ChevronLeft size={16} className="text-[#2c2416]" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-white border border-[#d9d0bc] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f9f8f6] cursor-pointer"
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
                  Nº Inventario: {detailedObject.numero_inventario || "S/N"}
                </span>
                
                <h3 className="text-2xl font-black text-[#2c2416] mt-1 mb-3 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {detailedObject.titulo}
                </h3>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#eaf0ec] text-[#2d6a5a] text-[10px] font-bold border border-[#c2d9cc]">
                    {detailedObject.estilo_cultura || "Cultura desconocida"}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#ede8dc] text-[#7a6e5f] text-[10px] font-bold border border-[#d9d0bc]">
                    {detailedObject.yearRaw || (detailedObject.year ? `${detailedObject.year} d.C.` : "Fecha desconocida")}
                  </span>
                </div>

                <div className="flex flex-col gap-2.5 text-xs border-t border-[#d9d0bc]/50 pt-4">
                  <div>
                    <span className="text-[#a09080] font-semibold">Región / Procedencia:</span>
                    <p className="text-[#2c2416] font-medium">{detailedObject.lugar_origen || "Desconocida"}</p>
                  </div>
                  <div>
                    <span className="text-[#a09080] font-semibold">Material / Técnica:</span>
                    <p className="text-[#2c2416] font-medium">{detailedObject.material_tecnica || "Desconocida"}</p>
                  </div>
                  {detailedObject.dimensiones && (
                    <div>
                      <span className="text-[#a09080] font-semibold">Dimensiones:</span>
                      <p className="text-[#2c2416] font-medium">{detailedObject.dimensiones}</p>
                    </div>
                  )}
                  {detailedObject.creditos && (
                    <div className="border-t border-[#d9d0bc]/20 pt-2 mt-2">
                      <span className="text-[#a09080] font-semibold">Créditos / Notas:</span>
                      <p className="text-[#7a6e5f] text-[11px] leading-relaxed italic">{detailedObject.creditos}</p>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Pie de modal */}
            <div className="px-8 py-4 bg-[#ede8dc]/50 border-t border-[#d9d0bc]/50 flex justify-end">
              <button
                onClick={() => setDetailedObject(null)}
                className="px-5 py-2 rounded-xl bg-[#2d6a5a] hover:bg-[#1e4d40] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Cerrar Ficha
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
