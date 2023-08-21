import fs from "fs";

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

  // French
  "fr_001", // Male 1
  "fr_002", // Male 2

  // German
  "de_001", // Female
  "de_002", // Male

  // Spanish
  "es_002", // Male

  // Spanish MX
  "es_mx_002", // Male

  // Portuguese BR
  "br_003", // Female 2
  "br_004", // Female 3
  "br_005", // Male

  // Indonesian
  "id_001", // Female

  // Japanese
  "jp_001", // Female 1
  "jp_003", // Female 2
  "jp_005", // Female 3
  "jp_006", // Male

  // Korean
  "kr_002", // Male 1
  "kr_002", // Male 2
  "kr_002", // Female

  // Singing
  "en_female_ht_f08_wonderful_world",
  "en_female_ht_f08_glorious",
  "en_male_m03_lobby",

  // Characters
  "en_us_rocket"
];

/**
 * Call the API and returns the mp3 data as string
 * @param {string} text text to be read
 * @param {string} voice voice to be used
 * @returns mp3 data as string
 */
async function callAPI(text, voice) {
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

/**
 * @param {string} dirPath directory path
 * @param {string} fileName file name
 * @param {string} data data
 * @param {string} encoding encoding
 */
function writeFile(dirPath, fileName, data, encoding = "utf8") {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
  fs.writeFileSync(`${dirPath}/${fileName}`, data, {
    encoding: encoding as any,
  });
}

/**
 *
 * @param {string} mp3 mp3 data
 * @param {number} index path to file
 * @param {string} dirPath dirPath
 */
function writeMP3File(mp3, index, dirPath) {
  writeFile(dirPath, `audio-${index}.mp3`, mp3, "base64")
}

/**
 *
 * @param {string} text text
 * @param {number} index path to file
 * @param {string} dirPath dirPath
 */
function writeTextFile(text, index, dirPath) {
  writeFile(dirPath, `text-${index}.txt`, text)
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * @param {string} voice voice
 * @param {string} text text
 * @param {string} textDirPath dirPath
 * @param {string} audioDirPath audioDirPath
 */
export async function textToSpeechIt(voice, text, textDirPath, audioDirPath) {
  if (!voice || !AVAILABLE_VOICES.includes(voice))
    throw "A valid voice must be passed. Look at AVAILABLE_VOICES to set the desired voice.";

  if (!text) throw "A text must be passed as the second argument.";

  const textAsArr = text.split(" ");

  const texts = [];
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

    writeTextFile(text, index, textDirPath)
  }
}

export default textToSpeechIt;
