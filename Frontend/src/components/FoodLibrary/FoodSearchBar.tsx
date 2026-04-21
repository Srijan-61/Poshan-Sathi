

interface Props {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
}

export default function FoodSearchBar({ searchTerm, setSearchTerm }: Props) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400">
        <span className="material-symbols-outlined">search</span>
      </div>
      <input
        id="food-library-search"
        type="text"
        className={`w-full pl-12 pr-12 py-4 border rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all shadow-sm text-lg ${
          "bg-white border-neutral-200 text-neutral-900 placeholder-neutral-400"
        }`}
        placeholder="Search for Dal Bhat, Momo..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {searchTerm && (
        <button
          onClick={() => setSearchTerm("")}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      )}
    </div>
  );
}
