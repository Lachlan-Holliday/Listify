export interface Task {
  id: number;
  name: string;
  category: string;
  recurring: 'none' | 'daily' | 'weekly' | 'monthly';
  completed: boolean;
  deadline?: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
} 