import { useState, useEffect, useContext } from "react"
import { AppContext } from "../../context/AppContext"
import { getImageUrl } from "../../api/api"
import { ArrowLeft, Clock, Star, Award, CheckCircle, XCircle } from "lucide-react"

export default function MatchPiece() {
  const { allObjects, setActiveGame } = useContext(AppContext)
  const [difficulty, setDifficulty] = useState(null) // null, 'facil', 'medio', 'dificil'
  const [round, setRound] = useState(1)
  const [score, setScore] = useState(0)
  const [roundObjects, setRoundObjects] = useState([])
  const [shuffledNames, setShuffledNames] = useState([])
  const [selectedImage, setSelectedImage] = useState(null) // index of selected image
  const [selectedName, setSelectedName] = useState(null) // index of selected name
  const [matches, setMatches] = useState({}) // { imageIndex: nameIndex }
  const [incorrectAttempts, setIncorrectAttempts] = useState([]) // array of index pairs that failed
  const [roundFinished, setRoundFinished] = useState(false)
  const [gameFinished, setGameFinished] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [shake, setShake] = useState(null) // 'image' | 'name' | 'both'

  const TOTAL_ROUNDS = 3

  const config = {
    facil: { count: 4 },
    medio: { count: 6 },
    dificil: { count: 8 }
  }

  // Timer
  useEffect(() => {
    let timer
    if (difficulty && !gameFinished && !roundFinished) {
      timer = setInterval(() => {
        setSeconds(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [difficulty, gameFinished, roundFinished])

  // Cargar objetos para la ronda actual
  const startRound = (currentRound, diff) => {
    setRound(currentRound)
    setSelectedImage(null)
    setSelectedName(null)
    setMatches({})
    setIncorrectAttempts([])
    setRoundFinished(false)
    setShake(null)

    const count = config[diff].count

    // Filtrar objetos con imágenes
    const validObjects = allObjects.filter(obj => obj.thumbnail || obj.localImage)
    const pool = validObjects.length >= count ? validObjects : allObjects

    // Seleccionar N objetos aleatorios
    const pickedObjects = [...pool]
      .sort(() => 0.5 - Math.random())
      .slice(0, count)

    setRoundObjects(pickedObjects)

    // Mezclar los nombres
    const names = pickedObjects.map((obj, index) => ({
      index, // guardamos el index original del objeto
      titulo: obj.titulo || "Objeto Sin Título",
      cultura: obj.estilo_cultura || "Mesoamérica"
    })).sort(() => 0.5 - Math.random())

    setShuffledNames(names)
  }

  const startGame = (diff) => {
    setDifficulty(diff)
    setScore(0)
    setSeconds(0)
    setRound(1)
    setGameFinished(false)
    startRound(1, diff)
  }

  // Lógica de matching
  const handleSelectImage = (index) => {
    if (roundFinished || isMatchedImage(index)) return
    setSelectedImage(index)
    setSelectedName(null) // Reset name selection if clicking another image
  }

  const handleSelectName = (nameObj) => {
    if (roundFinished || isMatchedName(nameObj.index)) return
    
    // Si no hay imagen seleccionada, solo guardar la selección del nombre
    if (selectedImage === null) {
      setSelectedName(nameObj.index)
      return
    }

    // Si hay una imagen seleccionada, comprobar correspondencia
    if (selectedImage === nameObj.index) {
      // ¡Correcto!
      const newMatches = { ...matches, [selectedImage]: nameObj.index }
      setMatches(newMatches)
      setScore(prev => prev + 100)
      setSelectedImage(null)
      setSelectedName(null)

      // Comprobar si se completó la ronda
      if (Object.keys(newMatches).length === roundObjects.length) {
        setTimeout(() => {
          setRoundFinished(true)
        }, 500)
      }
    } else {
      // Incorrecto
      setShake(nameObj.index)
      setIncorrectAttempts(prev => [...prev, [selectedImage, nameObj.index]])
      setScore(prev => Math.max(0, prev - 25))
      
      // Animación de error
      setTimeout(() => {
        setSelectedImage(null)
        setSelectedName(null)
        setShake(null)
      }, 800)
    }
  }

  const isMatchedImage = (index) => matches.hasOwnProperty(index)
  const isMatchedName = (originalIndex) => Object.values(matches).includes(originalIndex)

  const handleNextRound = () => {
    if (round < TOTAL_ROUNDS) {
      startRound(round + 1, difficulty)
    } else {
      setGameFinished(true)
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-4 md:p-6" style={{ background: "#f5f0e8" }}>
      {/* Botón de retroceso */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-6">
        <button
          onClick={() => setActiveGame(null)}
          className="flex items-center gap-2 text-[#2d6a5a] hover:text-[#1e4d40] font-semibold text-sm transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          Volver a Juegos
        </button>
        <h2 className="text-2xl font-black text-[#2d6a5a] tracking-wider" style={{ fontFamily: "'Playfair Display', serif" }}>
          UNE LA PIEZA CON SU NOMBRE
        </h2>
        <div className="w-20"></div>
      </div>

      {!difficulty ? (
        // Selección de dificultad
        <div className="w-full max-w-md bg-white border border-[#d9d0bc] rounded-2xl p-8 shadow-md text-center mt-12">
          <Award size={48} className="text-[#c9830a] mx-auto mb-4 animate-bounce" />
          <h3 className="text-xl font-bold text-[#2d6a5a] mb-2">Une la Pieza con su Nombre</h3>
          <p className="text-sm text-[#7a6e5f] mb-6">Relaciona visualmente las obras maestras con su nombre correcto.</p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => startGame("facil")}
              className="py-3.5 px-6 rounded-xl bg-[#eaf0ec] hover:bg-[#d5e4dd] text-[#2d6a5a] font-bold text-sm transition-colors border border-[#2d6a5a]/20 cursor-pointer"
            >
              Fácil (4 piezas por ronda)
            </button>
            <button
              onClick={() => startGame("medio")}
              className="py-3.5 px-6 rounded-xl bg-[#fff6e6] hover:bg-[#ffeed1] text-[#c9830a] font-bold text-sm transition-colors border border-[#c9830a]/20 cursor-pointer"
            >
              Medio (6 piezas por ronda)
            </button>
            <button
              onClick={() => startGame("dificil")}
              className="py-3.5 px-6 rounded-xl bg-[#fdf2ee] hover:bg-[#fadcd0] text-[#b85c38] font-bold text-sm transition-colors border border-[#b85c38]/20 cursor-pointer"
            >
              Difícil (8 piezas por ronda)
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-4xl flex flex-col items-center">
          {/* Marcadores */}
          <div className="w-full bg-[#ede8dc] border border-[#d9d0bc] rounded-xl px-6 py-4 flex flex-wrap justify-between items-center gap-4 mb-6 shadow-sm">
            <div className="flex items-center gap-4">
              <span className="text-[#7a6e5f] text-xs font-semibold uppercase tracking-wider">Ronda:</span>
              <span className="text-[#2c2416] font-bold text-sm">{round} de {TOTAL_ROUNDS}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                difficulty === "facil" ? "bg-[#eaf0ec] text-[#2d6a5a]" :
                difficulty === "medio" ? "bg-[#fff6e6] text-[#c9830a]" :
                "bg-[#fdf2ee] text-[#b85c38]"
              }`}>{difficulty}</span>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-[#2d6a5a]">
                <Clock size={16} />
                <span className="font-mono font-bold text-lg">{seconds}s</span>
              </div>
              <div className="flex items-center gap-2 text-[#c9830a]">
                <Star size={16} />
                <span className="font-bold text-lg">{score} pts</span>
              </div>
            </div>
          </div>

          {gameFinished ? (
            // Final del Juego
            <div className="w-full max-w-md bg-white border border-[#d9d0bc] rounded-2xl p-8 shadow-md text-center mt-6">
              <CheckCircle size={48} className="text-[#2d6a5a] mx-auto mb-4" />
              <h3 className="text-2xl font-black text-[#2d6a5a] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                ¡Excelente Trabajo!
              </h3>
              <p className="text-sm text-[#7a6e5f] mb-6">Has completado todas las rondas reconociendo los objetos del museo.</p>

              <div className="bg-[#f5f0e8] rounded-xl p-4 mb-6 text-left flex flex-col gap-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-[#7a6e5f]">Tiempo total:</span>
                  <span className="font-bold text-[#2c2416]">{seconds} segundos</span>
                </div>
                <div className="flex justify-between text-sm border-t border-[#d9d0bc] pt-2">
                  <span className="text-[#7a6e5f] font-bold">Puntuación Final:</span>
                  <span className="font-bold text-[#c9830a] text-lg">{score} pts</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setDifficulty(null)}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#ede8dc] hover:bg-[#d9d0bc] text-[#2d6a5a] font-bold text-sm transition-colors cursor-pointer"
                >
                  Cambiar Dificultad
                </button>
                <button
                  onClick={() => startGame(difficulty)}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#2d6a5a] hover:bg-[#1e4d40] text-white font-bold text-sm transition-colors cursor-pointer"
                >
                  Jugar de Nuevo
                </button>
              </div>
            </div>
          ) : roundFinished ? (
            // Pantalla de Ronda Completada
            <div className="w-full max-w-md bg-white border border-[#d9d0bc] rounded-2xl p-8 shadow-md text-center mt-6">
              <CheckCircle size={48} className="text-[#2d6a5a] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#2d6a5a] mb-2">Ronda {round} Completada</h3>
              <p className="text-sm text-[#7a6e5f] mb-6">¡Conexiones correctas! Prepárate para el siguiente nivel.</p>
              
              <button
                onClick={handleNextRound}
                className="w-full py-3.5 px-6 rounded-xl bg-[#2d6a5a] hover:bg-[#1e4d40] text-white font-bold text-sm transition-colors cursor-pointer"
              >
                {round === TOTAL_ROUNDS ? "Ver Resultados" : "Siguiente Ronda"}
              </button>
            </div>
          ) : (
            // Tablero del Juego (Drag & Match)
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 bg-white border border-[#d9d0bc] rounded-2xl p-6 shadow-sm">
              
              {/* Columna Izquierda: Imágenes */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-bold text-[#7a6e5f] uppercase tracking-wider mb-2 text-center">Imagen del Objeto</h4>
                {roundObjects.map((obj, idx) => {
                  const matched = isMatchedImage(idx)
                  const isSelected = selectedImage === idx
                  const isShaking = shake === idx
                  
                  return (
                    <div
                      key={obj.id}
                      onClick={() => handleSelectImage(idx)}
                      className={`relative aspect-[3/1.5] border-2 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 flex items-center bg-[#f9f8f6] ${
                        matched ? "border-[#2d6a5a] opacity-50 bg-[#eaf0ec]" :
                        isSelected ? "border-[#c9830a] shadow-md ring-2 ring-[#c9830a]/20 scale-[1.02]" :
                        isShaking ? "border-[#b85c38] animate-bounce" :
                        "border-[#d9d0bc] hover:border-[#a09080]"
                      }`}
                    >
                      <div className="w-24 h-full bg-[#ede8dc] border-r border-[#d9d0bc] p-1 flex items-center justify-center">
                        <img
                          src={getImageUrl(obj, true) || "/placeholder.svg"}
                          alt="Pieza arqueológica"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <div className="px-4 flex-1">
                        <span className="text-[10px] uppercase font-bold text-[#a09080] tracking-wider">Cultura</span>
                        <p className="text-xs font-semibold text-[#2c2416]">{obj.estilo_cultura || "Mesoamérica"}</p>
                      </div>
                      {matched && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2d6a5a]">
                          <CheckCircle size={20} fill="#eaf0ec" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Columna Derecha: Nombres Mezclados */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-bold text-[#7a6e5f] uppercase tracking-wider mb-2 text-center">Nombres</h4>
                {shuffledNames.map((nameObj) => {
                  const matched = isMatchedName(nameObj.index)
                  const isSelected = selectedName === nameObj.index
                  const isShaking = shake === nameObj.index
                  
                  return (
                    <div
                      key={nameObj.index}
                      onClick={() => handleSelectName(nameObj)}
                      className={`relative min-h-[58px] aspect-[3/0.65] flex items-center px-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                        matched ? "border-[#2d6a5a] bg-[#eaf0ec] text-[#2d6a5a] opacity-50" :
                        isSelected ? "border-[#c9830a] bg-[#fff6e6] text-[#c9830a] font-bold scale-[1.02]" :
                        isShaking ? "border-[#b85c38] bg-[#fdf2ee] text-[#b85c38] animate-bounce" :
                        "border-[#d9d0bc] bg-white hover:border-[#a09080] text-[#2c2416] hover:bg-[#f9f8f6]"
                      }`}
                    >
                      <div className="flex-1 pr-6">
                        <p className="text-xs font-bold leading-tight">{nameObj.titulo}</p>
                        <p className="text-[9px] text-[#7a6e5f] mt-0.5">{nameObj.cultura}</p>
                      </div>
                      {matched && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2d6a5a]">
                          <CheckCircle size={20} fill="#eaf0ec" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  )
}
