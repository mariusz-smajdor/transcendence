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
}

export default UserService;
