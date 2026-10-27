export type ObjectiveStatus = 'not_started' | 'in_progress' | 'completed';

export interface StudyObjective {
  id: string;
  title: string;
  description: string;
  deadline: string; // formato YYYY-MM-DD
  status: ObjectiveStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface ObjectiveFormData {
  title: string;
  description: string;
  deadline: string;
  status: ObjectiveStatus;
}

export type StatusFilter = 'all' | ObjectiveStatus;
export type SortOption = 'deadline_asc' | 'deadline_desc' | 'created_desc' | 'title_asc';
