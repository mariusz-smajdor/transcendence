export const getHealth = async (request, reply) => {
  return reply.send({ status: "OK" });
};
