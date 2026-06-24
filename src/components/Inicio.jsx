import { useContext } from "react"
import { AppContext } from "../context/AppContext"
import { Map, Calendar, Library, Gamepad2, ArrowRight } from "lucide-react"

export default function Inicio() {
  const { allObjects, setActiveTab, setActiveGame } = useContext(AppContext)

  // Calcular estadísticas de la colección
  const total = allObjects.length

  // Agrupar por países
  const countryCounts = {}
  allObjects.forEach(obj => {
    // Usamos el país que el backend o frontend asocia a la región
    const region = (obj.lugar_origen || "").toLowerCase()
    let country = "Otro"
    if (region.includes("perú") || region.includes("peru") || region.includes("chancay") || region.includes("inca")) country = "Perú"
    else if (region.includes("méxico") || region.includes("mexico") || region.includes("azteca") || region.includes("maya")) country = "México"
    else if (region.includes("ecuador")) country = "Ecuador"
    else if (region.includes("colombia")) country = "Colombia"
    else if (region.includes("guatemala")) country = "Guatemala"
    else if (region.includes("costa rica")) country = "Costa Rica"
    else if (region.includes("bolivia")) country = "Bolivia"

    countryCounts[country] = (countryCounts[country] || 0) + 1
  })

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8" style={{ background: "#f5f0e8" }}>

      {/* Héroe Banner */}
      <div className="w-full max-w-5xl mx-auto bg-gradient-to-br from-[#2d6a5a] to-[#1e4d40] text-white rounded-3xl p-8 md:p-12 shadow-md relative overflow-hidden mb-10">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12">
          {/* Un gran círculo decorativo */}
          <circle cx="100" cy="100" r="150" fill="none" stroke="white" strokeWidth="20" />
        </div>

        <div className="max-w-2xl relative z-10">
          <span className="bg-[#c9830a] text-white text-xs font-extrabold uppercase px-3 py-1 rounded-full tracking-wider shadow-sm">
            Colección Reinhart
          </span>
          <h2 className="text-4xl md:text-5xl font-black mt-4 mb-4 tracking-wider leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            AMATOHTLI: arte precolombino en el Tiempo
          </h2>
          <p className="text-sm md:text-base text-[#e2ede8] leading-relaxed mb-8">
            Bienvenido al explorador interactivo del Museo Rietberg. Descubre 681 piezas históricas de cerámica, textil y orfebrería prehispánica a través de mapas interactivos, líneas del tiempo y juegos educativos.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setActiveTab("mapa")}
              className="flex items-center gap-2 px-6 py-3.5 bg-[#c9830a] hover:bg-[#b87208] text-white rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              <Map size={16} />
              Explorar el Mapa
              <ArrowRight size={15} />
            </button>
            <button
              onClick={() => setActiveTab("juegos")}
              className="flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-sm font-bold transition-all cursor-pointer"
            >
              <Gamepad2 size={16} />
              Ir a los Juegos
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Secciones Rápidas */}
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

        <div
          onClick={() => setActiveTab("mapa")}
          className="bg-white border border-[#d9d0bc] rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer"
        >
          <div className="w-10 h-10 bg-[#eaf0ec] text-[#2d6a5a] rounded-xl flex items-center justify-center mb-3">
            <Map size={20} />
          </div>
          <h3 className="font-bold text-[#2c2416] text-sm mb-1">Mapa Interactivo</h3>
          <p className="text-xs text-[#7a6e5f] leading-relaxed">Visualiza las piezas arqueológicas según su país y origen geográfico.</p>
        </div>

        <div
          onClick={() => setActiveTab("linea_temporal")}
          className="bg-white border border-[#d9d0bc] rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer"
        >
          <div className="w-10 h-10 bg-[#fff6e6] text-[#c9830a] rounded-xl flex items-center justify-center mb-3">
            <Calendar size={20} />
          </div>
          <h3 className="font-bold text-[#2c2416] text-sm mb-1">Línea del Tiempo</h3>
          <p className="text-xs text-[#7a6e5f] leading-relaxed">Recorre cronológicamente las eras  desde el año 400.</p>
        </div>

        <div
          onClick={() => setActiveTab("coleccion")}
          className="bg-white border border-[#d9d0bc] rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer"
        >
          <div className="w-10 h-10 bg-[#fdf2ee] text-[#b85c38] rounded-xl flex items-center justify-center mb-3">
            <Library size={20} />
          </div>
          <h3 className="font-bold text-[#2c2416] text-sm mb-1">Catálogo Completo</h3>
          <p className="text-xs text-[#7a6e5f] leading-relaxed">Busca y filtra entre los 681 objetos de arte con fichas informativas detalladas.</p>
        </div>

        <div
          onClick={() => setActiveTab("juegos")}
          className="bg-white border border-[#d9d0bc] rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer"
        >
          <div className="w-10 h-10 bg-[#f3edf7] text-[#8e44ad] rounded-xl flex items-center justify-center mb-3">
            <Gamepad2 size={20} />
          </div>
          <h3 className="font-bold text-[#2c2416] text-sm mb-1">Juegos Educativos</h3>
          <p className="text-xs text-[#7a6e5f] leading-relaxed">Diviértete con rompecabezas, juegos de memoria y desafíos de coincidencia.</p>
        </div>

      </div>

      {/* Estadísticas de la colección */}
      <div className="w-full max-w-5xl mx-auto bg-white border border-[#d9d0bc] rounded-3xl p-6 md:p-8 shadow-sm">
        <h3 className="text-xl font-bold text-[#2d6a5a] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
          Estadísticas de la Colección
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center border-b border-[#f0ece4] pb-6 mb-6">
          <div>
            <p className="text-3xl font-black text-[#2d6a5a]">{total}</p>
            <p className="text-xs text-[#7a6e5f] uppercase tracking-wider font-semibold mt-1">Objetos Totales</p>
          </div>
          <div>
            <p className="text-3xl font-black text-[#c9830a]">{countryCounts["Perú"] || 0}</p>
            <p className="text-xs text-[#7a6e5f] uppercase tracking-wider font-semibold mt-1">Piezas de Perú</p>
          </div>
          <div>
            <p className="text-3xl font-black text-[#b85c38]">{countryCounts["México"] || 0}</p>
            <p className="text-xs text-[#7a6e5f] uppercase tracking-wider font-semibold mt-1">Piezas de México</p>
          </div>
          <div>
            <p className="text-3xl font-black text-[#8e44ad]">{Object.keys(countryCounts).length}</p>
            <p className="text-xs text-[#7a6e5f] uppercase tracking-wider font-semibold mt-1">Países de Origen</p>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-[#7a6e5f] uppercase tracking-wider mb-4">Distribución por País de Origen</h4>
          <div className="flex flex-col gap-3">
            {Object.entries(countryCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([country, count]) => {
                const percentage = ((count / total) * 100).toFixed(1)
                return (
                  <div key={country} className="flex items-center gap-4 text-xs font-semibold">
                    <span className="w-24 text-left text-[#2c2416]">{country}</span>
                    <div className="flex-1 h-3 bg-[#ede8dc] rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percentage}%` }}
                        className={`h-full rounded-full ${country === "Perú" ? "bg-[#2d6a5a]" :
                          country === "México" ? "bg-[#c9830a]" :
                            country === "Ecuador" ? "bg-[#b85c38]" :
                              "bg-[#a09080]"
                          }`}
                      />
                    </div>
                    <span className="w-16 text-right text-[#7a6e5f]">{count} ({percentage}%)</span>
                  </div>
                )
              })}
          </div>
        </div>
      </div>

    </div>
  )
}
