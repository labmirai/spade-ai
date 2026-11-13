import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "transfer-encoding",
  "content-encoding",
  "content-length",
  "host",
]);

function apiOrigin(): string {
  return (process.env.API_INTERNAL_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
}

async function proxy(req: NextRequest, path: string[]): Promise<NextResponse> {
  if (path.some((segment) => segment === ".." || segment === "." || segment === "")) {
    return NextResponse.json({ detail: "Invalid path" }, { status: 400 });
  }

  const target = `${apiOrigin()}/${path.join("/")}${req.nextUrl.search}`;
  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) headers.set(key, value);
  });

  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: "manual",
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.arrayBuffer();
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, init);
  } catch {
    return NextResponse.json({ detail: "API is unavailable" }, { status: 502 });
  }

  const out = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) out.set(key, value);
  });
  out.set("Cache-Control", "private, no-store");
  return new NextResponse(upstream.body, { status: upstream.status, headers: out });
}

type Context = { params: Promise<{ path: string[] }> };

async function handle(req: NextRequest, context: Context) {
  const { path } = await context.params;
  return proxy(req, path);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
