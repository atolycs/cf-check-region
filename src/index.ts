/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface ReturnData {
  client_ip: string;
  locale: string;
  useragent: string;
  country?: string;
  status?: string;
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    // @ts-ignore
    const { DEV } = env;
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    console.log(DEV);
    const privacy_mode = searchParams.get("privacy") || "false";
    let clientIP = "";

    console.log(request);
    if (request.url.includes("localhost")) {
      clientIP = "<local test server>";
    } else if (!DEV) {
      if (privacy_mode != "true") {
        const ip_route =
          request.headers.get("Cf-Connecting-Ip")?.split(".") ||
          request.headers.get("x-forwarded-for")?.split(".");
        // @ts-ignore
        clientIP = ip_route[0] + ".XXX.XXX.XXX";
      } else {
        // @ts-ignore
        clientIP =
          request.headers.get("X-Forwarded-For") ||
          request.headers.get("Cf-Connecting-Ip");
      }
    }

    let status = "";
    const locale = request.headers.get("Accept-Language");
    const useragent = request.headers.get("User-Agent");

    if (clientIP == null) {
      status = "ng";
    } else {
      status = "ok";
    }

    const data: ReturnData = {
      client_ip: clientIP || "Unknown",
      locale: locale || "Unknown",
      useragent: useragent || "Unknown",
      country: request.cf?.country,
      status,
    };

    return Response.json(data);
  },
} satisfies ExportedHandler<Env>;
