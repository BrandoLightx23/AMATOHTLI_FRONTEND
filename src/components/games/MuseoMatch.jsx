import { useState, useEffect, useContext, useRef } from "react"
import { AppContext } from "../../context/AppContext"
import { getImageUrl } from "../../api/api"
import { ArrowLeft, Clock, Star, RefreshCw, Award } from "lucide-react"

export default function MuseoMatch() {
  const { allObjects, setActiveGame } = useContext(AppContext)
  
  // Estados del juego
  const [mode, setMode] = useState(null) // null, 'timed', 'moves', 'infinite'
  const [board, setBoard] = useState([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [movesLeft, setMovesLeft] = useState(25)
  const [selectedCell, setSelectedCell] = useState(null) // { r, c }
  const [isProcessing, setIsProcessing] = useState(false)
  const [gameFinished, setGameFinished] = useState(false)
  const [tileTypes, setTileTypes] = useState([]) // 6 unique objects used as tiles
  
  const timerRef = useRef(null)
  const boardSize = 8

  // Inicializar los tipos de fichas del juego (6 objetos con imágenes claras)
  useEffect(() => {
    if (allObjects.length > 0) {
      const valid = allObjects.filter(obj => obj.thumbnail || obj.localImage)
      const shuffled = [...valid].sort(() => 0.5 - Math.random())
      setTileTypes(shuffled.slice(0, 6)) // Escoger 6 distintos
    }
  }, [allObjects])

  // Timer para el modo de tiempo
  useEffect(() => {
    if (mode === "timed" && timeLeft > 0 && !gameFinished) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameFinished(true)
            clearInterval(timerRef.current)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [mode, timeLeft, gameFinished])

  // Crear un tablero inicial sin combinaciones de 3
  const generateInitialBoard = (types) => {
    let newBoard = []
    for (let r = 0; r < boardSize; r++) {
      for (let c = 0; c < boardSize; c++) {
        let possibleTypes = [0, 1, 2, 3, 4, 5]
        
        // Evitar combinaciones horizontales
        if (c >= 2) {
          const t1 = newBoard[r * boardSize + (c - 1)].type
          const t2 = newBoard[r * boardSize + (c - 2)].type
          if (t1 === t2) {
            possibleTypes = possibleTypes.filter(t => t !== t1)
          }
        }
        
        // Evitar combinaciones verticales
        if (r >= 2) {
          const t1 = newBoard[(r - 1) * boardSize + c].type
          const t2 = newBoard[(r - 2) * boardSize + c].type
          if (t1 === t2) {
            possibleTypes = possibleTypes.filter(t => t !== t1)
          }
        }

        const chosenType = possibleTypes[Math.floor(Math.random() * possibleTypes.length)]
        newBoard.push({
          id: `tile-${r}-${c}-${Math.random()}`,
          type: chosenType,
          r,
          c
        })
      }
    }
    return newBoard
  }

  const startGame = (gameMode) => {
    setMode(gameMode)
    setScore(0)
    setTimeLeft(60)
    setMovesLeft(25)
    setSelectedCell(null)
    setIsProcessing(false)
    setGameFinished(false)
    
    // Generar tablero
    if (tileTypes.length > 0) {
      setBoard(generateInitialBoard(tileTypes))
    }
  }

  // Comprobar filas y columnas para emparejamientos
  const findMatches = (currentBoard) => {
    let matchedCells = new Set()

    // Comprobar filas
    for (let r = 0; r < boardSize; r++) {
      let matchRun = 1
      let matchType = null
      let startCol = 0

      for (let c = 0; c < boardSize; c++) {
        const type = currentBoard[r * boardSize + c]?.type
        if (c === 0) {
          matchType = type
          startCol = 0
          matchRun = 1
        } else {
          if (type === matchType && type !== undefined) {
            matchRun++
          } else {
            if (matchRun >= 3) {
              for (let i = startCol; i < c; i++) {
                matchedCells.add(r * boardSize + i)
              }
            }
            matchType = type
            startCol = c
            matchRun = 1
          }
        }
      }
      if (matchRun >= 3) {
        for (let i = startCol; i < boardSize; i++) {
          matchedCells.add(r * boardSize + i)
        }
      }
    }

    // Comprobar columnas
    for (let c = 0; c < boardSize; c++) {
      let matchRun = 1
      let matchType = null
      let startRow = 0

      for (let r = 0; r < boardSize; r++) {
        const type = currentBoard[r * boardSize + c]?.type
        if (r === 0) {
          matchType = type
          startRow = 0
          matchRun = 1
        } else {
          if (type === matchType && type !== undefined) {
            matchRun++
          } else {
            if (matchRun >= 3) {
              for (let i = startRow; i < r; i++) {
                matchedCells.add(i * boardSize + c)
              }
            }
            matchType = type
            startRow = r
            matchRun = 1
          }
        }
      }
      if (matchRun >= 3) {
        for (let i = startRow; i < boardSize; i++) {
          matchedCells.add(i * boardSize + c)
        }
      }
    }

    return Array.from(matchedCells)
  }

  // Ejecutar eliminación de combinaciones y caída de nuevas piezas
  const processBoardMatches = async (tempBoard, wasMove = false) => {
    setIsProcessing(true)
    let currentBoard = [...tempBoard]
    let loops = 0
    let roundScore = 0

    while (loops < 10) { // Límite para evitar loops infinitos
      const matches = findMatches(currentBoard)
      if (matches.length === 0) break

      // Sumar puntos
      roundScore += matches.length * 20
      
      // Marcar celdas como eliminadas (null)
      matches.forEach(idx => {
        currentBoard[idx] = null
      })

      setBoard([...currentBoard])
      // Retrasar para animación de desaparición
      await new Promise(res => setTimeout(res, 250))

      // Desplazar celdas hacia abajo (Gravedad)
      for (let c = 0; c < boardSize; c++) {
        let writeIdx = boardSize - 1
        for (let r = boardSize - 1; r >= 0; r--) {
          const idx = r * boardSize + c
          if (currentBoard[idx] !== null) {
            currentBoard[writeIdx * boardSize + c] = {
              ...currentBoard[idx],
              r: writeIdx,
              c
            }
            if (writeIdx !== r) {
              currentBoard[idx] = null
            }
            writeIdx--
          }
        }

        // Rellenar parte superior con nuevas piezas
        for (let r = writeIdx; r >= 0; r--) {
          const chosenType = Math.floor(Math.random() * 6)
          currentBoard[r * boardSize + c] = {
            id: `tile-${r}-${c}-${Math.random()}`,
            type: chosenType,
            r,
            c
          }
        }
      }

      setBoard([...currentBoard])
      await new Promise(res => setTimeout(res, 250))
      loops++
    }

    if (roundScore > 0) {
      setScore(prev => prev + roundScore)
    }
    
    setIsProcessing(false)

    // Si fue un movimiento del jugador en modo "moves", restar movimientos
    if (wasMove && mode === "moves") {
      setMovesLeft(prev => {
        const next = prev - 1
        if (next <= 0) {
          setGameFinished(true)
        }
        return next
      })
    }
  }

  // Manejar click en una celda
  const handleCellClick = (r, c) => {
    if (isProcessing || gameFinished) return

    const cellIndex = r * boardSize + c
    
    if (selectedCell === null) {
      setSelectedCell({ r, c })
    } else {
      // Comprobar si es celda vecina
      const rowDiff = Math.abs(selectedCell.r - r)
      const colDiff = Math.abs(selectedCell.c - c)
      const isNeighbor = (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)

      if (isNeighbor) {
        // Intercambiar piezas
        const idx1 = selectedCell.r * boardSize + selectedCell.c
        const idx2 = r * boardSize + c
        
        let tempBoard = [...board]
        const tile1 = tempBoard[idx1]
        const tile2 = tempBoard[idx2]

        tempBoard[idx1] = { ...tile2, r: selectedCell.r, c: selectedCell.c }
        tempBoard[idx2] = { ...tile1, r, c }

        // Comprobar si el intercambio crea un match
        const matches = findMatches(tempBoard)
        if (matches.length > 0) {
          setBoard(tempBoard)
          processBoardMatches(tempBoard, true)
        } else {
          // Intercambio fallido: revertir con un pequeño efecto visual
          setBoard(tempBoard)
          setIsProcessing(true)
          setTimeout(() => {
            // Revertir
            tempBoard[idx1] = tile1
            tempBoard[idx2] = tile2
            setBoard(tempBoard)
            setIsProcessing(false)
          }, 400)
        }
        setSelectedCell(null)
      } else {
        // Seleccionar la nueva celda en su lugar
        setSelectedCell({ r, c })
      }
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
          MUSEO MATCH
        </h2>
        <div className="w-20"></div>
      </div>

      {!mode ? (
        // Pantalla de selección de modo
        <div className="w-full max-w-md bg-white border border-[#d9d0bc] rounded-2xl p-8 shadow-md text-center mt-12">
          <Award size={48} className="text-[#c9830a] mx-auto mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-[#2d6a5a] mb-2">Selecciona un Modo de Juego</h3>
          <p className="text-sm text-[#7a6e5f] mb-6">Alinea 3 o más objetos iguales en el tablero para eliminarlos.</p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => startGame("timed")}
              className="py-3.5 px-6 rounded-xl bg-[#eaf0ec] hover:bg-[#d5e4dd] text-[#2d6a5a] font-bold text-sm transition-colors border border-[#2d6a5a]/20 cursor-pointer"
            >
              Contra Reloj (60 segundos)
            </button>
            <button
              onClick={() => startGame("moves")}
              className="py-3.5 px-6 rounded-xl bg-[#fff6e6] hover:bg-[#ffeed1] text-[#c9830a] font-bold text-sm transition-colors border border-[#c9830a]/20 cursor-pointer"
            >
              Límite de Movimientos (25 movimientos)
            </button>
            <button
              onClick={() => startGame("infinite")}
              className="py-3.5 px-6 rounded-xl bg-[#fdf2ee] hover:bg-[#fadcd0] text-[#b85c38] font-bold text-sm transition-colors border border-[#b85c38]/20 cursor-pointer"
            >
              Modo Infinito (Entrenamiento)
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-lg flex flex-col items-center">
          {/* Marcadores */}
          <div className="w-full bg-[#ede8dc] border border-[#d9d0bc] rounded-xl px-4 py-3.5 flex flex-wrap justify-between items-center gap-4 mb-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-[#7a6e5f] text-xs font-semibold uppercase tracking-wider">Modo:</span>
              <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-white text-[#2d6a5a] border border-[#d9d0bc]">
                {mode === "timed" ? "Contra Reloj" : mode === "moves" ? "Movimientos" : "Infinito"}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {mode === "timed" && (
                <div className="flex items-center gap-1.5 text-[#b85c38]">
                  <Clock size={16} />
                  <span className="font-mono font-bold">{timeLeft}s</span>
                </div>
              )}
              {mode === "moves" && (
                <div className="text-sm font-semibold text-[#b85c38]">
                  Movimientos: <span className="font-mono font-bold text-lg">{movesLeft}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-[#c9830a]">
                <Star size={16} fill="#c9830a" />
                <span className="font-bold text-lg">{score} pts</span>
              </div>
            </div>

            <button
              onClick={() => startGame(mode)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-[#2d6a5a] text-white hover:bg-[#1e4d40] text-xs font-bold transition-colors cursor-pointer"
            >
              <RefreshCw size={12} />
              Reiniciar
            </button>
          </div>

          {gameFinished ? (
            // Pantalla de Fin de Partida
            <div className="w-full max-w-sm bg-white border border-[#d9d0bc] rounded-2xl p-8 shadow-md text-center mt-6">
              <Star size={48} className="text-[#c9830a] mx-auto mb-4" fill="#c9830a" />
              <h3 className="text-2xl font-black text-[#2d6a5a] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                ¡Partida Terminada!
              </h3>
              <p className="text-sm text-[#7a6e5f] mb-6">Has completado el desafío del Museo Match.</p>

              <div className="bg-[#f5f0e8] rounded-xl p-4 mb-6 text-left flex flex-col gap-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-[#7a6e5f] font-bold">Puntuación Final:</span>
                  <span className="font-bold text-[#c9830a] text-lg">{score} pts</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setMode(null)}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#ede8dc] hover:bg-[#d9d0bc] text-[#2d6a5a] font-bold text-sm transition-colors cursor-pointer"
                >
                  Cambiar Modo
                </button>
                <button
                  onClick={() => startGame(mode)}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#2d6a5a] hover:bg-[#1e4d40] text-white font-bold text-sm transition-colors cursor-pointer"
                >
                  Jugar de Nuevo
                </button>
              </div>
            </div>
          ) : (
            // Tablero 8x8 de Fichas (Candy Crush style)
            <div className="w-full aspect-square bg-[#ede8dc] border-4 border-[#d9d0bc] rounded-2xl p-2 shadow-inner grid grid-cols-8 grid-rows-8 gap-1">
              {board.map((tile, index) => {
                if (!tile) {
                  // Celda vacía (efecto de explosión)
                  return (
                    <div
                      key={`empty-${index}`}
                      className="w-full h-full bg-[#f5f0e8] rounded-lg transition-all duration-300 scale-0"
                    />
                  )
                }

                const r = Math.floor(index / boardSize)
                const c = index % boardSize
                const isSelected = selectedCell && selectedCell.r === r && selectedCell.c === c
                const tileObj = tileTypes[tile.type]
                const imageUrl = tileObj ? getImageUrl(tileObj, true) : null

                return (
                  <div
                    key={tile.id}
                    onClick={() => handleCellClick(r, c)}
                    className={`w-full h-full bg-white rounded-lg p-1 flex items-center justify-center cursor-pointer transition-all duration-300 relative select-none hover:bg-[#fffbf4] active:scale-95 ${
                      isSelected ? "ring-4 ring-[#c9830a] z-10 scale-[1.05] shadow-lg" : "border border-[#d9d0bc]/50"
                    }`}
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="Museo Tile"
                        draggable="false"
                        className="max-w-full max-h-full object-contain pointer-events-none"
                      />
                    ) : (
                      <span className="text-[10px] font-bold text-[#7a6e5f]">{tile.type + 1}</span>
                    )}
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
