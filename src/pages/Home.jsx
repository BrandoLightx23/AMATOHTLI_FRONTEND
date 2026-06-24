import Header from "../components/Header"
import Timeline from "../components/Timeline"
import SearchBar from "../components/SearchBar"
import MesoMap from "../components/MesoMap"
import InfoPanel from "../components/InfoPanel"
import Inicio from "../components/Inicio"
import Coleccion from "../components/Coleccion"
import LineaTemporal from "../components/LineaTemporal"
import GameHub from "../components/games/GameHub"
import ImageZoomViewer from "../components/ImageZoomViewer"
import { useContext } from "react"
import { AppContext } from "../context/AppContext"
import { Leaf, Heart } from "lucide-react"

export default function Home() {
  const { loading, objects, activeTab } = useContext(AppContext)

  const renderContent = () => {
    switch (activeTab) {
      case "inicio":
        return (
          <div className="flex-1 w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <Inicio />
          </div>
        )
      case "coleccion":
        return (
          <div className="flex-1 w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <Coleccion />
          </div>
        )
      case "linea_temporal":
        return (
          <div className="flex-1 w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <LineaTemporal />
          </div>
        )
      case "juegos":
        return (
          <div className="flex-1 w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <GameHub />
          </div>
        )
      case "mapa":
      default:
        return (
          <div className="flex-1 flex flex-col">
            <SearchBar />

            {/* Barra de estado */}
            <div className="px-4 sm:px-6 py-2 border-b border-[#d9d0bc] bg-[#f5f0e8]">
              {loading ? (
                <span className="text-[#2d6a5a] text-xs animate-pulse">
                  Cargando objetos...
                </span>
              ) : (
                <span className="text-[#a09080] text-xs">
                  {objects.length} objeto{objects.length !== 1 ? "s" : ""} en este período
                  <span className="hidden sm:inline"> — haz clic en un país del mapa</span>
                </span>
              )}
            </div>

            {/* Mapa + Panel */}
            <div className="flex flex-col md:flex-row flex-1 min-h-0">
              <MesoMap />
              <InfoPanel />
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen flex flex-col animate-fade-in" style={{ background: "#f5f0e8" }}>
      <Header />

      {renderContent()}

      {/* Footer */}
      <footer className="px-4 sm:px-8 py-3 bg-[#ede8dc] border-t border-[#d9d0bc] flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <span className="flex items-center gap-2 text-[#7a6e5f] text-xs">
          <Leaf size={13} className="text-[#2d6a5a] shrink-0" />
          Viaja por el tiempo y descubre la riqueza cultural del arte precolombino.
        </span>
        <span className="flex items-center gap-2 text-[#7a6e5f] text-xs">
          <Heart size={13} className="text-[#b85c38] shrink-0" fill="#b85c38" />
          Hecho con pasión por la historia
        </span>
      </footer>

      <ImageZoomViewer />
    </div>
  )
}