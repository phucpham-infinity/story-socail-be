import { NowRequestHandler } from "fastify-now";
import { supabase } from "@/app";

export const GET: NowRequestHandler = async function (req, reply) {
  const { storyId } = req.params as any;

  const { data: storyData, error: storyError } = await supabase
    .from("story")
    .select("url")
    .eq("id", storyId);
  if (storyError) reply.code(400).send({ error: storyError });

  const storyUrl = storyData?.[0]?.url;

  if (!storyUrl) reply.code(400).send({ error: "Not found" });

  const { data, error } = await supabase
    .from("chapter")
    .select("*")
    .eq("story_id", storyId);
  if (error) reply.code(400).send({ error });
  return reply.code(200).send({ data });
};

GET.opts = {
  onRequest: [],
  schema: {},
};
