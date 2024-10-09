# cloudflare-workers-remix

## Static Assets を使って Cloudflare Workers で Remix を動かす

- wrangler.toml

公式のテンプレートを使うと`main = "./build/worker/index.js"`という記述になっています。これは一度 vite でビルドし、さらに wrangler で[[path]].ts をビルドして生成するものです。そのプロセスが無駄なので、ビルドは vite 側のみで済むようにしています。

https://github.com/cloudflare/workers-sdk/blob/main/packages/create-cloudflare/templates-experimental/remix/templates/wrangler.toml

```toml
#:schema node_modules/wrangler/config-schema.json
name = "cloudflare-workers-remix"
compatibility_date = "2024-09-25"
main = "./functions/[[path]].ts"
assets = { directory = "./build/client" }

[observability]
enabled = true
```

- functions/[[path]].ts

ファイル名は wrangler.toml の main に指定したファイル名と一致させれば、この名前である必要はありません。
公式テンプレートだと@remix-run/cloudflare-pages を使っており、これをさらにビルドする方式になっているので、@remix-run/cloudflare の方を使用して、`./functions/[[path]].ts`を wrangler から直接呼び出せるようにしています。

```ts
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
```

- package.json

build を二回実行していたものを一回に変更しました。

```json
  "scripts": {
    "build": "remix vite:build",
    "deploy": "pnpm run build && wrangler deploy",
    "dev": "remix vite:dev",
    "start": "wrangler dev",
  },
```
