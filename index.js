import GameManager from "./scripts/gameManager.js"
import BibleManager from "./scripts/bibleManager.js";
import SaveManager from "./scripts/saveManager.js";
import BibleLoader from "./scripts/bibleLoader.js";

const randomVerseButton = document.getElementById("randomVerse");
const selectVerseButton = document.getElementById("selectVerse");
const nextVerseButton = document.getElementById("nextVerse");
const previousVerseButton = document.getElementById("previousVerse");

const passageFontSelect = document.getElementById("passageFontSelect");
const changelogButton = document.getElementById("changelogButton");

const passageElement = document.getElementById("passage");
const inputElement = document.getElementById("textInput");


export const VERSION = "1.3";

const FONTS = { "Sans Serif": "Verdana, Arial, Helvetica, sans-serif", "Serif": "Times, 'Times New Roman', Georgia, serif", "Monospaced": "'Lucida Console', Courier, monospace", "Cursive": "cursive" };
const DEFAULT_FONT = "Sans Serif";
const PASSAGE_FONT_KEY = "passage-font";

changelogButton.innerText = `${VERSION} Changelog`;
changelogButton.onclick = () => alert("1.0: Saving for completed verses \n1.1: Fixed issue with next/previous verse \n 1.2: Added CPM \n1.3: Added font select");

let bibleLoader = new BibleLoader();
let saveManager = new SaveManager(bibleLoader);

let game = new GameManager();
let bibleManager = new BibleManager(bibleLoader, saveManager);

game.onPassageComplete.push(onPassageComplete);

randomVerseButton.addEventListener("click", getRandomPrompt);
selectVerseButton.addEventListener("click", getSelectedVersePrompt);
nextVerseButton.addEventListener("click", getNextVersePrompt);
previousVerseButton.addEventListener("click", getPreviousVersePrompt);

for (let name of Object.keys(FONTS)) {
  passageFontSelect.innerHTML += `<option value="${name}">${name}</option>`;
}

updatePassageFont(window.localStorage.getItem(PASSAGE_FONT_KEY) || DEFAULT_FONT);
passageFontSelect.addEventListener("input", () => updatePassageFont(passageFontSelect.value));

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
  bibleManager.updateCompletedVerses();
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

function updatePassageFont(font) {
  window.localStorage.setItem(PASSAGE_FONT_KEY, font);
  passageFontSelect.value = font;

  passageElement.style.fontFamily = FONTS[font];
  inputElement.style.fontFamily = FONTS[font];
}