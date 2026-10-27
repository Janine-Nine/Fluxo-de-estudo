import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { StudyObjective } from '../types/objective';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  objective: StudyObjective | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  objective,
  onClose,
  onConfirm,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !objective) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-slate-200/90 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="flex-1">
              <h3 id="delete-dialog-title" className="text-lg font-bold text-slate-900">
                Confirmar Exclusão
              </h3>
              <p id="delete-dialog-description" className="text-sm text-slate-600 mt-1 leading-relaxed">
                Tem certeza de que deseja excluir o objetivo de estudo:
              </p>
              <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-sm font-semibold text-slate-800 break-words">
                "{objective.title}"
              </div>
              <p className="text-xs text-rose-600 font-medium mt-2">
                Esta ação não poderá ser desfeita.
              </p>
            </div>
          </div>
        </div>

        {/* Rodapé com botões de ação */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-200/70 text-sm font-semibold transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-sm font-semibold transition-all shadow-sm shadow-rose-200 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Sim, Excluir Objetivo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
