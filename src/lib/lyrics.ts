import type { BodyId } from "./catalog";

export const BOOT_LYRICS = [
  { line: "I can't feel my face when I'm with you", song: "Can't Feel My Face" },
  { line: "Tell them that it's after hours", song: "After Hours" },
  { line: "I was never there", song: "I Was Never There" },
  { line: "Save your tears for another day", song: "Save Your Tears" },
  { line: "Look what you've done", song: "Starboy" },
  { line: "You've been in the dark for way too long", song: "Dawn FM" },
  { line: "I just want to tell you I come from a city", song: "House of Balloons / Glass Table Girls" },
  { line: "In your eyes I see there's something burning inside you", song: "In Your Eyes" },
  { line: "Heaven or Las Vegas", song: "Heaven or Las Vegas" },
  { line: "I can't wait to get there", song: "I Can't Wait To Get There" },
  { line: "I'm the drone, I'm the drone", song: "The Hills" },
  { line: "I got you, I got you", song: "Wicked Games" },
] as const;

export const ERA_LYRICS: Record<BodyId, { line: string; song: string }> = {
  sun: { line: "XO, until we overdose", song: "XO / The Host" },
  mdm: { line: "I was never there", song: "I Was Never There" },
  idol: { line: "I'm popular", song: "Popular" },
  hut: { line: "I can't wait to get there", song: "I Can't Wait To Get There" },
  "after-hours": { line: "Tell them that it's after hours", song: "After Hours" },
  bbtm: { line: "I can't feel my face when I'm with you", song: "Can't Feel My Face" },
  starboy: { line: "Look what you've done", song: "Starboy" },
  "kiss-land": { line: "This is the moment you've waited for", song: "Kiss Land" },
  "dawn-fm": { line: "You've been in the dark for way too long", song: "Dawn FM" },
  trilogy: { line: "I just want to tell you I come from a city", song: "House of Balloons / Glass Table Girls" },
};
