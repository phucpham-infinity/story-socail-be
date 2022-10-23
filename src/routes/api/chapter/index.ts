import { NowRequestHandler } from "fastify-now";
import { supabase } from "@/app";

export const GET: NowRequestHandler = async function (req, reply) {
  const { data, error } = await supabase.from("chapter").select("*");
  if (error) reply.code(400).send({ error });
  return reply.code(200).send({ data });
};

GET.opts = {
  onRequest: [],
  schema: {},
};
