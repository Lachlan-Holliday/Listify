import * as SQLite from 'expo-sqlite';
import { Task } from '../types/database';

const db = SQLite.openDatabaseAsync('listify.db');

export const initDatabase = async () => {
  try {
    const database = await db;
    await database.execAsync(`
      DROP TABLE IF EXISTS tasks;
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        recurring TEXT CHECK(recurring IN ('none', 'daily', 'weekly', 'monthly')) DEFAULT 'none',
        completed BOOLEAN DEFAULT FALSE,
        deadline TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      PRAGMA journal_mode = WAL;
    `);
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

  async addTask(name: string, category: string, recurring: string = 'none', deadline?: string): Promise<boolean> {
    try {
      const database = await db;
      const statement = await database.prepareAsync(
        'INSERT INTO tasks (name, category, recurring, deadline) VALUES (?, ?, ?, ?)'
      );
      try {
        // Ensure recurring is one of the allowed values
        const validRecurring = ['none', 'daily', 'weekly', 'monthly'].includes(recurring) ? recurring : 'none';
        
        console.log('Adding task:', {
          name,
          category,
          recurring: validRecurring,
          deadline: deadline || 'none'
        });

        await statement.executeAsync([
          name.trim(),
          category.trim(),
          validRecurring,
          deadline?.trim() || null
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
  }
};