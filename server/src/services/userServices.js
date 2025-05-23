class UserServices {
  constructor(db) {
    this.db = db;
  }

  async createUser(userData) {
    const stmt = this.db.prepare(
      'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
    );
    const info = stmt.run(userData.username, userData.password, userData.email);
    return { id: info.lastInsertRowid, ...userData };
  }

  async getAllUsers() {
    const stmt = this.db.prepare('SELECT * FROM users');
    return stmt.all();
  }

  async getUserById(id) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  }

  async updateUser(id, userData) {
    const stmt = this.db.prepare(
      'UPDATE users SET username = ?, email = ? WHERE id = ?',
    );
    const info = stmt.run(userData.username, userData.email, id);
    if (info.changes === 0) return null;
    return { id, ...userData };
  }

  async deleteUser(id) {
    const stmt = this.db.prepare('DELETE FROM users WHERE id = ?');
    const info = stmt.run(id);
    return info.changes === 0 ? null : { id };
  }
}

export default UserServices;
