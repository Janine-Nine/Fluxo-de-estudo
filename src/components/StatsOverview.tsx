import React from 'react';
import { CheckCircle2, Clock, ListTodo, PlayCircle } from 'lucide-react';
import { StatusFilter, StudyObjective } from '../types/objective';

interface StatsOverviewProps {
  objectives: StudyObjective[];
  currentFilter: StatusFilter;
  onSelectFilter: (filter: StatusFilter) => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  objectives,
  currentFilter,
  onSelectFilter,
}) => {
  const total = objectives.length;
  const notStarted = objectives.filter((o) => o.status === 'not_started').length;
  const inProgress = objectives.filter((o) => o.status === 'in_progress').length;
  const completed = objectives.filter((o) => o.status === 'completed').length;

  const percentCompleted = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <span>Visão Geral dos Estudos</span>
            <span className="text-xs font-normal text-slate-500">
              ({total} {total === 1 ? 'objetivo cadastrado' : 'objetivos cadastrados'})
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Clique nos cartões abaixo para filtrar rapidamente a sua lista
          </p>
        </div>

        {/* Barra de progresso para motivação do estudante */}
        {total > 0 && (
          <div className="flex items-center gap-3 min-w-[200px]">
            <div className="flex-1">
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                <span>Progresso geral</span>
                <span className="text-indigo-600 font-bold">{percentCompleted}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${percentCompleted}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cartões de status e contagem */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        {/* Total */}
        <button
          type="button"
          onClick={() => onSelectFilter('all')}
          className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left cursor-pointer ${
            currentFilter === 'all'
              ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-200'
              : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
          }`}
        >
          <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <ListTodo className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Total</div>
            <div className="text-xl font-bold text-slate-900">{total}</div>
          </div>
        </button>

        {/* Não Iniciados */}
        <button
          type="button"
          onClick={() => onSelectFilter('not_started')}
          className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left cursor-pointer ${
            currentFilter === 'not_started'
              ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-200'
              : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
          }`}
        >
          <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Não Iniciados</div>
            <div className="text-xl font-bold text-amber-900">{notStarted}</div>
          </div>
        </button>

        {/* Em Andamento */}
        <button
          type="button"
          onClick={() => onSelectFilter('in_progress')}
          className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left cursor-pointer ${
            currentFilter === 'in_progress'
              ? 'bg-sky-50/70 border-sky-300 ring-2 ring-sky-200'
              : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
          }`}
        >
          <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
            <PlayCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Em Andamento</div>
            <div className="text-xl font-bold text-sky-900">{inProgress}</div>
          </div>
        </button>

        {/* Concluídos */}
        <button
          type="button"
          onClick={() => onSelectFilter('completed')}
          className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left cursor-pointer ${
            currentFilter === 'completed'
              ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-200'
              : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
          }`}
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Concluídos</div>
            <div className="text-xl font-bold text-emerald-900">{completed}</div>
          </div>
        </button>
      </div>
    </div>
  );
};
