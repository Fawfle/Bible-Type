import { countWords, formatNumber } from "./utils.js";

const CORRECT_CLASS = "correctInput";
const INCORRECT_CLASS = "incorrectInput";

const passageElement = document.getElementById("passage");
const inputElement = document.getElementById("textInput");

const passageTitle = document.getElementById("passageTitle");
const resultsText = document.getElementById("results");

export default class GameManager {
  constructor() {
    this.passage = "";
    this.input; 

    inputElement.addEventListener("input", (e) => this.updateInput(e));

    this.currentVerse = null; // object holding chapter, verse, and book

    this.startTime = Date.now();
    this.totalTime = 0;

    this.reset();

    this.onPassageComplete = [];
  }

  startNewPrompt(event, passageData) {
    this.reset();

    this.updatePassage(passageData.verse);
    passageTitle.innerText = passageData.name;

    inputElement.disabled = false;
    inputElement.select();

    // starttime is set to current time when input is updated for the first time
    this.startTime = -1;
  }

  passageCompleted() {
    inputElement.classList.add(CORRECT_CLASS);
    inputElement.disabled = true;

    this.totalTime = Date.now() - this.startTime;

    resultsText.innerText = `
  Time: ${formatNumber(this.totalTime / 1000)}s
  WPM: ${formatNumber((countWords(this.passage) / (this.totalTime / 1000)) * 60)}
  CPM: ${formatNumber((this.passage.length / (this.totalTime / 1000)) * 60)}
  `;
  
    this.onPassageComplete.forEach(f => f());
  }

  updateInput(event) {
    if (this.passage == "") return;

    if (this.startTime == -1) this.startTime = Date.now();
    this.input = inputElement.value;

    let correct = this.passage.substring(0, this.input.length) === this.input;

    if (!correct) inputElement.classList.add(INCORRECT_CLASS);
    else inputElement.classList.remove(INCORRECT_CLASS);

    if (this.passage === this.input) this.passageCompleted();
  }

  reset() {
    this.input = "";
    this.passage = "";
    passageElement.innerText = "Loading...";
    inputElement.value = "";
    inputElement.classList.remove(...inputElement.classList);

    resultsText.innerText = "";
  }

  updatePassage(text) {
    this.passage = text;
    passageElement.innerText = this.passage;
  }
}
