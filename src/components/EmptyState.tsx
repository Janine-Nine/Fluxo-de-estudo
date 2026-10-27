import React from 'react';
import { BookOpen, Plus, RefreshCw, SearchX, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  isFiltered: boolean;
  onOpenNewModal: () => void;
  onResetFilter: () => void;
  onLoadSamples: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  isFiltered,
  onOpenNewModal,
  onResetFilter,
  onLoadSamples,
}) => {
  if (isFiltered) {
    return (
      <div className="bg-white rounded-3xl p-10 border border-dashed border-slate-300 text-center max-w-lg mx-auto my-8">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
          <SearchX className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Nenhum objetivo encontrado</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          Não encontramos nenhum objetivo correspondente aos filtros ou busca selecionados.
        </p>
        <button
          type="button"
          onClick={onResetFilter}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
        >
          Limpar filtros de busca
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-10 sm:p-14 border border-dashed border-slate-300 text-center max-w-xl mx-auto my-8 shadow-xs">
      <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-indigo-100 to-violet-100 text-indigo-600 flex items-center justify-center mb-5 shadow-inner">
        <BookOpen className="w-8 h-8 stroke-[2.2]" />
      </div>
      <h3 className="text-xl font-bold text-slate-900">Nenhum objetivo cadastrado ainda</h3>
      <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
        Todo grande aprendizado começa com um primeiro passo simples. Cadastre o que você quer aprender agora mesmo para acompanhar seu progresso!
      </p>

      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={onOpenNewModal}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-sm hover:shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Cadastrar Primeiro Objetivo</span>
        </button>

        <button
          type="button"
          onClick={onLoadSamples}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-sm transition-colors cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Carregar Exemplos Sugeridos</span>
        </button>
      </div>
    </div>
  );
};
