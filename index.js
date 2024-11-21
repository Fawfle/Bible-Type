let passage;
let input;

const passageElement = document.getElementById("passage");
const inputElement = document.getElementById("textInput");

const randomVerseButton = document.getElementById("randomVerse");

const bibleVersionSelect = document.getElementById("bibleVersionSelect");

const bookSelect = document.getElementById("bookSelect");
const chapterSelect = document.getElementById("chapterSelect");
const verseSelect = document.getElementById("verseSelect");

const selectVerseButton = document.getElementById("selectVerse");
const nextVerseButton = document.getElementById("nextVerse");
const previousVerseButton = document.getElementById("previousVerse");

const chapterSelectHTML = chapterSelect.innerHTML;
const verseSelectHTML = verseSelect.innerHTML;

const passageTitle = document.getElementById("passageTitle");
const resultsText = document.getElementById("results");

const CORRECT_CLASS = "correctInput";
const INCORRECT_CLASS = "incorrectInput";

// bible is downlaoded in bible.json
//const apiURL = "https://bible-api.com/";

const BIBLE_FILES = [
  { name: "American Standard Version", path: "bible_asv.json" },
  { name: "King James Version", path: "bible_kjv.json" },
  { name: "Basic British English", path: "bible_bbe.json" },
];
const BIBLE_FILE = BIBLE_FILES[0].path;
let BIBLES_LOADED = 0;
let bible;
const bibles = [];

const VERSION = 0.1;

document.title = "Bible Type";

console.log("save: " + document.cookie);

let save = { version: 0 };
updateSaveCookie();

/*
let save = loadSaveCookie(document.cookie);
if (save == null) {
  save = createNewSave();
  updateSaveCookie();
}
*/

reset();
passageElement.innerText = `Loading ./bibles/...`;

for (let i = 0; i < BIBLE_FILES.length; i++) {
  bibleVersionSelect.innerHTML += `<option value="${i}">${BIBLE_FILES[i].name}</option>`;

  fetch("./bibles/" + BIBLE_FILES[i].path)
    .then((response) => response.json())
    .then((data) => {
      bible = data;
      bibles[i] = bible;
      BIBLES_LOADED++;
      if (BIBLES_LOADED >= BIBLE_FILES.length) bibleLoaded();
    })
    .catch((e) => console.log(e));
}

let playing = false;
let startTime = Date.now();
let totalTime = 0;

//inputElement.preventDefault();

//inputElement.addEventListener("input", updateInput);
randomVerseButton.addEventListener("click", (e) => getNewPrompt(e, getRandomVerse()));
selectVerseButton.addEventListener("click", (e) => getNewPrompt(e, getSelectedVerse()));
nextVerseButton.addEventListener("click", (e) => getNewPrompt(e, getNextVerse()));
previousVerseButton.addEventListener("click", (e) => getNewPrompt(e, getPreviousVerse()));

document.addEventListener("keydown", (e) => handleHotkeys(e));
inputElement.addEventListener("input", updateInput);

bookSelect.addEventListener("input", updatePassageSelect);
chapterSelect.addEventListener("input", updatePassageSelect);
verseSelect.addEventListener("input", updatePassageSelect);

bibleVersionSelect.addEventListener("input", updateBibleVersion);

function handleHotkeys(e) {
  if (!e.altKey) return;

  if (e.key == "r") getNewPrompt(e, getRandomVerse());

  if (bookSelect.value == "" || chapterSelect.value == "" || verseSelect.value == "") return;

  if (e.key == "j") getNewPrompt(e, getNextVerse());
  else if (e.key == "k") getNewPrompt(e, getPreviousVerse());
}

function updateInput(event) {
  console.log("update input");
  if (startTime == -1) startTime = Date.now();
  input = inputElement.value;

  let correct = passage.substring(0, input.length) === input;

  if (!correct) inputElement.classList.add(INCORRECT_CLASS);
  else inputElement.classList.remove(INCORRECT_CLASS);

  if (passage === input) passageCompleted();
}

function passageCompleted() {
  inputElement.classList.add(CORRECT_CLASS);
  inputElement.disabled = true;

  console.log(totalTime);
  totalTime = Date.now() - startTime;

  resultsText.innerText = `
  Time: ${formatNumber(totalTime / 1000)}s
  WPM: ${formatNumber((countWords(passage) / (totalTime / 1000)) * 60)}
  `;
}

function updateSampleText(text) {
  passage = text;
  passageElement.innerText = passage;
}

function startNewPrompt(data) {
  updateSampleText(data.verse);
  passageTitle.innerText = data.name;

  inputElement.disabled = false;
  //inputElement.value = "";
  inputElement.select();

  startTime = -1;
  //startTime = Date.now();
}

//asyncs are cool, getText can be a promise or string (bible is also now just stored)
async function getNewPrompt(event, getText) {
  reset();

  let data = await getText;

  startNewPrompt(data);
}

function bibleLoaded() {
  passageElement.innerText = "Click a button!";

  //let res = "[";

  for (let i in bible) {
    bookSelect.innerHTML += `<option value="${i}">${bible[i].name}</option>`;
    //res += `"${bible[i].name}",`;
  }

  //console.log(res);

  let maxChapters = 0;
  let maxVerses = 0;
  for (let i = 0; i < bible.length; i++) {
    maxChapters = Math.max(maxChapters, bible[i].chapters.length);
    for (let j = 0; j < bible[i].chapters.length; j++) {
      maxVerses = Math.max(maxVerses, bible[i].chapters[j].length);
    }
  }

  for (let i = 0; i < maxChapters; i++) {
    chapterSelect.innerHTML += `<option id="chapterSelect${i}" value="${i}">${i + 1}</option>`;
  }

  for (let i = 0; i < maxVerses; i++) {
    verseSelect.innerHTML += `<option id="verseSelect${i}" value="${i}">${i + 1}</option>`;
  }

  updatePassageSelect();
}

function updatePassageSelect() {
  if (bookSelect.value == "") return;
  chapterSelect.disabled = false;

  let book = bible[bookSelect.value];

  let chapterCount = book.chapters.length;
  if (chapterSelect.value != "" && chapterSelect.value >= chapterCount) chapterSelect.value = chapterCount - 1;

  // i = 1 to skip placeholder, -2 b/c placeholder and no chapter 0
  for (let i = 1; i < chapterSelect.innerHTML.split("/").length - 2; i++) {
    let c = document.getElementById("chapterSelect" + i);
    let show = i + 1 <= chapterCount;
    c.style.display = show ? "inline" : "none";
    c.disabled = show ? false : true;
  }

  if (chapterSelect.value == "") return;
  verseSelect.disabled = false;

  let chapter = book.chapters[chapterSelect.value];

  let verseCount = chapter.length;
  if (verseSelect.value != "" && verseSelect.value >= verseCount) verseSelect.value = verseCount - 1;

  for (let i = 1; i < verseSelect.innerHTML.split("/").length - 2; i++) {
    let v = document.getElementById("verseSelect" + i);
    let show = i + 1 <= verseCount;
    v.style.display = show ? "inline" : "none";
    v.disabled = show ? false : true;
  }

  if (verseSelect.value == "") return;

  selectVerseButton.disabled = false;
  nextVerseButton.disabled =
    bookSelect.value == bible.length - 1 && chapterSelect.value == book.chapters.length - 1 && verseSelect.value == chapter.length - 1;
  previousVerseButton.disabled = bookSelect.value == 0 && chapterSelect.value == 0 && verseSelect.value == 0;
}

function updateBibleVersion() {
  if (bibles.indexOf(bible) == bibleVersionSelect.value) return;
  bible = bibles[bibleVersionSelect.value];
  //reset();
}

function reset() {
  input = "";
  updateSampleText("Loading...");
  inputElement.value = "";
  inputElement.classList.remove(...inputElement.classList);

  resultsText.innerText = "";
}

async function getNextVerse() {
  if (bookSelect.value == "" || chapterSelect.value == "" || verseSelect.value == "") return;
  if (bookSelect.value == bible.length - 1 && chapterSelect.value == book.chapters.length - 1 && verseSelect.value == chapter.length - 1) return;
  let bi = parseInt(bookSelect.value);
  let ci = parseInt(chapterSelect.value);
  let vi = parseInt(verseSelect.value) + 1;

  let b = bible[bi];
  let c = b.chapters[ci];

  // next chapter
  if (vi >= c.length) {
    ci++;
    vi = 0;
  }

  // next book
  if (ci >= b.chapters.length) {
    bi++;
    b = bible[bi];
    ci = 0;
  }

  c = b.chapters[ci];
  let v = c[vi];

  bookSelect.value = bi;
  chapterSelect.value = ci;
  verseSelect.value = vi;
  updatePassageSelect();

  return { verse: formatVerse(v), name: formatVerseName(b, ci, vi) };
}

async function getPreviousVerse() {
  if (bookSelect.value == "" || chapterSelect.value == "" || verseSelect.value == "") return;
  if (bookSelect.value == 0 && chapterSelect.value == 0 && verseSelect.value == 0) return;
  let bi = parseInt(bookSelect.value);
  let ci = parseInt(chapterSelect.value);
  let vi = parseInt(verseSelect.value) - 1;

  let b = bible[bi];
  let c = b.chapters[ci];

  // previous chapter
  if (vi < 0) {
    ci--;
    if (ci >= 0) c = b.chapters[ci];
    vi = c.length - 1;
  }

  // previous book
  if (ci < 0) {
    bi--;
    b = bible[bi];
    ci = b.chapters.length - 1;
    vi = b.chapters[ci].length - 1;
  }

  c = b.chapters[ci];
  let v = c[vi];

  bookSelect.value = bi;
  chapterSelect.value = ci;
  verseSelect.value = vi;
  updatePassageSelect();

  return { verse: formatVerse(v), name: formatVerseName(b, ci, vi) };
}

async function getSelectedVerse() {
  let b = bible[bookSelect.value];
  let v = b.chapters[chapterSelect.value][verseSelect.value];

  return { verse: formatVerse(v), name: formatVerseName(b, chapterSelect.value, verseSelect.value) };
}

async function getRandomVerse() {
  //console.log(bible);
  let bi = Math.floor(Math.random() * bible.length);
  let book = bible[bi];
  //console.log(book);
  let ci = Math.floor(Math.random() * book.chapters.length);
  let chapter = book.chapters[ci];
  //console.log(chapter);
  let vi = Math.floor(Math.random() * chapter.length);
  let verse = chapter[vi];

  bookSelect.value = bi;
  chapterSelect.value = ci;
  verseSelect.value = vi;
  updatePassageSelect();

  return { verse: formatVerse(verse), name: formatVerseName(book, ci, vi) };
}

// unused b/c I just downloaded it
async function getBibleVerse(verse) {
  return await fetch(apiURL + verse)
    .then((response) => {
      if (!response.ok) throw new Error("response failed");
      return response.json();
    })
    .then((data) => {
      //console.log(data);
      return data.text
        .replace(/(\r\n|\n|\r)/gm, " ")
        .replaceAll("’", "'")
        .replaceAll("“", '"')
        .replaceAll("”", '"');
    });
}

function formatVerseName(b, c, v) {
  return `${b.name} ${parseInt(c) + 1}:${parseInt(v) + 1}`;
}

function formatVerse(v) {
  //console.log(v[v.length - 1]);
  //if (v[v.length - 1] == "}") v = v.substring(0, v.lastIndexOf("{") - 1);
  v = v.replaceAll("{", "").replaceAll("}").replaceAll("[", "").replaceAll("]", "");
  return v;
}

function countWords(str) {
  return str.trim().split(/\s+/).length;
}

function formatNumber(num) {
  return Math.round(num * 100) / 100;
}

function createNewSave() {
  let newSave = { version: VERSION };
  return newSave;
}

function updateSaveCookie() {
  document.cookie = `save="${JSON.stringify(save)}";expires=Fri, 31 Dec 9999 23:59:59 GMT Secure`;
}

function loadSaveCookie() {
  if (document.cookie == "") return null;
  let s = document.cookie.split("; ").find((row) => row.trim().startsWith("save"));
  console.log(s);
  return JSON.parse(s);
}

//document.cookie = JSON.stringify(save);
