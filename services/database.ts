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
        status TEXT DEFAULT 'pending',
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
      const tasks = await database.getAllAsync<Task>('SELECT * FROM tasks ORDER BY created_at DESC');
      console.log('Retrieved tasks:', JSON.stringify(tasks, null, 2));
      return tasks;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  },

  async addTask(name: string, category: string, deadline?: string): Promise<boolean> {
    try {
      const database = await db;
      console.log('Adding task:', {
        name,
        category,
        deadline: deadline || 'none'
      });
      await database.runAsync(
        'INSERT INTO tasks (name, category, deadline) VALUES (?, ?, ?)',
        [name.trim(), category.trim(), deadline?.trim() || null]
      );
      console.log('Task added successfully');
      return true;
    } catch (error) {
      console.error('Add task error:', error);
      return false;
    }
  },

  async toggleTask(id: number): Promise<boolean> {
    try {
      const database = await db;
      await database.runAsync(
        `UPDATE tasks 
         SET completed = NOT completed,
             status = CASE WHEN completed THEN 'completed' ELSE 'pending' END 
         WHERE id = ?`,
        [id]
      );
      return true;
    } catch (error) {
      console.error('Toggle task error:', error);
      return false;
    }
  },

  async deleteTask(id: number): Promise<boolean> {
    try {
      const database = await db;
      await database.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('Delete task error:', error);
      return false;
    }
  }
};