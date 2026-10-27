import React, { useEffect, useState } from 'react';
import { Calendar, Check, HelpCircle, X } from 'lucide-react';
import { ObjectiveFormData, ObjectiveStatus, StudyObjective } from '../types/objective';

interface ObjectiveFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ObjectiveFormData, id?: string) => void;
  editingObjective?: StudyObjective | null;
}

export const ObjectiveFormModal: React.FC<ObjectiveFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingObjective,
}) => {
  const isEditing = !!editingObjective;

  // Data padrão para o campo de prazo: 7 dias a partir de hoje
  const getDefaultDeadline = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState<ObjectiveFormData>({
    title: '',
    description: '',
    deadline: getDefaultDeadline(),
    status: 'not_started',
  });

  const [errors, setErrors] = useState<{ title?: string; deadline?: string }>({});

  useEffect(() => {
    if (editingObjective) {
      setFormData({
        title: editingObjective.title,
        description: editingObjective.description || '',
        deadline: editingObjective.deadline || getDefaultDeadline(),
        status: editingObjective.status,
      });
      setErrors({});
    } else {
      setFormData({
        title: '',
        description: '',
        deadline: getDefaultDeadline(),
        status: 'not_started',
      });
      setErrors({});
    }
  }, [editingObjective, isOpen]);

  // Fechar com tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { title?: string; deadline?: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Por favor, informe o título do seu objetivo de estudo.';
    }

    if (!formData.deadline) {
      newErrors.deadline = 'Por favor, defina um prazo para conclusão.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData, editingObjective?.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-headline"
    >
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-slate-200/90 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
        {/* Cabeçalho do modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <h3 id="modal-headline" className="text-lg font-bold text-slate-900">
              {isEditing ? 'Editar Objetivo de Estudo' : 'Novo Objetivo de Estudo'}
            </h3>
            <p className="text-xs text-slate-500">
              {isEditing
                ? 'Atualize as informações do seu objetivo de aprendizagem.'
                : 'Defina o que você quer aprender com clareza e foco.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Fechar janela"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Campo Título */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-slate-800 mb-1">
              Título do objetivo <span className="text-rose-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              autoFocus
              placeholder="Ex: Aprender laços de repetição em JavaScript"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (errors.title) setErrors({ ...errors, title: undefined });
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                errors.title
                  ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/30'
                  : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
              }`}
            />
            {errors.title ? (
              <p className="text-xs text-rose-600 font-medium mt-1.5">{errors.title}</p>
            ) : (
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-slate-400" />
                Seja específico para saber exatamente quando terminar.
              </p>
            )}
          </div>

          {/* Campo Descrição */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-slate-800 mb-1">
              Descrição ou anotações <span className="text-xs font-normal text-slate-400">(opcional)</span>
            </label>
            <textarea
              id="description"
              rows={3}
              placeholder="Ex: Assistir aulas 1 a 4 do curso, ler documentação oficial e resolver 3 exercícios práticos no editor."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
            />
          </div>

          {/* Linha dupla: Prazo e Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Campo Prazo */}
            <div>
              <label htmlFor="deadline" className="block text-sm font-semibold text-slate-800 mb-1">
                Prazo de conclusão <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => {
                    setFormData({ ...formData, deadline: e.target.value });
                    if (errors.deadline) setErrors({ ...errors, deadline: undefined });
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-slate-900 text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.deadline
                      ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/30'
                      : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                  }`}
                />
              </div>
              {errors.deadline && (
                <p className="text-xs text-rose-600 font-medium mt-1.5">{errors.deadline}</p>
              )}
            </div>

            {/* Campo Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-semibold text-slate-800 mb-1">
                Status atual
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as ObjectiveStatus })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer"
              >
                <option value="not_started">⏳ Não Iniciado</option>
                <option value="in_progress">🚀 Em Andamento</option>
                <option value="completed">✅ Concluído</option>
              </select>
            </div>
          </div>

          {/* Rodapé com botões de ação */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold transition-all shadow-sm shadow-indigo-100 cursor-pointer"
            >
              {isEditing ? 'Atualizar Objetivo' : 'Salvar Objetivo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
