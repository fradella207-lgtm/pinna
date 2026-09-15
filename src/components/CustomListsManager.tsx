import React, { useState } from "react";
import { 
  Plus, 
  Layers, 
  Trash2, 
  Compass, 
  Snowflake, 
  Mountain, 
  Utensils, 
  Landmark, 
  Camera, 
  Calendar,
  X,
  Check,
  Filter
} from "lucide-react";
import { CustomList, Season, GenreSubcategory, SavedPlace } from "../types";
import { SEASONS_LIST, GENRE_METADATA } from "../data/categories";

interface CustomListsManagerProps {
  lists: CustomList[];
  places: SavedPlace[];
  activeListId: string | null;
  onSelectList: (listId: string | null) => void;
  onCreateList: (list: CustomList) => void;
  onDeleteList: (listId: string) => void;
}

const COLOR_PRESETS = [
  "#ea580c", // Orange
  "#0284c7", // Sky blue
  "#16a34a", // Emerald
  "#e11d48", // Rose
  "#7c3aed", // Violet
  "#0d9488", // Teal
  "#d97706", // Amber
  "#475569", // Slate
];

export const CustomListsManager: React.FC<CustomListsManagerProps> = ({
  lists,
  places,
  activeListId,
  onSelectList,
  onCreateList,
  onDeleteList,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [season, setSeason] = useState<Season>("Tutte le stagioni");
  const [genre, setGenre] = useState<GenreSubcategory | "misto">("passi_motori");
  const [selectedColor, setSelectedColor] = useState(COLOR_PRESETS[0]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newList: CustomList = {
      id: `list-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || undefined,
      season,
      genre,
      iconName: genre === "piste_sci" ? "Snowflake" : genre === "trekking_outdoor" ? "Mountain" : "Compass",
      color: selectedColor,
      created_at: new Date().toISOString(),
    };

    onCreateList(newList);
    setName("");
    setDescription("");
    setIsCreating(false);
  };

  const getPlacesCount = (listId: string) => {
    return places.filter((p) => p.list_ids?.includes(listId)).length;
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Liste per Stagione &amp; Attività
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Organizza i tuoi viaggi e spot in cartelle tematiche
            </p>
          </div>
        </div>

        <button
          id="btn-open-create-list"
          type="button"
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Nuova Lista</span>
        </button>
      </div>

      {/* Creation Drawer / Form */}
      {isCreating && (
        <form 
          onSubmit={handleCreate}
          className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-fadeIn"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <h3 className="text-sm font-bold text-slate-900">Crea Lista Personalizzata</h3>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Nome Lista *
              </label>
              <input
                id="input-new-list-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Es. Estate in Moto: Passi Svizzeri"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-indigo-500 bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Stagione di riferimento
              </label>
              <select
                id="select-new-list-season"
                value={season}
                onChange={(e) => setSeason(e.target.value as Season)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-indigo-500 bg-white"
              >
                {SEASONS_LIST.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Descrizione o Obiettivo (opzionale)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Es. Tornanti da fare nel weekend di luglio con gli amici"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-indigo-500 bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Genere Principale
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-indigo-500 bg-white"
              >
                <option value="passi_motori">🏍️ Passi &amp; Motori</option>
                <option value="piste_sci">⛷️ Piste da Sci &amp; Inverno</option>
                <option value="trekking_outdoor">🥾 Trekking &amp; Outdoor</option>
                <option value="food_drink">🍝 Food &amp; Aperitivi</option>
                <option value="cultura_borghi">🏰 Cultura &amp; Borghi</option>
                <option value="relax_panorami">📸 Belvedere &amp; Relax</option>
                <option value="misto">🌈 Misto / Varie</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Colore Badge
              </label>
              <div className="flex items-center gap-2 pt-1">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      selectedColor === c ? "scale-110 border-slate-900" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Annulla
            </button>
            <button
              id="btn-confirm-create-list"
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
            >
              Salva Lista
            </button>
          </div>
        </form>
      )}

      {/* Lists Grid / Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* All Places Option */}
        <button
          id="filter-all-lists"
          type="button"
          onClick={() => onSelectList(null)}
          className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
            activeListId === null
              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
              : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-xl ${activeListId === null ? "bg-slate-800" : "bg-slate-100 text-slate-600"}`}>
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs">Tutti i Luoghi</div>
              <div className="text-[11px] opacity-70">Tutte le attività</div>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeListId === null ? "bg-white/20" : "bg-slate-100 text-slate-700"}`}>
            {places.length}
          </span>
        </button>

        {/* Custom Lists */}
        {lists.map((lst) => {
          const count = getPlacesCount(lst.id);
          const isActive = activeListId === lst.id;

          return (
            <div
              key={lst.id}
              className={`group relative flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                isActive
                  ? "bg-indigo-50 border-indigo-300 text-indigo-950 shadow-sm ring-1 ring-indigo-400"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
              }`}
              onClick={() => onSelectList(isActive ? null : lst.id)}
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <span 
                  className="w-3.5 h-3.5 rounded-full shrink-0" 
                  style={{ backgroundColor: lst.color }} 
                />
                <div className="min-w-0">
                  <div className="font-bold text-xs truncate">{lst.name}</div>
                  <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                    <span>{lst.season}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                  {count}
                </span>

                {lists.length > 1 && (
                  <button
                    type="button"
                    title="Elimina lista"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Eliminare la lista "${lst.name}"? (I luoghi non verranno cancellati)`)) {
                        onDeleteList(lst.id);
                      }
                    }}
                    className="p-1 rounded-lg text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
