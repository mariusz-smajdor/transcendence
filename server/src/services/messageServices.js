class MessageServices {
  constructor(db) {
    this.db = db;
  }

  async getMessagesBetweenUsers(senderId, receiverId) {
    const stmt = this.db.prepare(
      'SELECT * FROM messages WHERE (sender = ? AND receiver = ?) OR (sender = ? AND receiver = ?) ORDER BY id ASC',
    );
    return stmt.all(senderId, receiverId, receiverId, senderId);
  }
}

export default MessageServices;
