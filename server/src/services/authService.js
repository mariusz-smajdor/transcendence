import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export const hashPassword = async (password) => {
	return await bcrypt.hash(password, SALT_ROUNDS);
};

export const verifyPassword = async (password, hashedPassword) => {
	return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = async (reply, payload) => {
	const token = await reply.jwtSign(payload);

	reply.setCookie("access_token", token, {
		httpOnly: true,
		secure: false,
		sameSite: "lax",
		maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		path: "/",
	});

	return token;
};
