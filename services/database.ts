import * as SQLite from 'expo-sqlite';
import { Task, Category } from '../types/database';

const db = SQLite.openDatabaseAsync('listify.db');

const DEFAULT_CATEGORIES = [
  { name: 'Work', icon: '💼', color: '#FF9B9B' },
  { name: 'Study', icon: '📚', color: '#9BB8FF' },
  { name: 'Fitness', icon: '💪', color: '#A5FF9B' },
  { name: 'Shopping', icon: '🛒', color: '#FFE59B' },
  { name: 'Personal', icon: '🎯', color: '#D89BFF' },
];

type CategoryAction = {
  type: 'DELETE' | 'ADD' | 'RESET';
  category?: Category;
  categories?: Category[]; // For reset action
};

let lastAction: CategoryAction | null = null;
let previousCategories: Category[] = [];

export const initDatabase = async () => {
  try {
    const database = await db;
    await database.execAsync(`
      DROP TABLE IF EXISTS tasks;
      
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        icon TEXT NOT NULL,
        color TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        recurring TEXT CHECK(recurring IN ('none', 'daily', 'weekly', 'monthly')) DEFAULT 'none',
        completed BOOLEAN DEFAULT FALSE,
        date TEXT,
        time TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      PRAGMA journal_mode = WAL;
    `);

    // Check if categories table is empty and populate with defaults if needed
    const statement = await database.prepareAsync('SELECT COUNT(*) as count FROM categories');
    const result = await statement.executeAsync<{ count: number }>();
    const rows = await result.getAllAsync();
    const count = rows[0].count;
    
    if (count === 0) {
      // Add default categories only if table is empty
      for (const category of DEFAULT_CATEGORIES) {
        await DatabaseService.addCategory(category.name, category.icon, category.color);
      }
    }

    console.log('Database initialized with new schema');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

export const DatabaseService = {
  async getTasks(): Promise<Task[]> {
    try {
      const database = await db;
      const statement = await database.prepareAsync(
        'SELECT * FROM tasks ORDER BY created_at DESC'
      );
      try {
        const result = await statement.executeAsync<Task>();
        const tasks = await result.getAllAsync();
        console.log('Retrieved tasks:', JSON.stringify(tasks, null, 2));
        return tasks;
      } finally {
        await statement.finalizeAsync();
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  },

  async addTask(
    name: string, 
    category: string, 
    recurring: string = 'none', 
    date?: string,
    time?: string
  ): Promise<boolean> {
    try {
      const database = await db;
      const statement = await database.prepareAsync(
        'INSERT INTO tasks (name, category, recurring, date, time) VALUES (?, ?, ?, ?, ?)'
      );
      try {
        const validRecurring = ['none', 'daily', 'weekly', 'monthly'].includes(recurring) ? recurring : 'none';
        
        console.log('Adding task:', {
          name,
          category,
          recurring: validRecurring,
          date: date || 'none',
          time: time || 'none'
        });

        await statement.executeAsync([
          name.trim(),
          category.trim(),
          validRecurring,
          date?.trim() || null,
          time?.trim() || null
        ]);
        
        console.log('Task added successfully');
        return true;
      } finally {
        await statement.finalizeAsync();
      }
    } catch (error) {
      console.error('Add task error:', error);
      return false;
    }
  },

  async toggleTask(id: number): Promise<boolean> {
    try {
      const database = await db;
      const statement = await database.prepareAsync(
        'UPDATE tasks SET completed = NOT completed WHERE id = ?'
      );
      try {
        await statement.executeAsync([id]);
        return true;
      } finally {
        await statement.finalizeAsync();
      }
    } catch (error) {
      console.error('Toggle task error:', error);
      return false;
    }
  },

  async deleteTask(id: number): Promise<boolean> {
    try {
      const database = await db;
      const statement = await database.prepareAsync(
        'DELETE FROM tasks WHERE id = ?'
      );
      try {
        await statement.executeAsync([id]);
        return true;
      } finally {
        await statement.finalizeAsync();
      }
    } catch (error) {
      console.error('Delete task error:', error);
      return false;
    }
  },

  async getCategories(): Promise<Category[]> {
    try {
      const database = await db;
      const statement = await database.prepareAsync(
        'SELECT * FROM categories ORDER BY name ASC'
      );
      try {
        const result = await statement.executeAsync<Category>();
        return await result.getAllAsync();
      } finally {
        await statement.finalizeAsync();
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  async addCategory(name: string, icon: string, color: string): Promise<boolean> {
    try {
      const database = await db;
      const statement = await database.prepareAsync(
        'INSERT INTO categories (name, icon, color) VALUES (?, ?, ?)'
      );
      await statement.executeAsync([name.trim(), icon, color]);
      
      lastAction = {
        type: 'ADD',
        category: { name, icon, color } as Category
      };
      
      return true;
    } catch (error) {
      console.error('Add category error:', error);
      return false;
    }
  },

  async deleteCategory(id: number): Promise<boolean> {
    try {
      const database = await db;
      // Store category before deletion
      const statement = await database.prepareAsync('SELECT * FROM categories WHERE id = ?');
      const result = await statement.executeAsync<Category>([id]);
      const categoryToDelete = (await result.getAllAsync())[0];
      
      const deleteStatement = await database.prepareAsync('DELETE FROM categories WHERE id = ?');
      await deleteStatement.executeAsync([id]);
      
      lastAction = {
        type: 'DELETE',
        category: categoryToDelete
      };
      
      return true;
    } catch (error) {
      console.error('Delete category error:', error);
      return false;
    }
  },

  async resetCategories(): Promise<boolean> {
    try {
      // Store current categories before reset
      previousCategories = await this.getCategories();
      
      const database = await db;
      await database.execAsync('DELETE FROM categories;');
      
      for (const category of DEFAULT_CATEGORIES) {
        await this.addCategory(category.name, category.icon, category.color);
      }
      
      lastAction = {
        type: 'RESET',
        categories: previousCategories
      };
      
      return true;
    } catch (error) {
      console.error('Reset categories error:', error);
      return false;
    }
  },

  async undoLastAction(): Promise<boolean> {
    if (!lastAction) return false;

    // Non-null assertion since we checked above
    const action = lastAction!;

    try {
      const database = await db;
      switch (action.type) {
        case 'DELETE':
          if (action.category) {
            await this.addCategory(
              action.category.name,
              action.category.icon,
              action.category.color
            );
          }
          break;

        case 'ADD':
          if (action.category) {
            const categories = await this.getCategories();
            const categoryToDelete = categories.find(c => c.name === action.category!.name);
            if (categoryToDelete) {
              await this.deleteCategory(categoryToDelete.id);
            }
          }
          break;

        case 'RESET':
          if (action.categories) {
            await database.execAsync('DELETE FROM categories;');
            for (const category of action.categories) {
              await this.addCategory(category.name, category.icon, category.color);
            }
          }
          break;
      }

      lastAction = null;
      return true;
    } catch (error) {
      console.error('Undo error:', error);
      return false;
    }
  }
};