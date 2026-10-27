import React from 'react';
import { ArrowDownUp, Filter, Search, X } from 'lucide-react';
import { SortOption, StatusFilter } from '../types/objective';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (status: StatusFilter) => void;
  sortOption: SortOption;
  onSortOptionChange: (sort: SortOption) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortOption,
  onSortOptionChange,
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs mb-6 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
      {/* Campo de Busca */}
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar objetivo por título ou descrição..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
            title="Limpar busca"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Controles de Filtro e Ordenação */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
        {/* Seletor de Status */}
        <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
          <Filter className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as StatusFilter)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 cursor-pointer"
            aria-label="Filtrar por status"
          >
            <option value="all">Todos os Status</option>
            <option value="not_started">⏳ Não Iniciados</option>
            <option value="in_progress">🚀 Em Andamento</option>
            <option value="completed">✅ Concluídos</option>
          </select>
        </div>

        {/* Seletor de Ordenação */}
        <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
          <ArrowDownUp className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          <select
            value={sortOption}
            onChange={(e) => onSortOptionChange(e.target.value as SortOption)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 cursor-pointer"
            aria-label="Ordenar objetivos"
          >
            <option value="deadline_asc">Prazo: Mais próximo primeiro</option>
            <option value="deadline_desc">Prazo: Mais distante primeiro</option>
            <option value="created_desc">Mais recentes adicionados</option>
            <option value="title_asc">Ordem alfabética (A-Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
