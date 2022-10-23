import "module-alias/register";

import { join } from "path";
import AutoLoad, { AutoloadPluginOptions } from "@fastify/autoload";
import now from "fastify-now";
import { FastifyPluginAsync } from "fastify";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://utopxtvdnwefotehycdm.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey!);

export type AppOptions = {} & Partial<AutoloadPluginOptions>;

const options: AppOptions = {};

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts
): Promise<void> => {
  void fastify.register(AutoLoad, {
    dir: join(__dirname, "plugins"),
    options: opts,
  });

  void fastify.register(now, {
    routesFolder: join(__dirname, "routes"),
  });
};

export default app;
export { app, options, supabase };
