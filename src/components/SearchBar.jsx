import { useContext } from "react"
import { Search } from "lucide-react"
import { AppContext } from "../context/AppContext"

export default function SearchBar() {
  const { search, setSearch } = useContext(AppContext)

  return (
    <div className="px-6 py-3 bg-[#f5f0e8] border-b border-[#d9d0bc]">
      <div className="flex items-center gap-0 bg-white border border-[#d9d0bc] rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center gap-2 px-4 flex-1">
          <Search size={16} className="text-[#a09080] flex-shrink-0" />
          <input
            type="text"
            placeholder="Buscar cultura, región u objeto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none w-full text-[#2c2416] placeholder-[#a09080] text-sm py-3"
          />
        </div>
      </div>
    </div>
  )
}