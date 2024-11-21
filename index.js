import GameManager from "./scripts/gameManager.js"
import BibleManager from "./scripts/bibleManager.js";
import SaveManager from "./scripts/saveManager.js";

const randomVerseButton = document.getElementById("randomVerse");
const selectVerseButton = document.getElementById("selectVerse");
const nextVerseButton = document.getElementById("nextVerse");
const previousVerseButton = document.getElementById("previousVerse");

const VERSION = 0.1;

let game = new GameManager();
let bibleManager = new BibleManager();
//let saveManager = new SaveManager();

randomVerseButton.addEventListener("click", getRandomPrompt);
selectVerseButton.addEventListener("click", getSelectedVersePrompt);
nextVerseButton.addEventListener("click", getNextVersePrompt);
previousVerseButton.addEventListener("click", getPreviousVersePrompt);

document.addEventListener("keydown", (e) => handleHotkeys(e));

function handleHotkeys(e) {
  if (!e.altKey) return;

  if (e.key == "r") getRandomPrompt();

  if (!bibleManager.isVerseDataValid(bibleManager.selected)) return;

  if (e.key == "j") getPreviousVersePrompt();
  else if (e.key == "k") getNextVersePrompt();
}

function getRandomPrompt(e) {
  startPrompt(e, bibleManager.getRandomVerse());
}

function getSelectedVersePrompt(e) {
  startPrompt(e, bibleManager.getSelectedVerse());
}

function getNextVersePrompt(e) {
  startPrompt(e, bibleManager.getNextVerse());
}

function getPreviousVersePrompt(e) {
  startPrompt(e, bibleManager.getPreviousVerse());
}

function startPrompt(e, verse) {
  bibleManager.active = structuredClone(bibleManager.selected);
  game.startNewPrompt(e, verse);
}