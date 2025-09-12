import { db } from '../database/init.js'

export const createUser = async (
  username,
  hashedPassword,
  avatarUrl,
  email = null
) => {
  return new Promise((resolve, reject) => {
    const sql =
      'INSERT INTO users (username, password, avatar_url, email) VALUES (?, ?, ?, ?)'
    const params = [username, hashedPassword, avatarUrl || null, email]

    db.run(sql, params, function (err) {
      if (err) {
        reject(err)
      } else {
        resolve({
          user_id: this.lastID,
          username: username,
          avatar_url: avatarUrl,
          email: email,
        })
      }
    })
  })
}

export const findUserByUsername = async (username) => {
  return new Promise((resolve, reject) => {
    const sql =
      'SELECT user_id, username, password, avatar_url, email FROM users WHERE username = ?'
    const params = [username]

    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve(row)
      }
    })
  })
}

export const findUserByEmail = async (email) => {
  return new Promise((resolve, reject) => {
    const sql =
      'SELECT user_id, username, password, avatar_url, email FROM users WHERE email = ?'
    const params = [email]

    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve(row)
      }
    })
  })
}

export const findUserById = async (userId) => {
  return new Promise((resolve, reject) => {
    const sql =
      'SELECT user_id, username, password, avatar_url, email FROM users WHERE user_id = ?'
    const params = [userId]

    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve(row)
      }
    })
  })
}

export const checkUsernameExists = async (username) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT 1 FROM users WHERE username = ? LIMIT 1'
    const params = [username]

    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve(!!row)
      }
    })
  })
}
