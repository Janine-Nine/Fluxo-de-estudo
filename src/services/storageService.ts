import { ObjectiveFormData, StudyObjective } from '../types/objective';

const STORAGE_KEY = 'studyflow_objectives_v1';

// Exemplos iniciais para estudantes iniciantes verem o app funcionando de imediato
const INITIAL_SAMPLE_OBJECTIVES: StudyObjective[] = [
  {
    id: 'sample-1',
    title: 'Fundamentos de Lógica e Algoritmos',
    description: 'Compreender estruturas condicionais (if/else), laços de repetição (for/while) e resolução de problemas básicos.',
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'in_progress',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sample-2',
    title: 'Criar meu primeiro repositório no GitHub',
    description: 'Aprender comandos básicos do Git: git init, add, commit, push e documentar o projeto com um README.md.',
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'not_started',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sample-3',
    title: 'Configurar ambiente de desenvolvimento (VS Code & Node)',
    description: 'Instalar editor de código, extensões recomendadas de produtividade e terminal integrado.',
    deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'completed',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const storageService = {
  /**
   * Recupera todos os objetivos salvos no localStorage.
   * Se for a primeira visita, inicializa com exemplos acolhedores.
   */
  getObjectives(): StudyObjective[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Inicializa com dados amigáveis de exemplo para novos estudantes
        this.saveObjectives(INITIAL_SAMPLE_OBJECTIVES);
        return INITIAL_SAMPLE_OBJECTIVES;
      }
      return JSON.parse(stored) as StudyObjective[];
    } catch (error) {
      console.error('Erro ao ler do localStorage:', error);
      return [];
    }
  },

  /**
   * Salva a lista completa de objetivos no localStorage.
   */
  saveObjectives(objectives: StudyObjective[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(objectives));
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  },

  /**
   * Cadastra um novo objetivo de estudo.
   */
  addObjective(data: ObjectiveFormData): StudyObjective {
    const current = this.getObjectives();
    const newObjective: StudyObjective = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `obj_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      title: data.title.trim(),
      description: data.description.trim(),
      deadline: data.deadline,
      status: data.status,
      createdAt: new Date().toISOString(),
    };

    const updated = [newObjective, ...current];
    this.saveObjectives(updated);
    return newObjective;
  },

  /**
   * Edita um objetivo existente.
   */
  updateObjective(id: string, data: Partial<ObjectiveFormData>): StudyObjective | null {
    const current = this.getObjectives();
    const index = current.findIndex((item) => item.id === id);

    if (index === -1) return null;

    const updatedItem: StudyObjective = {
      ...current[index],
      ...data,
      title: data.title !== undefined ? data.title.trim() : current[index].title,
      description: data.description !== undefined ? data.description.trim() : current[index].description,
      updatedAt: new Date().toISOString(),
    };

    current[index] = updatedItem;
    this.saveObjectives(current);
    return updatedItem;
  },

  /**
   * Alterna rapidamente o status de um objetivo.
   */
  toggleStatus(id: string): StudyObjective | null {
    const current = this.getObjectives();
    const item = current.find((i) => i.id === id);
    if (!item) return null;

    const nextStatus: Record<string, StudyObjective['status']> = {
      not_started: 'in_progress',
      in_progress: 'completed',
      completed: 'not_started',
    };

    return this.updateObjective(id, { status: nextStatus[item.status] });
  },

  /**
   * Exclui um objetivo do armazenamento.
   */
  deleteObjective(id: string): boolean {
    const current = this.getObjectives();
    const filtered = current.filter((item) => item.id !== id);
    if (filtered.length === current.length) {
      return false;
    }
    this.saveObjectives(filtered);
    return true;
  },

  /**
   * Restaura os exemplos iniciais.
   */
  resetWithSamples(): StudyObjective[] {
    this.saveObjectives(INITIAL_SAMPLE_OBJECTIVES);
    return INITIAL_SAMPLE_OBJECTIVES;
  },

  /**
   * Remove todos os objetivos (esvazia).
   */
  clearAll(): void {
    this.saveObjectives([]);
  },
};
