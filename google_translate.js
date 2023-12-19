import fs from 'fs';
import timers from 'node:timers/promises';
import axios from 'axios';

let delayMs = 20000;
const textFile = fs.readFileSync('1000en.txt', 'utf8');
// loop through each line
const lines = textFile.split('\n');

async function translateRun() {
  for (let i = 0; i < lines.length; i++) {
    console.log(`# ${i}: ${lines[i]}`);
    const { data } = await axios.get(`https://t.song.work/api?text=${lines[i]}&from=en&to=mn`);
    const text = data.result;
    console.log(`# ${i}: ${text}`);
    // write to file
    fs.appendFileSync('./translated_data.txt', `${text}\n`);
    // delay between 10-15 seconds
    delayMs = Math.floor(Math.random() * 5000) + 10000;
    console.log(`# Delay: ${delayMs}`);
    await timers.setTimeout(delayMs);
  }
}

translateRun();