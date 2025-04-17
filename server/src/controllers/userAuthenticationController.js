const User = require('../models/userModel')

const registrationHandler = async (req, res) => {
	const { username, password, confirmPassword, email } = req.body

	if (password !== confirmPassword) {
		return res.status(400).send({
			success: false,
			message: 'Passwords do not match',
		})
	}

	const user = new User(username, password, email)

	const { success, message, code } = await user.register(
		req.context.config.db
	)

	return res.status(code).send({ success, message })
}

const loginHandler = async (req, res) => {
	const { username, password } = req.body
	const userData = new User(username, password)

	const { success, message, user, code } = await userData.login(
		req.context.config.db
	)
	if (success) {
		const payload = {
			userId: user.id,
			username: user.username,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
		}
		const token = req.jwt.sign(payload, { expiresIn: '1h' })
		res.setCookie('access_token', token, {
			path: '/',
			httpOnly: true,
			secure: true,
		})
		return res.status(code).send({ success, message, user })
	} else {
		return res.status(code).send({ success, message })
	}
}

module.exports = {
	registrationHandler,
	loginHandler,
}
