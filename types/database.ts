export interface Task {
  id: number;
  name: string;
  category_id: number;
  status: 'pending' | 'completed';
  deadline?: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
} 