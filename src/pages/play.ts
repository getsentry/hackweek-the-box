import type { APIContext, APIRoute } from "astro";
import { announce } from "../box/announcement";
import { Voice } from "../box/audio";
import type { AnnouncementConfig } from "../box/types";
import { normalizeString } from "../box/utils";

export async function POST({ params, request }: APIContext<unknown>) {
  const body = await request.json();
  const config = toAnnouncementConfig(body);
  await announce(config);

  return new Response(JSON.stringify(config));
}

const toAnnouncementConfig = (body: unknown): AnnouncementConfig => {
  if (!body || typeof body !== "object") return {};
  const message = normalizeString(body["message"]);

  const voice = Voice[body["voice"]] ?? Voice.en_us_001;
  const light = Boolean(body["light"]);
  const sound = body["sound"];

  return {
    sound,
    message,
    voice,
    light,
  };
};
