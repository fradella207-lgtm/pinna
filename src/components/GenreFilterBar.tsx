import React from "react";
import { 
  Compass, 
  Snowflake, 
  Mountain, 
  Utensils, 
  Landmark, 
  Camera, 
  Sparkles 
} from "lucide-react";
import { GenreSubcategory, SavedPlace } from "../types";
import { GENRE_METADATA } from "../data/categories";

interface GenreFilterBarProps {
  selectedGenre: GenreSubcategory | null;
  onSelectGenre: (genre: GenreSubcategory | null) => void;
  places: SavedPlace[];
}

export const GenreFilterBar: React.FC<GenreFilterBarProps> = ({
  selectedGenre,
  onSelectGenre,
  places,
}) => {
  const genres: { id: GenreSubcategory; icon: React.ReactNode }[] = [
    { id: "passi_motori", icon: <Compass className="w-3.5 h-3.5" /> },
    { id: "piste_sci", icon: <Snowflake className="w-3.5 h-3.5" /> },
    { id: "trekking_outdoor", icon: <Mountain className="w-3.5 h-3.5" /> },
    { id: "food_drink", icon: <Utensils className="w-3.5 h-3.5" /> },
    { id: "cultura_borghi", icon: <Landmark className="w-3.5 h-3.5" /> },
    { id: "relax_panorami", icon: <Camera className="w-3.5 h-3.5" /> },
  ];

  const getGenreCount = (genreId: GenreSubcategory) => {
    return places.filter((p) => p.sottocategoria === genreId).length;
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {/* All Genres Option */}
      <button
        id="genre-filter-all"
        type="button"
        onClick={() => onSelectGenre(null)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
          selectedGenre === null
            ? "bg-slate-900 text-white shadow-xs"
            : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
        }`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Tutte le Categorie</span>
        <span className="text-[11px] opacity-75">({places.length})</span>
      </button>

      {/* Specific Genres */}
      {genres.map(({ id, icon }) => {
        const meta = GENRE_METADATA[id];
        const count = getGenreCount(id);
        const isSelected = selectedGenre === id;

        return (
          <button
            key={id}
            id={`genre-filter-${id}`}
            type="button"
            onClick={() => onSelectGenre(isSelected ? null : id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all ${
              isSelected
                ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
            }`}
          >
            {icon}
            <span>{meta.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
