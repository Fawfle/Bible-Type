import GameManager from "./scripts/gameManager.js"
import BibleManager from "./scripts/bibleManager.js";
import SaveManager from "./scripts/saveManager.js";
import BibleLoader from "./scripts/bibleLoader.js";

const randomVerseButton = document.getElementById("randomVerse");
const selectVerseButton = document.getElementById("selectVerse");
const nextVerseButton = document.getElementById("nextVerse");
const previousVerseButton = document.getElementById("previousVerse");

export const VERSION = "1.0";

let bibleLoader = new BibleLoader();
let saveManager = new SaveManager(bibleLoader);

let game = new GameManager();
let bibleManager = new BibleManager(bibleLoader, saveManager);

game.onPassageComplete.push(onPassageComplete);

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

function onPassageComplete() {
  let active = bibleManager.active;
  saveManager.setVerseCompleted(active);
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
  bibleManager.updateActiveVerse();
  game.startNewPrompt(e, verse);
}