class UserService {
  constructor(db) {
    this.db = db;
  }

  findOne = ({ id, username, email }) => {
    let user = null;

    if (id) {
      user = this.db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    } else if (username) {
      user = this.db
        .prepare('SELECT * FROM users WHERE username = ?')
        .get(username);
    } else if (email) {
      user = this.db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    }
    return user;
  };

  findAll = () => {
    const users = this.db
      .prepare('SELECT id, username, email FROM users')
      .all();
    return users;
  };

  updateOne = ({ id }, updates) => {
    if (!id) {
      throw new Error('User ID is required to update a user.');
    }

    const fields = [];
    const values = [];

    if (updates.username) {
      fields.push('username = ?');
      values.push(updates.username);
    }

    if (updates.email) {
      fields.push('email = ?');
      values.push(updates.email);
    }

    if (updates.password) {
      fields.push('password = ?');
      values.push(updates.password);
    }

    if (fields.length === 0) {
      throw new Error('No fields provided to update.');
    }

    values.push(id);

    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    const stmt = this.db.prepare(query);
    const info = stmt.run(...values);

    return info.changes > 0;
  };

  deleteOne = ({ id }) => {
    if (!id) {
      throw new Error('User id is required to delete the user');
    }

    const query = `DELETE FROM users WHERE id = ?`;
    const stmt = this.db.prepare(query);
    const info = stmt.run(id);

    return !!info.changes;
  };
}

export default UserService;
