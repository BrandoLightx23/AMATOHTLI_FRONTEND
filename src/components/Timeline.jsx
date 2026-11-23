import { useContext } from "react"
import { AppContext } from "../context/AppContext"
import { getObjectsByYear, getUnknownObjects } from "../api/api"
import { useLanguage } from "../context/useLanguage"
import { UNKNOWN_YEAR } from "../constants"

const PERIODS = [
  { range: [400, 900],  color: "#c9830a", label: "Antigüedad Temprana (400–900)" },
  { range: [1000, 1500], color: "#2d6a5a", label: "Clásico (1000–1500)" },
  { range: [1600, 1700], color: "#c9830a", label: "Posclásico Temprano (1600–1700)", dot: true },
  { range: [1800, 2000], color: "#b85c38", label: "Posclásico Tardío (1800–2000)" },
]

function getPeriodColor(year) {
  if (year === UNKNOWN_YEAR) return "#a09080"
  if (year >= 400 && year <= 900) return "#c9830a"
  if (year >= 1000 && year <= 1500) return "#2d6a5a"
  if (year >= 1600 && year <= 1700) return "#e8a012"
  if (year >= 1800 && year <= 2000) return "#b85c38"
  return "#7a6e5f"
}

export default function Timeline() {
  const { selectedYear, setSelectedYear, availableYears } = useContext(AppContext)
  const { t, formatCentury } = useLanguage()

  return (
    <div className="w-full flex flex-col gap-3">
      <h3 className="text-[#2d6a5a] font-bold text-xs uppercase tracking-wider">{t("timeline.title")}</h3>
      {/* Pills de años */}
      <div className="flex flex-wrap gap-2">
        {availableYears.map((year) => {
          const color = getPeriodColor(year)
          const isSelected = selectedYear === year
          return (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              style={{
                backgroundColor: isSelected ? color : "transparent",
                borderColor: isSelected ? color : color + "60",
                color: isSelected ? "#fff" : color,
              }}
              className="px-2.5 py-1 rounded-full border text-[10px] font-bold transition-all duration-200 hover:opacity-90 cursor-pointer"
            >
              {year === UNKNOWN_YEAR ? t("timeline.unknownShort") : formatCentury(year)}
            </button>
          )
        })}
      </div>

      {/* Leyenda de períodos */}
      <div className="flex flex-col gap-1.5 text-[10px] text-[#7a6e5f] mt-1 border-t border-[#d9d0bc]/50 pt-3">
        <span className="flex items-center gap-1.5 font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#c9830a]" /> {t("period.early")}
        </span>
        <span className="flex items-center gap-1.5 font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#2d6a5a]" /> {t("period.classic")}
        </span>
        <span className="flex items-center gap-1.5 font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#e8a012]" /> {t("period.earlyPost")}
        </span>
        <span className="flex items-center gap-1.5 font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#b85c38]" /> {t("period.latePost")}
        </span>
        <span className="flex items-center gap-1.5 font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#a09080]" /> {t("common.unknownDate")}
        </span>
      </div>
    </div>
  )
}