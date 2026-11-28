import { useState, useContext, useMemo } from "react"
import { AppContext } from "../../context/AppContext"
import { useLanguage } from "../../context/useLanguage"
import MuseumImage from "../MuseumImage"
import { ArrowLeft, CheckCircle, XCircle, RotateCcw } from "lucide-react"

const TOTAL_ROUNDS = 10
const UNKNOWN = ["Desconocida", "Desconocido", "Unknown", "", "Desconocida,"]

function shuffle(arr) {
  return [...arr].sort(() => 0.5 - Math.random())
}

export default function WhereFrom() {
  const { allObjects, setActiveGame } = useContext(AppContext)
  const { t } = useLanguage()
  const [round, setRound] = useState(1)
  const [score, setScore] = useState(0)
  const [picked, setPicked] = useState(null)
  const [selected, setSelected] = useState(null)
  const [finished, setFinished] = useState(false)

  const countries = useMemo(() => {
    const s = new Set()
    allObjects.forEach(o => {
      if (o.pais && !UNKNOWN.includes(o.pais)) s.add(o.pais)
    })
    return Array.from(s)
  }, [allObjects])

  const pool = useMemo(() => {
    return allObjects.filter(o =>
      o.pais && !UNKNOWN.includes(o.pais) &&
      (o.thumbnail || o.localImage || o.url) && countries.length >= 4
    )
  }, [allObjects, countries])

  const nextRound = (r) => {
    const obj = pool[Math.floor(Math.random() * pool.length)]
    const wrong = shuffle(countries.filter(c => c !== obj.pais)).slice(0, 3)
    setPicked({ obj, options: shuffle([obj.pais, ...wrong]) })
    setSelected(null)
    setRound(r)
  }

  const start = () => {
    setScore(0)
    setFinished(false)
    nextRound(1)
  }

  if (pool.length < 4) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8" style={{ background: "#f5f0e8" }}>
        <p className="text-sm text-[#7a6e5f]">{t("game.where.noData")}</p>
      </div>
    )
  }

  if (!picked) {
    return (
      <div className="flex-1 flex flex-col items-center justify-start p-4 md:p-8" style={{ background: "#f5f0e8" }}>
        <div className="w-full max-w-2xl">
          <button onClick={() => setActiveGame(null)} className="inline-flex items-center gap-2 text-xs font-bold text-[#2d6a5a] mb-6 cursor-pointer">
            <ArrowLeft size={16} /> {t("game.back")}
          </button>
          <div className="bg-white border border-[#d9d0bc] rounded-2xl p-6 sm:p-8 shadow-sm text-center">
            <h3 className="text-xl font-black text-[#2c2416] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              {t("hub.where.title")}
            </h3>
            <p className="text-xs text-[#7a6e5f] leading-relaxed mb-6">{t("hub.where.desc")}</p>
            <button onClick={start} className="px-6 py-3 bg-[#2d6a5a] hover:bg-[#1e4d40] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer">
              {t("game.play")}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const correct = selected !== null && selected === picked.obj.pais

  const answer = (opt) => {
    if (selected) return
    setSelected(opt)
    if (opt === picked.obj.pais) setScore(s => s + 1)
  }

  const advance = () => {
    if (round >= TOTAL_ROUNDS) setFinished(true)
    else nextRound(round + 1)
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-4 md:p-8" style={{ background: "#f5f0e8" }}>
      <div className="w-full max-w-2xl">
        <button onClick={() => setActiveGame(null)} className="inline-flex items-center gap-2 text-xs font-bold text-[#2d6a5a] mb-6 cursor-pointer">
          <ArrowLeft size={16} /> {t("game.back")}
        </button>

        {finished ? (
          <div className="bg-white border border-[#d9d0bc] rounded-2xl p-6 sm:p-8 shadow-sm text-center">
            <h3 className="text-xl font-black text-[#2c2416] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              {t("game.finished")}
            </h3>
            <p className="text-sm text-[#7a6e5f] mb-6">{t("game.score", { score, total: TOTAL_ROUNDS })}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={start} className="inline-flex items-center gap-2 px-5 py-3 bg-[#2d6a5a] hover:bg-[#1e4d40] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer">
                <RotateCcw size={14} /> {t("game.playAgain")}
              </button>
              <button onClick={() => setActiveGame(null)} className="px-5 py-3 bg-white border border-[#d9d0bc] text-[#2c2416] rounded-xl text-xs font-bold hover:bg-[#f9f8f6] transition-colors cursor-pointer">
                {t("game.back")}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#d9d0bc] rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[11px] font-bold text-[#7a6e5f] uppercase tracking-wider">
                {t("game.round", { n: round, total: TOTAL_ROUNDS })}
              </span>
              <span className="text-[11px] font-bold text-[#2d6a5a]">
                {t("game.scoreShort", { score })}
              </span>
            </div>

            <div className="w-full aspect-square max-h-80 mx-auto rounded-2xl overflow-hidden bg-[#f9f8f6] mb-4">
              <MuseumImage objeto={picked.obj} alt={picked.obj.titulo || ""} useThumbnail={true} className="w-full h-full object-contain" />
            </div>

            <p className="text-center text-sm font-bold text-[#2c2416] mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
              {picked.obj.titulo}
            </p>
            <p className="text-center text-xs text-[#7a6e5f] mb-4">{t("game.where.question")}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {picked.options.map(opt => {
                const isCorrect = opt === picked.obj.pais
                const isSelected = opt === selected
                let cls = "bg-white border-[#d9d0bc] text-[#2c2416] hover:bg-[#f9f8f6]"
                if (selected) {
                  if (isCorrect) cls = "bg-[#eaf0ec] border-[#2d6a5a] text-[#1e4d40]"
                  else if (isSelected) cls = "bg-[#fdf2ee] border-[#b85c38] text-[#9c4c2d]"
                  else cls = "bg-white border-[#d9d0bc] text-[#a09080] opacity-60"
                }
                return (
                  <button
                    key={opt}
                    onClick={() => answer(opt)}
                    disabled={!!selected}
                    className={`px-4 py-3 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${cls}`}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>

            {selected && (
              <div className="mt-4 flex flex-col items-center gap-3">
                <p className={`inline-flex items-center gap-2 text-xs font-bold ${correct ? "text-[#1e4d40]" : "text-[#9c4c2d]"}`}>
                  {correct ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  {correct ? t("game.correct") : t("game.wrong", { value: picked.obj.pais })}
                </p>
                {picked.obj.lugar_origen && (
                  <p className="text-[11px] text-[#7a6e5f]">{picked.obj.lugar_origen}</p>
                )}
                <button onClick={advance} className="px-5 py-2.5 bg-[#2d6a5a] hover:bg-[#1e4d40] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer">
                  {round >= TOTAL_ROUNDS ? t("game.seeResult") : t("game.next")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
