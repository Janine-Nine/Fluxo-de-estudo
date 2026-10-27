import React, { useEffect, useMemo, useState } from 'react';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { EmptyState } from './components/EmptyState';
import { FilterBar } from './components/FilterBar';
import { Header } from './components/Header';
import { ObjectiveCard } from './components/ObjectiveCard';
import { ObjectiveFormModal } from './components/ObjectiveFormModal';
import { StatsOverview } from './components/StatsOverview';
import { storageService } from './services/storageService';
import {
  ObjectiveFormData,
  SortOption,
  StatusFilter,
  StudyObjective,
} from './types/objective';
import { CheckCircle2, Info, Plus } from 'lucide-react';

export default function App() {
  const [objectives, setObjectives] = useState<StudyObjective[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState<StudyObjective | null>(null);

  // Estado para exclusão com confirmação
  const [deletingObjective, setDeletingObjective] = useState<StudyObjective | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Filtros e ordenação
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('deadline_asc');

  // Mensagens de feedback (Toast)
  const [feedbackMessage, setFeedbackMessage] = useState<{
    text: string;
    type: 'success' | 'info';
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 3500);
  };

  // Carrega dados iniciais do localStorage na montagem
  useEffect(() => {
    const loaded = storageService.getObjectives();
    setObjectives(loaded);
  }, []);

  // Handlers para ações de CRUD
  const handleOpenNewModal = () => {
    setEditingObjective(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (obj: StudyObjective) => {
    setEditingObjective(obj);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingObjective(null);
  };

  const handleSaveObjective = (formData: ObjectiveFormData, id?: string) => {
    if (id) {
      // Atualização (Editar)
      const updated = storageService.updateObjective(id, formData);
      if (updated) {
        setObjectives((prev) => prev.map((item) => (item.id === id ? updated : item)));
        showToast('Objetivo atualizado com sucesso!');
      }
    } else {
      // Criação (Cadastrar)
      const created = storageService.addObjective(formData);
      setObjectives((prev) => [created, ...prev]);
      showToast('Novo objetivo de estudo cadastrado!');
    }
  };

  const handleDeleteRequest = (obj: StudyObjective) => {
    setDeletingObjective(obj);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingObjective) return;
    const success = storageService.deleteObjective(deletingObjective.id);
    if (success) {
      setObjectives((prev) => prev.filter((item) => item.id !== deletingObjective.id));
      showToast(`Objetivo "${deletingObjective.title}" foi excluído.`, 'info');
    }
    setIsDeleteModalOpen(false);
    setDeletingObjective(null);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDeletingObjective(null);
  };

  const handleToggleStatus = (id: string) => {
    const updated = storageService.toggleStatus(id);
    if (updated) {
      setObjectives((prev) => prev.map((item) => (item.id === id ? updated : item)));
      const statusLabels = {
        not_started: 'Não Iniciado',
        in_progress: 'Em Andamento',
        completed: 'Concluído! Parabéns!',
      };
      showToast(`Status alterado para: ${statusLabels[updated.status]}`);
    }
  };

  const handleLoadSamples = () => {
    const samples = storageService.resetWithSamples();
    setObjectives(samples);
    showToast('Exemplos de objetivos carregados!');
  };

  // Filtragem e ordenação computadas
  const filteredAndSortedObjectives = useMemo(() => {
    let result = [...objectives];

    // Filtro por texto de busca
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (obj) =>
          obj.title.toLowerCase().includes(q) ||
          (obj.description && obj.description.toLowerCase().includes(q))
      );
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      result = result.filter((obj) => obj.status === statusFilter);
    }

    // Ordenação
    result.sort((a, b) => {
      if (sortOption === 'deadline_asc') {
        return (a.deadline || '').localeCompare(b.deadline || '');
      }
      if (sortOption === 'deadline_desc') {
        return (b.deadline || '').localeCompare(a.deadline || '');
      }
      if (sortOption === 'created_desc') {
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      }
      if (sortOption === 'title_asc') {
        return a.title.localeCompare(b.title, 'pt-BR');
      }
      return 0;
    });

    return result;
  }, [objectives, searchQuery, statusFilter, sortOption]);

  const isFiltered = searchQuery.trim() !== '' || statusFilter !== 'all';

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans">
      {/* Toast Feedback flutuante */}
      {feedbackMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-800'
                : 'bg-slate-900 text-white border-slate-800'
            }`}
          >
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-sky-400 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
        </div>
      )}

      {/* Cabeçalho */}
      <Header onOpenNewModal={handleOpenNewModal} totalCount={objectives.length} />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Painel de Estatísticas e Contagem */}
        <StatsOverview
          objectives={objectives}
          currentFilter={statusFilter}
          onSelectFilter={(newFilter) => setStatusFilter(newFilter)}
        />

        {/* Barra de Filtro, Busca e Ordenação (apenas se houver objetivos) */}
        {objectives.length > 0 && (
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            sortOption={sortOption}
            onSortOptionChange={setSortOption}
          />
        )}

        {/* Listagem de Objetivos em Cartões */}
        {filteredAndSortedObjectives.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <span className="text-sm font-semibold text-slate-700">
                Mostrando {filteredAndSortedObjectives.length} de {objectives.length}{' '}
                {objectives.length === 1 ? 'objetivo' : 'objetivos'}
              </span>

              {isFiltered && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                >
                  Limpar filtros
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAndSortedObjectives.map((obj) => (
                <ObjectiveCard
                  key={obj.id}
                  objective={obj}
                  onEdit={handleOpenEditModal}
                  onDeleteRequest={handleDeleteRequest}
                  onToggleStatus={handleToggleStatus}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Estado Vazio (quando não há objetivos cadastrados ou filtros zerados) */
          <EmptyState
            isFiltered={isFiltered}
            onOpenNewModal={handleOpenNewModal}
            onResetFilter={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
            onLoadSamples={handleLoadSamples}
          />
        )}
      </main>

      {/* Rodapé Acolhedor */}
      <footer className="border-t border-slate-200/60 bg-white py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-xs text-slate-500">
          <p>
            <strong>StudyFlow</strong> — Seu companheiro na jornada de aprendizagem.
          </p>
          <p className="mt-1">
            Seus dados são salvos com segurança diretamente no seu navegador.
          </p>
        </div>
      </footer>

      {/* Modal de Formulário (Cadastrar / Editar) */}
      <ObjectiveFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSave={handleSaveObjective}
        editingObjective={editingObjective}
      />

      {/* Modal de Confirmação de Exclusão (Requisito: excluir somente após confirmação) */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        objective={deletingObjective}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
