import * as SQLite from 'expo-sqlite';
import { Task } from '../types/database';

const db = SQLite.openDatabaseSync('listify.db');

export const initDatabase = async () => {
  try {
    // Create tasks table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        deadline TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      PRAGMA journal_mode = WAL;
    `);
    console.log('Database initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

export const DatabaseService = {
  async getTasks(): Promise<Task[]> {
    try {
      const result = await db.getAllAsync<Task>('SELECT * FROM tasks ORDER BY created_at DESC');
      console.log('Tasks fetched:', result);
      return result;
    } catch (error) {
      console.error('Get tasks error:', error);
      return [];
    }
  },

  async addTask(name: string, deadline?: string): Promise<boolean> {
    try {
      const result = await db.runAsync(
        'INSERT INTO tasks (name, deadline) VALUES (?, ?)',
        [name.trim(), deadline?.trim() || null]
      );
      console.log('Task added:', result);
      return true;
    } catch (error) {
      console.error('Add task error:', error);
      return false;
    }
  },

  async toggleTask(id: number): Promise<boolean> {
    try {
      await db.runAsync(
        `UPDATE tasks SET status = CASE 
          WHEN status = 'pending' THEN 'completed' 
          ELSE 'pending' END 
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
      await db.execAsync(`DELETE FROM tasks WHERE id = ${id}`);
      return true;
    } catch (error) {
      console.error('Delete task error:', error);
      return false;
    }
  }
};