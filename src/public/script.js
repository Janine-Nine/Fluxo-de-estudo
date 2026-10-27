/**
 * StudyFlow - Lógica da Aplicação (Vanilla JavaScript)
 * Gerenciamento completo de Objetivos de Estudos com persistência em localStorage
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'studyflow_objectives_v1';

  // Dados didáticos de exemplo para novos estudantes
  const INITIAL_SAMPLES = [
    {
      id: 'sample-1',
      title: 'Fundamentos de Lógica e Algoritmos',
      description: 'Compreender estruturas condicionais (if/else), laços de repetição (for/while) e resolução de problemas básicos.',
      deadline: getDatePlusDays(5),
      status: 'in_progress',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'sample-2',
      title: 'Criar meu primeiro repositório no GitHub',
      description: 'Aprender comandos básicos do Git: git init, add, commit, push e documentar o projeto com um README.md.',
      deadline: getDatePlusDays(10),
      status: 'not_started',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'sample-3',
      title: 'Configurar ambiente de desenvolvimento (VS Code & Node)',
      description: 'Instalar editor de código, extensões recomendadas de produtividade e terminal integrado.',
      deadline: getDatePlusDays(-1),
      status: 'completed',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  // Estado da aplicação
  let objectives = [];
  let currentFilter = 'all';
  let currentSort = 'deadline_asc';
  let searchQuery = '';
  let objectivePendingDeletion = null;

  // Elementos do DOM
  const btnOpenNewModal = document.getElementById('btn-open-new-modal');
  const modalForm = document.getElementById('modal-form');
  const btnCloseForm = document.getElementById('btn-close-form');
  const btnCancelForm = document.getElementById('btn-cancel-form');
  const objectiveForm = document.getElementById('objective-form');
  const modalFormTitle = document.getElementById('modal-form-title');
  const formObjectiveId = document.getElementById('form-objective-id');
  const formTitle = document.getElementById('form-title');
  const formDescription = document.getElementById('form-description');
  const formDeadline = document.getElementById('form-deadline');
  const formStatus = document.getElementById('form-status');

  // Modal de Exclusão
  const modalDelete = document.getElementById('modal-delete');
  const btnCancelDelete = document.getElementById('btn-cancel-delete');
  const btnConfirmDelete = document.getElementById('btn-confirm-delete');
  const deleteTargetTitle = document.getElementById('delete-target-title');

  // Filtros e busca
  const inputSearch = document.getElementById('input-search');
  const btnClearSearch = document.getElementById('btn-clear-search');
  const selectStatusFilter = document.getElementById('select-status-filter');
  const selectSort = document.getElementById('select-sort');
  const btnResetFilters = document.getElementById('btn-reset-filters');
  const summaryCountText = document.getElementById('summary-count-text');

  // Estatísticas
  const countTotal = document.getElementById('count-total');
  const countNotStarted = document.getElementById('count-not-started');
  const countInProgress = document.getElementById('count-in-progress');
  const countCompleted = document.getElementById('count-completed');
  const progressPercent = document.getElementById('progress-percent');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const statCards = document.querySelectorAll('.stat-card');

  // Grade e Empty State
  const objectivesGrid = document.getElementById('objectives-grid');
  const emptyState = document.getElementById('empty-state');
  const emptyTitle = document.getElementById('empty-title');
  const emptyDescription = document.getElementById('empty-description');
  const btnEmptyNew = document.getElementById('btn-empty-new');
  const btnLoadSamples = document.getElementById('btn-load-samples');
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');

  // Utilitário de data auxiliar
  function getDatePlusDays(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  }

  // ================= LocalStorage Service =================
  function loadObjectivesFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        saveObjectivesToStorage(INITIAL_SAMPLES);
        return INITIAL_SAMPLES;
      }
      return JSON.parse(data) || [];
    } catch (e) {
      console.error('Erro ao ler do localStorage', e);
      return [];
    }
  }

  function saveObjectivesToStorage(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Erro ao salvar no localStorage', e);
    }
  }

  // ================= Notificação Toast =================
  let toastTimer = null;
  function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    toastMessage.textContent = message;
    toast.classList.remove('hidden');
    toastTimer = setTimeout(() => {
      toast.classList.add('hidden');
    }, 3200);
  }

  // ================= Atualização de Estatísticas =================
  function updateStats() {
    const total = objectives.length;
    const notStarted = objectives.filter((o) => o.status === 'not_started').length;
    const inProgress = objectives.filter((o) => o.status === 'in_progress').length;
    const completed = objectives.filter((o) => o.status === 'completed').length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    countTotal.textContent = total;
    countNotStarted.textContent = notStarted;
    countInProgress.textContent = inProgress;
    countCompleted.textContent = completed;
    progressPercent.textContent = `${percent}%`;
    progressBarFill.style.width = `${percent}%`;

    // Atualiza classe ativa nos cartões de métricas
    statCards.forEach((card) => {
      if (card.dataset.filter === currentFilter) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
  }

  // ================= Formatação de Prazos =================
  function formatDeadlineInfo(deadlineStr, status) {
    if (!deadlineStr) return { formatted: 'Sem prazo', badge: '' };

    const [year, month, day] = deadlineStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const formatted = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

    if (status === 'completed') {
      return { formatted, badge: '', isOverdue: false };
    }

    if (diffDays < 0) {
      const days = Math.abs(diffDays);
      return {
        formatted,
        badge: `<span class="deadline-tag deadline-overdue">Atrasado há ${days} ${days === 1 ? 'dia' : 'dias'}</span>`,
        isOverdue: true,
      };
    }
    if (diffDays === 0) {
      return {
        formatted,
        badge: `<span class="deadline-tag deadline-today">Vence hoje!</span>`,
        isOverdue: false,
      };
    }
    if (diffDays === 1) {
      return {
        formatted,
        badge: `<span class="deadline-tag deadline-near">Vence amanhã</span>`,
        isOverdue: false,
      };
    }
    if (diffDays <= 3) {
      return {
        formatted,
        badge: `<span class="deadline-tag deadline-near">Faltam ${diffDays} dias</span>`,
        isOverdue: false,
      };
    }

    return { formatted, badge: '', isOverdue: false };
  }

  // ================= Renderização da Lista =================
  function renderObjectives() {
    updateStats();

    // Filtra itens
    let filtered = [...objectives];

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (o) => o.title.toLowerCase().includes(q) || (o.description && o.description.toLowerCase().includes(q))
      );
    }

    if (currentFilter !== 'all') {
      filtered = filtered.filter((o) => o.status === currentFilter);
    }

    // Ordenação
    filtered.sort((a, b) => {
      if (currentSort === 'deadline_asc') return (a.deadline || '').localeCompare(b.deadline || '');
      if (currentSort === 'deadline_desc') return (b.deadline || '').localeCompare(a.deadline || '');
      if (currentSort === 'created_desc') return (b.createdAt || '').localeCompare(a.createdAt || '');
      if (currentSort === 'title_asc') return a.title.localeCompare(b.title, 'pt-BR');
      return 0;
    });

    const isFiltered = searchQuery.trim() !== '' || currentFilter !== 'all';
    btnResetFilters.classList.toggle('hidden', !isFiltered);

    // Texto de resumo
    if (objectives.length === 0) {
      summaryCountText.textContent = '';
    } else {
      summaryCountText.textContent = `Mostrando ${filtered.length} de ${objectives.length} ${
        objectives.length === 1 ? 'objetivo' : 'objetivos'
      }`;
    }

    // Controle de Empty State
    if (filtered.length === 0) {
      objectivesGrid.innerHTML = '';
      emptyState.classList.remove('hidden');

      if (isFiltered) {
        emptyTitle.textContent = 'Nenhum objetivo encontrado';
        emptyDescription.textContent = 'Nenhum resultado corresponde à sua busca ou filtro atual.';
        btnLoadSamples.classList.add('hidden');
        btnEmptyNew.textContent = 'Limpar Filtros';
        btnEmptyNew.onclick = resetFilters;
      } else {
        emptyTitle.textContent = 'Nenhum objetivo cadastrado ainda';
        emptyDescription.textContent =
          'Todo aprendizado começa com uma meta simples. Cadastre o que você quer aprender agora mesmo!';
        btnLoadSamples.classList.remove('hidden');
        btnEmptyNew.textContent = 'Cadastrar Primeiro Objetivo';
        btnEmptyNew.onclick = openNewModal;
      }
      return;
    }

    emptyState.classList.add('hidden');

    // Constrói os cartões HTML
    const statusLabels = {
      not_started: { label: 'Não Iniciado', icon: '⏳' },
      in_progress: { label: 'Em Andamento', icon: '🚀' },
      completed: { label: 'Concluído', icon: '✅' },
    };

    objectivesGrid.innerHTML = filtered
      .map((item) => {
        const isCompleted = item.status === 'completed';
        const deadlineMeta = formatDeadlineInfo(item.deadline, item.status);
        const statusMeta = statusLabels[item.status] || statusLabels.not_started;
        const overdueClass = deadlineMeta.isOverdue ? 'is-overdue' : '';
        const completedClass = isCompleted ? 'is-completed' : '';

        return `
        <article class="objective-card ${completedClass} ${overdueClass}" data-id="${item.id}">
          <div>
            <div class="card-top">
              <button type="button" class="status-badge status-${item.status}" data-action="toggle-status" data-id="${item.id}" title="Clique para avançar o status">
                <span>${statusMeta.icon}</span>
                <span>${statusMeta.label}</span>
              </button>

              <div class="card-actions">
                <button type="button" class="action-icon-btn" data-action="edit" data-id="${item.id}" title="Editar objetivo">
                  ✏️
                </button>
                <button type="button" class="action-icon-btn delete-btn" data-action="delete" data-id="${item.id}" title="Excluir objetivo">
                  🗑️
                </button>
              </div>
            </div>

            <h3 class="card-title">${escapeHtml(item.title)}</h3>
            <p class="card-desc">${item.description ? escapeHtml(item.description) : '<em>Sem descrição informada.</em>'}</p>
          </div>

          <div class="card-footer">
            <div class="card-deadline">
              📅 <span>Prazo: ${deadlineMeta.formatted}</span>
            </div>
            ${deadlineMeta.badge}
          </div>
        </article>
      `;
      })
      .join('');
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ================= Ações de Modal =================
  function openNewModal() {
    modalFormTitle.textContent = 'Novo Objetivo de Estudo';
    formObjectiveId.value = '';
    formTitle.value = '';
    formDescription.value = '';
    formDeadline.value = getDatePlusDays(7);
    formStatus.value = 'not_started';
    modalForm.classList.remove('hidden');
    formTitle.focus();
  }

  function openEditModal(id) {
    const obj = objectives.find((o) => o.id === id);
    if (!obj) return;

    modalFormTitle.textContent = 'Editar Objetivo de Estudo';
    formObjectiveId.value = obj.id;
    formTitle.value = obj.title;
    formDescription.value = obj.description || '';
    formDeadline.value = obj.deadline || getDatePlusDays(7);
    formStatus.value = obj.status;
    modalForm.classList.remove('hidden');
    formTitle.focus();
  }

  function closeModalForm() {
    modalForm.classList.add('hidden');
  }

  // Salvar (Criar ou Editar)
  objectiveForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = formTitle.value.trim();
    const description = formDescription.value.trim();
    const deadline = formDeadline.value;
    const status = formStatus.value;
    const id = formObjectiveId.value;

    if (!title || !deadline) {
      alert('Por favor, preencha o título e o prazo de conclusão.');
      return;
    }

    if (id) {
      // Edição
      const index = objectives.findIndex((o) => o.id === id);
      if (index !== -1) {
        objectives[index] = {
          ...objectives[index],
          title,
          description,
          deadline,
          status,
          updatedAt: new Date().toISOString(),
        };
        showToast('Objetivo atualizado com sucesso!');
      }
    } else {
      // Cadastro de novo objetivo
      const newObj = {
        id: 'obj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        title,
        description,
        deadline,
        status,
        createdAt: new Date().toISOString(),
      };
      objectives.unshift(newObj);
      showToast('Novo objetivo de estudo cadastrado!');
    }

    saveObjectivesToStorage(objectives);
    closeModalForm();
    renderObjectives();
  });

  // Alternar Status rápido
  function toggleStatus(id) {
    const obj = objectives.find((o) => o.id === id);
    if (!obj) return;

    const sequence = {
      not_started: 'in_progress',
      in_progress: 'completed',
      completed: 'not_started',
    };

    obj.status = sequence[obj.status] || 'not_started';
    saveObjectivesToStorage(objectives);
    renderObjectives();
    showToast(`Status atualizado para: ${obj.status === 'completed' ? 'Concluído! 🎉' : obj.status === 'in_progress' ? 'Em Andamento' : 'Não Iniciado'}`);
  }

  // ================= Exclusão com Confirmação Obrigatória =================
  function requestDelete(id) {
    const obj = objectives.find((o) => o.id === id);
    if (!obj) return;

    objectivePendingDeletion = obj;
    deleteTargetTitle.textContent = `"${obj.title}"`;
    modalDelete.classList.remove('hidden');
  }

  function closeDeleteModal() {
    modalDelete.classList.add('hidden');
    objectivePendingDeletion = null;
  }

  btnConfirmDelete.addEventListener('click', () => {
    if (!objectivePendingDeletion) return;
    const deletedTitle = objectivePendingDeletion.title;
    objectives = objectives.filter((o) => o.id !== objectivePendingDeletion.id);
    saveObjectivesToStorage(objectives);
    closeDeleteModal();
    renderObjectives();
    showToast(`Objetivo "${deletedTitle}" foi excluído.`);
  });

  btnCancelDelete.addEventListener('click', closeDeleteModal);

  // ================= Event Delegation na Lista =================
  objectivesGrid.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;
    const id = target.dataset.id;

    if (action === 'toggle-status') {
      toggleStatus(id);
    } else if (action === 'edit') {
      openEditModal(id);
    } else if (action === 'delete') {
      requestDelete(id);
    }
  });

  // ================= Filtros e Busca =================
  function resetFilters() {
    searchQuery = '';
    currentFilter = 'all';
    inputSearch.value = '';
    btnClearSearch.classList.add('hidden');
    selectStatusFilter.value = 'all';
    renderObjectives();
  }

  inputSearch.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    btnClearSearch.classList.toggle('hidden', searchQuery.trim() === '');
    renderObjectives();
  });

  btnClearSearch.addEventListener('click', () => {
    inputSearch.value = '';
    searchQuery = '';
    btnClearSearch.classList.add('hidden');
    renderObjectives();
    inputSearch.focus();
  });

  selectStatusFilter.addEventListener('change', (e) => {
    currentFilter = e.target.value;
    renderObjectives();
  });

  selectSort.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderObjectives();
  });

  btnResetFilters.addEventListener('click', resetFilters);

  statCards.forEach((card) => {
    card.addEventListener('click', () => {
      currentFilter = card.dataset.filter;
      selectStatusFilter.value = currentFilter;
      renderObjectives();
    });
  });

  // Botões de carregar exemplos
  btnLoadSamples.addEventListener('click', () => {
    objectives = [...INITIAL_SAMPLES];
    saveObjectivesToStorage(objectives);
    renderObjectives();
    showToast('Exemplos de objetivos recarregados!');
  });

  // Eventos de Abertura/Fechamento de Modais
  btnOpenNewModal.addEventListener('click', openNewModal);
  btnCloseForm.addEventListener('click', closeModalForm);
  btnCancelForm.addEventListener('click', closeModalForm);

  // Fechar modais ao clicar no fundo escuro
  window.addEventListener('click', (e) => {
    if (e.target === modalForm) closeModalForm();
    if (e.target === modalDelete) closeDeleteModal();
  });

  // Fechar com tecla ESC
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModalForm();
      closeDeleteModal();
    }
  });

  // ================= Inicialização =================
  objectives = loadObjectivesFromStorage();
  renderObjectives();
})();
