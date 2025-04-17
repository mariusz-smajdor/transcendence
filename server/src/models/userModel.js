const Password = require('../services/passwordService')
const {
	validateUserCredentials,
} = require('../services/userAuthenticationServices')

class User {
	constructor(username, password, email) {
		this.username = username
		this.password = password
		this.email = email
	}

	async register(db) {
		const isValid = validateUserCredentials(
			this.username,
			this.password,
			this.email
		)

		if (!isValid.success) {
			return { success: false, message: isValid.message, code: 500 }
		}

		try {
			const hashedPassword = await Password.hashPassword(this.password)

			db.prepare(
				`INSERT INTO users (username, password, email) VALUES (?, ?, ?)`
			).run(this.username, hashedPassword, this.email)

			return {
				success: true,
				message: 'User registered successfully',
				code: 200,
			}
		} catch (err) {
			if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
				if (err.message.includes('username')) {
					return {
						success: false,
						message: 'Username already exists',
						code: 400,
					}
				}
				if (err.message.includes('email')) {
					return {
						success: false,
						message: 'Email already exists',
						code: 400,
					}
				}
				return {
					success: false,
					message: 'User already exists',
					code: 400,
				}
			} else {
				return { success: false, message: err.message, code: 500 }
			}
		}
	}

	async login(db) {
		try {
			const user = db
				.prepare(`SELECT * FROM users WHERE username = ?`)
				.get(this.username)

			if (!user) {
				return { success: false, message: 'User not found', code: 404 }
			} else {
				const isPasswordValid = await Password.comparePassword(
					this.password,
					user.password
				)

				if (!isPasswordValid) {
					return {
						success: false,
						message: 'Invalid password',
						code: 401,
					}
				}

				return {
					success: true,
					message: 'Login successful',
					user: {
						id: user.id,
						username: user.username,
						email: user.email,
					},
					code: 200,
				}
			}
		} catch (err) {
			return {
				success: false,
				message: 'Internal server error',
				code: 500,
			}
		}
	}
}

module.exports = User
