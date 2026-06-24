import { useState, useEffect, useContext, useRef } from "react"
import { AppContext } from "../../context/AppContext"
import { getImageUrl } from "../../api/api"
import { RefreshCw, Clock, Award, Star, ArrowLeft } from "lucide-react"

// Patrón SVG para el dorso de las cartas
function CardBackSVG() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full p-2 opacity-80" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="90" height="90" rx="8" fill="none" stroke="#ede8dc" strokeWidth="3" strokeDasharray="4 2"/>
      <circle cx="50" cy="50" r="30" fill="none" stroke="#c9830a" strokeWidth="2"/>
      <circle cx="50" cy="50" r="22" fill="none" stroke="#ede8dc" strokeWidth="1" strokeDasharray="3 3"/>
      {/* Detalle prehispánico */}
      <path d="M 50,20 L 50,80 M 20,50 L 80,50 M 28.7,28.7 L 71.3,71.3 M 28.7,71.3 L 71.3,28.7" stroke="#c9830a" strokeWidth="1.5"/>
      <circle cx="50" cy="50" r="6" fill="#c9830a"/>
    </svg>
  )
}

export default function Memorama() {
  const { allObjects, setActiveGame } = useContext(AppContext)
  const [difficulty, setDifficulty] = useState(null) // null, 'facil', 'medio', 'dificil'
  const [cards, setCards] = useState([])
  const [selected, setSelected] = useState([]) // indices of currently flipped cards
  const [matched, setMatched] = useState([]) // ids of matched objects
  const [moves, setMoves] = useState(0)
  const [score, setScore] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [isWon, setIsWon] = useState(false)
  const timerRef = useRef(null)

  // Opciones de dificultad
  const config = {
    facil: { pairs: 6, gridClass: "grid-cols-3 md:grid-cols-4" },
    medio: { pairs: 10, gridClass: "grid-cols-4 md:grid-cols-5" },
    dificil: { pairs: 15, gridClass: "grid-cols-5 md:grid-cols-6" }
  }

  // Iniciar temporizador cuando se escoge la dificultad
  useEffect(() => {
    if (difficulty && !isWon) {
      timerRef.current = setInterval(() => {
        setSeconds(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [difficulty, isWon])

  // Inicializar juego
  const startGame = (diff) => {
    clearInterval(timerRef.current)
    setDifficulty(diff)
    setSeconds(0)
    setMoves(0)
    setScore(0)
    setIsWon(false)
    setSelected([])
    setMatched([])

    const numPairs = config[diff].pairs

    // Filtrar objetos que tengan imagen válida
    const validObjects = allObjects.filter(obj => obj.thumbnail || obj.localImage)
    
    // Si no hay suficientes objetos válidos, usar todos los que se pueda
    const pool = validObjects.length >= numPairs ? validObjects : allObjects
    
    // Seleccionar N objetos aleatorios únicos
    const selectedObjects = [...pool]
      .sort(() => 0.5 - Math.random())
      .slice(0, numPairs)

    // Duplicar y crear cartas
    const gameCards = []
    selectedObjects.forEach((obj, index) => {
      const cardBase = {
        id: `${obj.id}-${index}-a`,
        objectId: obj.id,
        titulo: obj.titulo || "Objeto Prehispánico",
        cultura: obj.estilo_cultura || "Mesoamérica",
        image: getImageUrl(obj, true) || "/placeholder.svg"
      }
      gameCards.push({ ...cardBase, cardId: `${obj.id}-a` })
      gameCards.push({ ...cardBase, cardId: `${obj.id}-b`, id: `${obj.id}-${index}-b` })
    })

    // Barajar
    const shuffledCards = gameCards.sort(() => 0.5 - Math.random())
    setCards(shuffledCards)
  }

  // Manejar clic en una carta
  const handleCardClick = (index) => {
    if (selected.length === 2 || selected.includes(index) || matched.includes(cards[index].cardId)) {
      return
    }

    const newSelected = [...selected, index]
    setSelected(newSelected)

    if (newSelected.length === 2) {
      setMoves(prev => prev + 1)
      const firstCard = cards[newSelected[0]]
      const secondCard = cards[newSelected[1]]

      if (firstCard.objectId === secondCard.objectId) {
        // ¡Pareja encontrada!
        const matchedId = firstCard.cardId
        setMatched(prev => {
          const updated = [...prev, firstCard.cardId, secondCard.cardId]
          // Comprobar victoria
          if (updated.length === cards.length) {
            setIsWon(true)
            clearInterval(timerRef.current)
            // Calcular puntuación extra de tiempo
            const timeBonus = Math.max(0, 1000 - seconds * 5)
            setScore(prevScore => prevScore + 200 + timeBonus)
          }
          return updated
        })
        setScore(prev => prev + 150)
        setSelected([])
      } else {
        // No coinciden
        setTimeout(() => {
          setSelected([])
          setScore(prev => Math.max(0, prev - 20))
        }, 1000)
      }
    }
  }

  const formatTime = (timeInSecs) => {
    const mins = Math.floor(timeInSecs / 60)
    const secs = timeInSecs % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
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
          MEMORAMA PREHISPÁNICO
        </h2>
        <div className="w-20"></div> {/* Espaciador */}
      </div>

      {!difficulty ? (
        // Pantalla de selección de dificultad
        <div className="w-full max-w-md bg-white border border-[#d9d0bc] rounded-2xl p-8 shadow-md text-center mt-12">
          <Award size={48} className="text-[#c9830a] mx-auto mb-4 animate-bounce" />
          <h3 className="text-xl font-bold text-[#2d6a5a] mb-2">Selecciona la Dificultad</h3>
          <p className="text-sm text-[#7a6e5f] mb-6">Encuentra los pares de objetos prehispánicos de la colección.</p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => startGame("facil")}
              className="py-3.5 px-6 rounded-xl bg-[#eaf0ec] hover:bg-[#d5e4dd] text-[#2d6a5a] font-bold text-sm transition-colors border border-[#2d6a5a]/20 cursor-pointer"
            >
              Fácil (6 Pares — 12 Cartas)
            </button>
            <button
              onClick={() => startGame("medio")}
              className="py-3.5 px-6 rounded-xl bg-[#fff6e6] hover:bg-[#ffeed1] text-[#c9830a] font-bold text-sm transition-colors border border-[#c9830a]/20 cursor-pointer"
            >
              Medio (10 Pares — 20 Cartas)
            </button>
            <button
              onClick={() => startGame("dificil")}
              className="py-3.5 px-6 rounded-xl bg-[#fdf2ee] hover:bg-[#fadcd0] text-[#b85c38] font-bold text-sm transition-colors border border-[#b85c38]/20 cursor-pointer"
            >
              Difícil (15 Pares — 30 Cartas)
            </button>
          </div>
        </div>
      ) : (
        // Pantalla del Juego
        <div className="w-full max-w-4xl flex flex-col items-center">
          {/* Marcadores */}
          <div className="w-full bg-[#ede8dc] border border-[#d9d0bc] rounded-xl px-6 py-4 flex flex-wrap justify-between items-center gap-4 mb-6 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-[#7a6e5f] text-xs font-semibold uppercase tracking-wider">Dificultad:</span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                difficulty === "facil" ? "bg-[#eaf0ec] text-[#2d6a5a]" :
                difficulty === "medio" ? "bg-[#fff6e6] text-[#c9830a]" :
                "bg-[#fdf2ee] text-[#b85c38]"
              }`}>{difficulty}</span>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-[#2d6a5a]">
                <Clock size={16} />
                <span className="font-mono font-bold text-lg">{formatTime(seconds)}</span>
              </div>
              <div className="flex items-center gap-2 text-[#c9830a]">
                <Star size={16} />
                <span className="font-bold text-lg">{score} pts</span>
              </div>
              <div className="text-[#7a6e5f] font-semibold text-sm">
                Movimientos: <span className="text-[#2c2416] font-bold">{moves}</span>
              </div>
            </div>

            <button
              onClick={() => startGame(difficulty)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2d6a5a] text-white hover:bg-[#1e4d40] text-xs font-bold transition-colors shadow-sm cursor-pointer"
            >
              <RefreshCw size={13} />
              Reiniciar
            </button>
          </div>

          {isWon ? (
            // Pantalla de Victoria
            <div className="w-full max-w-md bg-white border border-[#d9d0bc] rounded-2xl p-8 shadow-md text-center mt-6">
              <div className="w-16 h-16 bg-[#fff6e6] text-[#c9830a] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#c9830a]/20">
                <Star size={36} fill="#c9830a" />
              </div>
              <h3 className="text-2xl font-black text-[#2d6a5a] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                ¡Victoria Prehispánica!
              </h3>
              <p className="text-sm text-[#7a6e5f] mb-6">Has encontrado todos los pares de la colección del museo.</p>

              <div className="bg-[#f5f0e8] rounded-xl p-4 mb-6 text-left flex flex-col gap-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-[#7a6e5f]">Tiempo total:</span>
                  <span className="font-bold text-[#2c2416]">{formatTime(seconds)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#7a6e5f]">Movimientos:</span>
                  <span className="font-bold text-[#2c2416]">{moves}</span>
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
          ) : (
            // Tablero de Cartas
            <div className={`grid ${config[difficulty].gridClass} gap-4 w-full mb-8`}>
              {cards.map((card, index) => {
                const isFlipped = selected.includes(index) || matched.includes(card.cardId)
                return (
                  <div
                    key={card.id}
                    onClick={() => handleCardClick(index)}
                    className="aspect-square perspective-1000 cursor-pointer"
                  >
                    <div
                      className={`relative w-full h-full transform-style-3d transition-transform duration-500 rounded-xl shadow-sm ${
                        isFlipped ? "rotate-y-180" : ""
                      }`}
                    >
                      {/* Cara Frontal (Dorso de la carta) */}
                      <div className="absolute inset-0 bg-[#2d6a5a] rounded-xl border border-[#2d6a5a] flex items-center justify-center backface-hidden overflow-hidden">
                        <CardBackSVG />
                      </div>

                      {/* Cara Trasera (Imagen del Objeto) */}
                      <div className="absolute inset-0 bg-white rounded-xl border border-[#d9d0bc] flex flex-col items-center justify-between backface-hidden rotate-y-180 overflow-hidden p-2">
                        <div className="w-full flex-1 flex items-center justify-center overflow-hidden rounded-lg bg-[#f9f8f6]">
                          <img
                            src={card.image}
                            alt={card.titulo}
                            loading="lazy"
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        {/* Nombre del objeto (solo se muestra cuando se voltea) */}
                        <div className="w-full mt-1.5 text-center">
                          <p className="text-[10px] font-bold text-[#2d6a5a] truncate w-full px-1">{card.titulo}</p>
                          <p className="text-[8px] text-[#a09080] font-semibold truncate w-full">{card.cultura}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
