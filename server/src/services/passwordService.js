const { scrypt, randomBytes, timingSafeEqual } = require('crypto')
const { promisify } = require('util')

class Password {
	static async hashPassword(password) {
		return new Promise((resolve, reject) => {
			const salt = randomBytes(16).toString('hex')

			scrypt(password, salt, 64, (err, derivedKey) => {
				if (err) reject(err)
				resolve(salt + ':' + derivedKey.toString('hex'))
			})
		})
	}

	static async comparePassword(password, hash) {
		return new Promise((resolve, reject) => {
			const [salt, key] = hash.split(':')
			const keyBuffer = Buffer.from(key, 'hex') // Convert stored key to a buffer

			scrypt(password, salt, 64, (err, derivedKey) => {
				if (err) reject(err)

				// Use timingSafeEqual to securely compare the keys
				const derivedKeyBuffer = Buffer.from(derivedKey)
				if (
					keyBuffer.length === derivedKeyBuffer.length &&
					timingSafeEqual(keyBuffer, derivedKeyBuffer)
				) {
					resolve(true)
				} else {
					resolve(false)
				}
			})
		})
	}
}

module.exports = Password
