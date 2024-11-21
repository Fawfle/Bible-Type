const bibleVersionSelectInput = document.getElementById("bibleVersionSelect");
const passageElement = document.getElementById("passage");

const BIBLE_FILES = [
  { name: "American Standard Version", path: "bible_asv.json" },
  { name: "King James Version", path: "bible_kjv.json" },
  { name: "Basic British English", path: "bible_bbe.json" },
];

const DEFAULT_BIBLE_FILE_PATH = BIBLE_FILES[0].path;
let BIBLES_LOADED = 0;

export default class BibleLoader {
  constructor() {
    this.onLoad = [];

    this.bible;
    this.bibles = [];

    this.fetchBibles();
  }

  fetchBibles() {
    passageElement.innerText = `Loading ./bibles/...`;

    for (let i = 0; i < BIBLE_FILES.length; i++) {
      bibleVersionSelectInput.innerHTML += `<option value="${i}">${BIBLE_FILES[i].name}</option>`;

      fetch("./bibles/" + BIBLE_FILES[i].path)
        .then((response) => response.json())
        .then((data) => {
          if (BIBLE_FILES[i].path == DEFAULT_BIBLE_FILE_PATH) this.bible = data;

          this.bibles[i] = data;
          BIBLES_LOADED++;
          if (BIBLES_LOADED >= BIBLE_FILES.length) this.bibleLoaded();
        })
        .catch((e) => console.log(e));
    }
  }

  bibleLoaded() {
    this.onLoad.forEach(f => f({ bibles: this.bibles, bible: this.bible }));
  }
}