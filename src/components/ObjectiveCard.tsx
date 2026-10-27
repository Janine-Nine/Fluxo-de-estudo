import React from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Edit3,
  MoreVertical,
  PlayCircle,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { ObjectiveStatus, StudyObjective } from '../types/objective';

interface ObjectiveCardProps {
  objective: StudyObjective;
  onEdit: (objective: StudyObjective) => void;
  onDeleteRequest: (objective: StudyObjective) => void;
  onToggleStatus: (id: string) => void;
}

export const ObjectiveCard: React.FC<ObjectiveCardProps> = ({
  objective,
  onEdit,
  onDeleteRequest,
  onToggleStatus,
}) => {
  // Configuração visual de status
  const statusConfig: Record<
    ObjectiveStatus,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    not_started: {
      label: 'Não Iniciado',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
    },
    in_progress: {
      label: 'Em Andamento',
      bg: 'bg-sky-50',
      text: 'text-sky-800',
      border: 'border-sky-200',
      icon: <PlayCircle className="w-3.5 h-3.5 text-sky-600" />,
    },
    completed: {
      label: 'Concluído',
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
    },
  };

  const currentStatus = statusConfig[objective.status];

  // Cálculo e formatação do prazo
  const getDeadlineMeta = (deadlineStr: string) => {
    if (!deadlineStr) return { formatted: 'Sem prazo', isOverdue: false, isToday: false, badgeText: null };

    // Comparação de datas (considerando fuso local sem horas)
    const [year, month, day] = deadlineStr.split('-').map(Number);
    const deadlineDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const formatted = deadlineDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    if (objective.status === 'completed') {
      return { formatted, isOverdue: false, isToday: false, badgeText: null };
    }

    if (diffDays < 0) {
      return {
        formatted,
        isOverdue: true,
        isToday: false,
        badgeText: `Atrasado há ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'dia' : 'dias'}`,
      };
    }
    if (diffDays === 0) {
      return {
        formatted,
        isOverdue: false,
        isToday: true,
        badgeText: 'Vence hoje!',
      };
    }
    if (diffDays === 1) {
      return {
        formatted,
        isOverdue: false,
        isToday: false,
        badgeText: 'Vence amanhã',
      };
    }
    if (diffDays <= 3) {
      return {
        formatted,
        isOverdue: false,
        isToday: false,
        badgeText: `Faltam ${diffDays} dias`,
      };
    }

    return { formatted, isOverdue: false, isToday: false, badgeText: null };
  };

  const deadlineMeta = getDeadlineMeta(objective.deadline);

  return (
    <div
      className={`group relative bg-white rounded-2xl p-5 border transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
        objective.status === 'completed'
          ? 'border-slate-200/70 bg-slate-50/40 opacity-90'
          : deadlineMeta.isOverdue
          ? 'border-rose-200 shadow-xs'
          : 'border-slate-200/90'
      }`}
    >
      <div>
        {/* Topo do cartão: Badge de Status & Botões de Ação */}
        <div className="flex items-center justify-between gap-2 mb-3">
          {/* Badge de status clicável para avançar rapidamente */}
          <button
            type="button"
            onClick={() => onToggleStatus(objective.id)}
            title="Clique para alternar o status do objetivo"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border cursor-pointer transition-transform active:scale-95 hover:opacity-90 ${currentStatus.bg} ${currentStatus.text} ${currentStatus.border}`}
          >
            {currentStatus.icon}
            <span>{currentStatus.label}</span>
          </button>

          {/* Botões de Ação: Editar e Excluir */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(objective)}
              title="Editar objetivo"
              aria-label={`Editar objetivo ${objective.title}`}
              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDeleteRequest(objective)}
              title="Excluir objetivo"
              aria-label={`Excluir objetivo ${objective.title}`}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Título do Objetivo */}
        <h3
          className={`text-lg font-bold text-slate-900 leading-snug mb-2 ${
            objective.status === 'completed' ? 'line-through text-slate-500' : ''
          }`}
        >
          {objective.title}
        </h3>

        {/* Descrição */}
        {objective.description ? (
          <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-4 whitespace-pre-line">
            {objective.description}
          </p>
        ) : (
          <p className="text-sm text-slate-400 italic mb-4">Sem descrição detalhada.</p>
        )}
      </div>

      {/* Rodapé do cartão: Prazo e indicador de urgência */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium">Prazo: {deadlineMeta.formatted}</span>
        </div>

        {deadlineMeta.badgeText && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium text-[11px] ${
              deadlineMeta.isOverdue
                ? 'bg-rose-100 text-rose-700'
                : deadlineMeta.isToday
                ? 'bg-amber-100 text-amber-800 font-semibold'
                : 'bg-indigo-50 text-indigo-700'
            }`}
          >
            {deadlineMeta.isOverdue && <AlertCircle className="w-3 h-3 text-rose-600" />}
            {deadlineMeta.badgeText}
          </span>
        )}
      </div>
    </div>
  );
};
