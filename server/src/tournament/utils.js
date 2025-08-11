export function extractId(fastify, token)
{
	if (!token)
		return null;
	try{
		const decoded = fastify.jwt.verify(token);
		console.log(decoded.userId)
		return decoded.userId;
	}
	catch (err){
		console.log(err);
		return null;
	}
}


export function getAvatar(fastify, id){
	if (id === null)
		return null;
	const response = fastify.db
        .prepare(`SELECT avatar FROM users WHERE id = ?`)
        .get(id);
	return response.avatar;
}