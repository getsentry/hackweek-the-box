import fs from "node:fs";
import { sleep } from "../utils.js";

const API_URL = "https://tiktok-tts.weilnet.workers.dev/api/generation";

const AVAILABLE_VOICES = [
  // English US
  "en_us_001", // Female
  "en_us_006", // Male 1
  "en_us_007", // Male 2
  "en_us_009", // Male 3
  "en_us_010", // Male 4

  // English UK
  "en_uk_001", // Male 1
  "en_uk_003", // Male 2

  // English AU
  "en_au_001", // Female
  "en_au_002", // Male

  // Singing
  "en_female_ht_f08_wonderful_world",
  "en_female_ht_f08_glorious",
  "en_male_m03_lobby",

  // Characters
  "en_us_rocket",
];

async function callAPI(text: string, voice: string) {
  const body = JSON.stringify({
    text,
    voice,
  });

  const headers = {
    "content-type": "application/json",
  };

  const req = await fetch(API_URL, {
    method: "POST",
    body,
    headers,
  });

  if (req.status !== 200) {
    const error = { status: req.status, statusText: req.statusText };
    throw error;
  }

  const json = await req.json();
  // @ts-ignore
  const mp3 = json.data;

  return mp3;
}

function writeFile(
  dirPath: string,
  fileName: string,
  data: string,
  encoding = "utf8"
) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
  fs.writeFileSync(`${dirPath}/${fileName}`, data, {
    encoding: encoding as any,
  });
}

function writeMP3File(mp3: string, index: number, dirPath: string) {
  writeFile(dirPath, `audio-${index}.mp3`, mp3, "base64");
}

function writeTextFile(text: string, index: number, dirPath: string) {
  writeFile(dirPath, `text-${index}.txt`, text);
}

export async function textToSpeechIt(
  voice: string,
  text: string,
  textDirPath: string,
  audioDirPath: string
) {
  if (!voice || !AVAILABLE_VOICES.includes(voice))
    throw "A valid voice must be passed. Look at AVAILABLE_VOICES to set the desired voice.";

  if (!text) throw "A text must be passed as the second argument.";

  const textAsArr = text.split(" ");

  const texts: string[] = [];
  let j = 0;
  let currentSentence = "";
  for (let index = 0; index < textAsArr.length; index++) {
    const word = textAsArr[index];
    const newSentence = `${currentSentence} ${word}`;

    if (newSentence.length > 250 || index === textAsArr.length - 1) {
      texts[j] = `${newSentence}` as never;
      currentSentence = "";
      j++;
    } else {
      currentSentence += ` ${word}`;
    }
  }

  for (let index = 0; index < texts.length; index++) {
    if (index !== 0) {
      await sleep(5);
    }
    const text = texts[index];
    const mp3 = await callAPI(text, voice);

    writeMP3File(mp3, index, audioDirPath);

    writeTextFile(text, index, textDirPath);
  }
}

export default textToSpeechIt;
