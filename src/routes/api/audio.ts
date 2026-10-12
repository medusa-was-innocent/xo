import { createFileRoute } from "@tanstack/react-router";

function allowed(host: string) {
  return (
    host.endsWith("itunes.apple.com") ||
    host.endsWith("mzstatic.com") ||
    host.endsWith("apple.com")
  );
}

export const Route = createFileRoute("/api/audio")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const src = new URL(request.url).searchParams.get("src");
        if (!src) return new Response("missing src", { status: 400 });
        let url: URL;
        try {
          url = new URL(src);
        } catch {
          return new Response("bad src", { status: 400 });
        }
        if (url.protocol !== "https:" || !allowed(url.hostname)) {
          return new Response("forbidden", { status: 403 });
        }

        const upstream = await fetch(url.toString(), {
          headers: { Accept: "audio/mpeg,audio/*,*/*" },
          redirect: "follow",
        });
        if (!upstream.ok) return new Response("upstream", { status: 502 });

        const buf = new Uint8Array(await upstream.arrayBuffer());
        const type = upstream.headers.get("content-type") || "audio/mpeg";
        const range = request.headers.get("range");
        const match = range?.match(/bytes=(\d+)-(\d*)/);

        if (match) {
          const start = Number(match[1]);
          const end = match[2] ? Number(match[2]) : buf.length - 1;
          if (start >= buf.length || end >= buf.length || start > end) {
            return new Response(null, {
              status: 416,
              headers: { "Content-Range": `bytes */${buf.length}` },
            });
          }
          const slice = buf.subarray(start, end + 1);
          return new Response(slice, {
            status: 206,
            headers: {
              "Content-Type": type,
              "Content-Length": String(slice.byteLength),
              "Content-Range": `bytes ${start}-${end}/${buf.length}`,
              "Accept-Ranges": "bytes",
              "Cache-Control": "public, max-age=86400",
            },
          });
        }

        return new Response(buf, {
          status: 200,
          headers: {
            "Content-Type": type,
            "Content-Length": String(buf.byteLength),
            "Accept-Ranges": "bytes",
            "Cache-Control": "public, max-age=86400",
          },
        });
      },
    },
  },
});
