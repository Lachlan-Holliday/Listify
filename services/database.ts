import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('listify.db');

export const initDatabase = async () => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category_id INTEGER,
      status TEXT CHECK(status IN ('pending', 'completed')) DEFAULT 'pending',
      deadline TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories (id)
    );
  `);
};

interface SQLiteResult {
  insertId: number;
  rowsAffected: number;
  rows: any[];
}

export const DatabaseService = {
  async createCategory(name: string, icon: string) {
    const result = (await db.execAsync(
      `INSERT INTO categories (name, icon) VALUES ('${name}', '${icon}')`
    ) as unknown) as SQLiteResult[];
    return result[0].insertId;
  },

  async createTask(name: string, categoryId: number, deadline?: string) {
    const result = (await db.execAsync(
      `INSERT INTO tasks (name, category_id, deadline) VALUES ('${name}', ${categoryId}, ${deadline ? `'${deadline}'` : 'NULL'})`
    ) as unknown) as SQLiteResult[];
    return result[0].insertId;
  },

  async getTasks() {
    const result = (await db.execAsync(
      `SELECT t.*, c.name as category_name, c.icon as category_icon 
       FROM tasks t 
       LEFT JOIN categories c ON t.category_id = c.id 
       ORDER BY t.created_at DESC`
    ) as unknown) as SQLiteResult[];
    return result[0].rows;
  },

  async updateTaskStatus(id: number, status: 'pending' | 'completed') {
    const result = (await db.execAsync(
      `UPDATE tasks SET status = '${status}' WHERE id = ${id}`
    ) as unknown) as SQLiteResult[];
    return result[0].rowsAffected > 0;
  }
};