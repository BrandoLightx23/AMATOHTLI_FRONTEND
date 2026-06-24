import { useState, useContext, useMemo } from "react"
import { AppContext } from "../context/AppContext"
import MuseumImage from "./MuseumImage"
import { Calendar, Info, ChevronRight, X } from "lucide-react"

export default function LineaTemporal() {
  const { allObjects } = useContext(AppContext)
  const [detailedObject, setDetailedObject] = useState(null)

  // Era details for historical context
  const erasInfo = {
    400: { name: "Antigüedad Temprana", desc: "Surgimiento y florecimiento de las primeras civilizaciones clásicas en Mesoamérica y los Andes, como las fases intermedias de Teotihuacán y el desarrollo temprano de Nazca y Moche." },
    500: { name: "Antigüedad Temprana", desc: "Período de consolidación de grandes centros urbanos y expresiones artísticas monumentales en arcilla y piedra." },
    600: { name: "Antigüedad Temprana", desc: "Auge del período clásico. Gran refinamiento en el modelado de cerámica polícroma y metalurgia andina." },
    700: { name: "Antigüedad Temprana", desc: "Momento culminante de las ciudades de las tierras bajas mayas y de las culturas costeras del Perú." },
    800: { name: "Antigüedad Temprana", desc: "Fase de transición y reorganización social en Mesoamérica; auge de la cultura Wari en los Andes." },
    900: { name: "Antigüedad Temprana", desc: "Periodo de contacto y transición hacia el Posclásico. Declive de grandes capitales clásicas." },
    1000: { name: "Período Clásico", desc: "Surgimiento de nuevas dinastías y reinos. Gran desarrollo de la cultura Tolteca y auge de Chimú en la costa peruana." },
    1100: { name: "Período Clásico", desc: "Expansión urbana y redes comerciales a gran escala que integran diferentes regiones de Mesoamérica." },
    1200: { name: "Período Clásico", desc: "Florecimiento del estilo Mixteca-Puebla y desarrollo arquitectónico y artístico de los señoríos andinos tardíos." },
    1300: { name: "Período Clásico", desc: "Consolidación de alianzas imperiales y alta especialización artesanal en orfebrería y plumaria." },
    1400: { name: "Período Clásico", desc: "Periodo de máxima expansión del Imperio Inca y florecimiento del estilo artístico imperial andino." },
    1500: { name: "Período Clásico", desc: "Fase de contacto y transición colonial. Últimas expresiones artísticas prehispánicas autónomas." },
    1600: { name: "Posclásico Temprano", desc: "Arte de la época colonial temprana, reflejando influencias híbridas indo-hispánicas." },
    1700: { name: "Posclásico Temprano", desc: "Obras mestizas y sincretismo religioso manifestado en las artes aplicadas." },
    1800: { name: "Posclásico Tardío", desc: "Supervivencia de tradiciones artesanales prehispánicas en comunidades rurales durante el siglo XIX." },
    1900: { name: "Posclásico Tardío", desc: "Renacimiento del arte folclórico indígena y revalorización estética del pasado arqueológico." },
    2000: { name: "Posclásico Tardío", desc: "Arte indígena contemporáneo y artesanía tradicional mesoamericana del siglo XXI." },
    "Fecha desconocida": { name: "Sin determinar", desc: "Objetos de la colección que no poseen información cronológica confirmada o corresponden a eras fuera del rango d.C. representable." }
  }

  // Agrupar los objetos de la base de datos por siglo o fecha desconocida
  const objectsByCentury = useMemo(() => {
    const groups = {}
    allObjects.forEach(obj => {
      if (obj.year !== null) {
        const century = Math.floor(obj.year / 100) * 100
        if (!groups[century]) groups[century] = []
        groups[century].push(obj)
      } else {
        if (!groups["Fecha desconocida"]) groups["Fecha desconocida"] = []
        groups["Fecha desconocida"].push(obj)
      }
    })
    return groups
  }, [allObjects])

  // Lista ordenada de siglos que CONTIENEN objetos, con Fecha desconocida al final
  const activeCenturies = useMemo(() => {
    const centuries = Object.keys(objectsByCentury)
      .filter(k => k !== "Fecha desconocida")
      .map(Number)
      .sort((a, b) => a - b)
      .map(String)

    if (objectsByCentury["Fecha desconocida"]) {
      centuries.push("Fecha desconocida")
    }
    return centuries
  }, [objectsByCentury])

  const getEraColor = (century) => {
    if (century === "Fecha desconocida") return "bg-[#a09080]"
    const num = Number(century)
    if (num >= 400 && num <= 900) return "bg-[#c9830a]"
    if (num >= 1000 && num <= 1500) return "bg-[#2d6a5a]"
    if (num >= 1600 && num <= 1700) return "bg-[#e8a012]"
    return "bg-[#b85c38]"
  }

  const getEraBorderColor = (century) => {
    if (century === "Fecha desconocida") return "border-[#a09080]"
    const num = Number(century)
    if (num >= 400 && num <= 900) return "border-[#c9830a]"
    if (num >= 1000 && num <= 1500) return "border-[#2d6a5a]"
    if (num >= 1600 && num <= 1700) return "border-[#e8a012]"
    return "border-[#b85c38]"
  }

  const getEraTextColor = (century) => {
    if (century === "Fecha desconocida") return "text-[#a09080]"
    const num = Number(century)
    if (num >= 400 && num <= 900) return "text-[#c9830a]"
    if (num >= 1000 && num <= 1500) return "text-[#2d6a5a]"
    if (num >= 1600 && num <= 1700) return "text-[#e8a012]"
    return "text-[#b85c38]"
  }

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8" style={{ background: "#f5f0e8" }}>

      {/* Encabezado */}
      <div className="mb-8">
        <h2 className="text-3xl font-black text-[#2d6a5a] tracking-wider mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          LÍNEA DEL TIEMPO HISTÓRICA
        </h2>
        <p className="text-xs text-[#7a6e5f]">
          Explora la evolución cronológica del arte precolombino. Navega a través de los siglos que contienen testimonios de la colección.
        </p>
      </div>

      {/* Línea de Tiempo Vertical */}
      <div className="relative border-l-2 border-[#d9d0bc] ml-4 md:ml-12 pl-6 md:pl-10 pb-12 flex flex-col gap-12">
        {activeCenturies.map((century) => {
          const era = erasInfo[century] || { name: "Período Indefinido", desc: "Fase de transición cultural." }
          const list = objectsByCentury[century] || []

          return (
            <div key={century} className="relative">

              {/* Nodo / Punto de conexión en la línea de tiempo */}
              <div className={`absolute -left-[31px] md:-left-[47px] top-1.5 w-4 h-4 md:w-6 md:h-6 rounded-full border-4 border-[#f5f0e8] ${getEraColor(century)} shadow-sm z-10`} />

              {/* Encabezado del Siglo */}
              <div className="mb-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`text-xl md:text-2xl font-black ${getEraTextColor(century)}`} style={{ fontFamily: "'Playfair Display', serif" }}>
                    {century === "Fecha desconocida" ? "Fecha desconocida" : `Siglo ${Math.floor(Number(century) / 100) + 1} (${century} d.C.)`}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white ${getEraColor(century)}`}>
                    {era.name}
                  </span>
                </div>

                {/* Explicación histórica */}
                <p className="text-xs text-[#7a6e5f] mt-1.5 max-w-3xl leading-relaxed flex items-start gap-1.5">
                  <Info size={13} className="mt-0.5 flex-shrink-0 opacity-70" />
                  {era.desc}
                </p>
              </div>

              {/* Slider Horizontal de Objetos del Siglo */}
              <div className="flex gap-6 overflow-x-auto pb-4 pt-1 pr-6 scrollbar-hide">
                {list.map(obj => (
                  <div
                    key={obj.id}
                    onClick={() => setDetailedObject(obj)}
                    className={`flex-shrink-0 w-56 bg-white border border-[#d9d0bc] rounded-3xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1`}
                  >
                    <div className="w-full aspect-square overflow-hidden rounded-2xl bg-[#f9f8f6] mb-3">
                      <MuseumImage
                        objeto={obj}
                        alt={obj.titulo || "Objeto"}
                        zoomable={false}
                        useThumbnail={true}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h4 className="text-xs font-extrabold text-[#c9830a] uppercase tracking-wider truncate mb-1">
                      {obj.estilo_cultura || "Mesoamérica"}
                    </h4>
                    <h4 className="text-sm font-bold text-[#2c2416] line-clamp-2 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {obj.titulo}
                    </h4>
                    <p className="text-xs text-[#7a6e5f] truncate mt-1">
                      {obj.lugar_origen || "Procedencia desconocida"}
                    </p>
                  </div>
                ))}

                {/* Tarjeta de resumen final del siglo */}
                <div className="flex-shrink-0 w-44 bg-[#ede8dc]/50 border border-[#d9d0bc] rounded-3xl p-6 flex flex-col justify-center items-center text-center">
                  <span className="text-2xl font-black text-[#2d6a5a]">{list.length}</span>
                  <span className="text-[10px] text-[#7a6e5f] font-bold uppercase tracking-widest mt-2">
                    Objetos en este siglo
                  </span>
                </div>
              </div>

            </div>
          )
        })}
      </div>

      {/* Modal de Detalle (Igual para mantener identidad visual) */}
      {detailedObject && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#f5f0e8] border-2 border-[#d9d0bc] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">

            <button
              onClick={() => setDetailedObject(null)}
              className="absolute right-4 top-4 p-2 rounded-full bg-white/80 hover:bg-white border border-[#d9d0bc] text-[#2c2416] transition-colors z-10 cursor-pointer shadow-sm"
            >
              <X size={18} />
            </button>

            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/2 aspect-square rounded-2xl overflow-hidden bg-white shadow-inner">
                <MuseumImage
                  objeto={detailedObject}
                  alt={detailedObject.titulo}
                  className="w-full h-full object-contain"
                />
              </div>

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
