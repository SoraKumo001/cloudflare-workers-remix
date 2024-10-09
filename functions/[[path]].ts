import {
  AppLoadContext,
  createRequestHandler,
  ServerBuild,
} from "@remix-run/cloudflare";
import * as build from "../build/server";

const handler = createRequestHandler(build as ServerBuild);

const fetch = async (
  request: Request,
  env: AppLoadContext,
  ctx: ExecutionContext
) => {
  return handler(request, {
    cloudflare: {
      env,
      ctx: {
        waitUntil: ctx.waitUntil ?? (() => {}),
        passThroughOnException: ctx.passThroughOnException ?? (() => {}),
      },
      cf: request.cf!,
      caches,
    } as never,
  });
};

export default {
  fetch,
};
