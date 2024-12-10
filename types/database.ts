export interface Task {
  id: number;
  name: string;
  category: string;
  status: 'pending' | 'completed';
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