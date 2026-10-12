import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { Hud } from "@/components/hud/Hud";
import { preloadAssets } from "@/lib/loader";

const Universe = lazy(() => import("@/components/universe/Universe"));

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  useEffect(() => {
    void import("@/components/universe/Universe");
    void preloadAssets();
  }, []);

  return (
    <main className="app-shell">
      {ready ? (
        <Suspense fallback={<div className="h-full w-full bg-bg" />}>
          <Universe />
        </Suspense>
      ) : (
        <div className="h-full w-full bg-bg" />
      )}
      <Hud />
    </main>
  );
}
