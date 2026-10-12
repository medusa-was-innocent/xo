import { createFileRoute } from "@tanstack/react-router";
import { bodyById } from "@/lib/catalog";
import { catalogForPrompt, collapseHits, searchLyrics, type LyricHit } from "@/lib/lyric-rag";
import { env } from "@/lib/env.server";

export const Route = createFileRoute("/api/lyrics")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let q = "";
        try {
          const body = (await request.json()) as { q?: string };
          q = typeof body.q === "string" ? body.q.slice(0, 240) : "";
        } catch {
          return Response.json({ hits: [] as LyricHit[] });
        }
        const local = searchLyrics(q, 6);
        const key = env("XAI_API_KEY");
        if (!key || q.trim().length < 4) return Response.json({ hits: local, source: "index" });

        try {
          const res = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${key}`,
            },
            body: JSON.stringify({
              model: "grok-4.5",
              temperature: 0,
              max_tokens: 420,
              messages: [
                {
                  role: "system",
                  content:
                    "You retrieve The Weeknd songs from half-remembered lyrics. Use only this catalog. Reply JSON only: {\"hits\":[{\"title\":\"\",\"bodyId\":\"\",\"line\":\"\",\"confidence\":0-1}]} max 5. bodyId must be one of sun,mdm,idol,hut,after-hours,bbtm,starboy,kiss-land,dawn-fm,trilogy.",
                },
                {
                  role: "user",
                  content: `CATALOG:\n${catalogForPrompt()}\n\nREMEMBERED LYRICS:\n${q}`,
                },
              ],
            }),
          });
          if (!res.ok) return Response.json({ hits: local, source: "index" });
          const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
          const raw = data.choices?.[0]?.message?.content ?? "";
          const json = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
          const parsed = JSON.parse(json) as {
            hits?: { title?: string; bodyId?: string; line?: string; confidence?: number }[];
          };
          const ai = (parsed.hits ?? [])
            .filter((h) => h.title && h.bodyId)
            .map((h) => {
              const body = bodyById(h.bodyId as LyricHit["bodyId"]);
              const track = body?.tracks.find(
                (t) => t.title.toLowerCase() === String(h.title).toLowerCase(),
              );
              return {
                bodyId: (body?.id ?? h.bodyId) as LyricHit["bodyId"],
                title: track?.title ?? (h.title as string),
                album: body?.name ?? "",
                planet: body?.planet ?? "",
                line: h.line || "",
                score: 10 + (h.confidence ?? 0.5) * 4,
              };
            })
            .filter((h) => h.album);
          const merged = [...ai];
          for (const hit of local) {
            if (!merged.some((m) => m.title === hit.title && m.bodyId === hit.bodyId)) merged.push(hit);
          }
          return Response.json({ hits: collapseHits(merged, 5), source: "rag" });
        } catch {
          return Response.json({ hits: local, source: "index" });
        }
      },
    },
  },
});
