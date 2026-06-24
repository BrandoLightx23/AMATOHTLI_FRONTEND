import { useContext } from "react"
import { AppContext } from "../../context/AppContext"
import Memorama from "./Memorama"
import MatchPiece from "./MatchPiece"
import MuseoMatch from "./MuseoMatch"
import { Gamepad2, Award, Zap, Puzzle } from "lucide-react"

export default function GameHub() {
  const { activeGame, setActiveGame } = useContext(AppContext)

  // Renderizar el juego seleccionado o el menú de selección
  if (activeGame === "memorama") return <Memorama />
  if (activeGame === "match_piece") return <MatchPiece />
  if (activeGame === "museo_match") return <MuseoMatch />

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-4 md:p-8" style={{ background: "#f5f0e8" }}>
      
      {/* Encabezado del Hub */}
      <div className="text-center max-w-2xl mb-10 mt-4">
        <div className="w-16 h-16 bg-[#eaf0ec] text-[#2d6a5a] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#2d6a5a]/20">
          <Gamepad2 size={36} />
        </div>
        <h2 className="text-3xl font-black text-[#2d6a5a] tracking-wider mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          EXPLORA Y JUEGA
        </h2>
        <p className="text-sm text-[#7a6e5f]">
          Aprende y pon a prueba tus conocimientos sobre el patrimonio cultural mesoamericano jugando con las obras de la colección Reinhart del Museo Rietberg.
        </p>
      </div>

      {/* Grid de Juegos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        
        {/* Tarjeta Juego 1: Memorama */}
        <div className="bg-white border border-[#d9d0bc] rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <div>
            <div className="w-12 h-12 bg-[#fff6e6] text-[#c9830a] rounded-xl flex items-center justify-center mb-4 border border-[#c9830a]/20">
              <Award size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#2c2416] mb-2">Memorama Prehispánico</h3>
            <p className="text-xs text-[#7a6e5f] leading-relaxed mb-6">
              Ejercita tu memoria visual encontrando los pares de vasijas, textiles, estelas y esculturas mesoamericanas de la colección.
            </p>
          </div>
          <button
            onClick={() => setActiveGame("memorama")}
            className="w-full py-3 px-4 bg-[#c9830a] hover:bg-[#b87208] text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
          >
            Jugar Memorama
          </button>
        </div>

        {/* Tarjeta Juego 2: Une la Pieza */}
        <div className="bg-white border border-[#d9d0bc] rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <div>
            <div className="w-12 h-12 bg-[#eaf0ec] text-[#2d6a5a] rounded-xl flex items-center justify-center mb-4 border border-[#2d6a5a]/20">
              <Puzzle size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#2c2416] mb-2">Une la Pieza con su Nombre</h3>
            <p className="text-xs text-[#7a6e5f] leading-relaxed mb-6">
              ¿Puedes reconocer cada obra? Conecta de forma interactiva las imágenes de las piezas con sus nombres oficiales de catálogo.
            </p>
          </div>
          <button
            onClick={() => setActiveGame("match_piece")}
            className="w-full py-3 px-4 bg-[#2d6a5a] hover:bg-[#1e4d40] text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
          >
            Jugar Conexión
          </button>
        </div>

        {/* Tarjeta Juego 3: Museo Match */}
        <div className="bg-white border border-[#d9d0bc] rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <div>
            <div className="w-12 h-12 bg-[#fdf2ee] text-[#b85c38] rounded-xl flex items-center justify-center mb-4 border border-[#b85c38]/20">
              <Zap size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#2c2416] mb-2">Museo Match</h3>
            <p className="text-xs text-[#7a6e5f] leading-relaxed mb-6">
              Alinea tres o más figuras iguales en el tablero. Crea cascadas de combinaciones para acumular la máxima puntuación.
            </p>
          </div>
          <button
            onClick={() => setActiveGame("museo_match")}
            className="w-full py-3 px-4 bg-[#b85c38] hover:bg-[#9c4c2d] text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
          >
            Jugar Museo Match
          </button>
        </div>

      </div>

    </div>
  )
}
