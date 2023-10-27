import { announce } from "../box/announcement";
import { Sound, Voice } from "../box/audio";

export async function GET() {
  await announce({
    sound: Sound.NOICE,
    message: "Do you know what is today?",
    voice: Voice.en_us_006,
    light: false,
  });

  await announce({
    sound: Sound.WEDNESDAY,
    light: false,
  });

  return new Response(
    JSON.stringify({
      message: "It's Wednesday my dudes",
    })
  );
}
