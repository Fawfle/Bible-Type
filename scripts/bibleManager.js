const bibleVersionSelectInput = document.getElementById("bibleVersionSelect");
const bookSelectInput = document.getElementById("bookSelect");
const chapterSelectInput = document.getElementById("chapterSelect");
const verseSelectInput = document.getElementById("verseSelect");

const selectVerseButton = document.getElementById("selectVerse");
const nextVerseButton = document.getElementById("nextVerse");
const previousVerseButton = document.getElementById("previousVerse");

const passageElement = document.getElementById("passage");

const FINISHED_DROPDOWN_ITEM = "finishedDropdown";
 

export default class BibleManager {
  constructor(bibleLoader, saveManager) {
    this.saveManager = saveManager;

    this.bible;
    this.bibles = [];

    this.maxChapters;
    this.maxVerses;

    // SELECTED verse
    this.selected = {
      book: { data: null, index: -1 },
      chapter: { data: null, index: -1 },
      verse: { data: null, index: -1 },
    };

    // Active/completed verse
    this.active = structuredClone(this.selected);

    bookSelectInput.addEventListener("input", (e) =>
      this.updatePassageSelect(e)
    );
    chapterSelectInput.addEventListener("input", (e) =>
      this.updatePassageSelect(e)
    );
    verseSelectInput.addEventListener("input", (e) =>
      this.updatePassageSelect(e)
    );
    bibleVersionSelectInput.addEventListener("input", (e) =>
      this.updateBibleVersion(e)
    );

    bibleLoader.onLoad[0] = ((d) => this.bibleLoaded(d));
  }

  // TODO: Make classes update when finishing (probably "optimizable")
  updatePassageSelect() {
    for (let i = 0; i < this.bible.length; i++) {
      if (this.saveManager.save.completed[i].flat().reduce((a, b) => a + b).indexOf(0) == -1) document.getElementById("bibleSelect" + i).classList.add(FINISHED_DROPDOWN_ITEM);
  }

    if (bookSelectInput.value == "") return;
    chapterSelectInput.disabled = false;

    this.selected.book.index = bookSelectInput.value;
    this.selected.book.data = this.bible[this.selected.book.index];

    // cap chapter count input at maximum chapter
    let chapterCount = this.selected.book.data.chapters.length;
    if (chapterSelectInput.value != "" && chapterSelectInput.value >= chapterCount) chapterSelectInput.value = chapterCount - 1;

    for (let i = 0; i < this.maxChapters; i++) {
      let c = document.getElementById("chapterSelect" + i);
      let show = i + 1 <= chapterCount;
      c.style.display = show ? "inline" : "none";
      c.disabled = show ? false : true;

      if (show) {
        if (this.saveManager.save.completed[this.selected.book.index][i].indexOf("0") == -1) c.classList.add(FINISHED_DROPDOWN_ITEM);
        else c.classList.remove(FINISHED_DROPDOWN_ITEM);
      }
    }

    if (chapterSelectInput.value == "") return;
    verseSelectInput.disabled = false;

    this.selected.chapter.index = chapterSelectInput.value;
    this.selected.chapter.data = this.selected.book.data.chapters[this.selected.chapter.index];

    // cap verse count at maximum verse
    let verseCount = this.selected.chapter.data.length;
    if (verseSelectInput.value != "" && verseSelectInput.value >= verseCount) verseSelectInput.value = verseCount - 1;

    // update dropdown
    for (let i = 0; i < this.maxVerses; i++) {
      let v = document.getElementById("verseSelect" + i);
      let show = i + 1 <= verseCount;
      v.style.display = show ? "inline" : "none";
      v.disabled = show ? false : true;

      if (show) {
        if (this.saveManager.save.completed[this.selected.book.index][this.selected.chapter.index][i] == "1") v.classList.add(FINISHED_DROPDOWN_ITEM);
        else v.classList.remove(FINISHED_DROPDOWN_ITEM);
      }
    }

    if (verseSelectInput.value == "") return;
    selectVerseButton.disabled = false;

    this.selected.verse.index = verseSelectInput.value;
    this.selected.verse.data = this.selected.chapter.data[this.selected.verse.index];

    if (!this.isVerseDataValid(this.active)) return;

    nextVerseButton.disabled = this.isVerseDataFinal(this.active);
    previousVerseButton.disabled = this.isVerseDataFirst(this.active);
  }

  updateBibleVersion() {
    if (this.bibles.indexOf(this.bible) == bibleVersionSelectInput.value)
      return;
    this.bible = this.bibles[bibleVersionSelectInput.value];
    //reset();
  }

  getNextVerse() {
    if (
      !this.isVerseDataValid(this.active) ||
      this.isVerseDataFinal(this.active)
    )
      return;

    let bi = parseInt(this.active.book.index);
    let ci = parseInt(this.active.chapter.index);
    let vi = parseInt(this.active.verse.index) + 1;

    let b = this.bible[bi];
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
    this.updatePassageSelect();

    return {
      verse: this.formatVerse(v),
      name: this.formatVerseName(b, ci, vi),
    };
  }

  getPreviousVerse() {
    if (
      !this.isVerseDataValid(this.active) ||
      this.isVerseDataFirst(this.active)
    )
      return;

    let bi = parseInt(this.active.book.index);
    let ci = parseInt(this.active.chapter.index);
    let vi = parseInt(this.active.verse.index) - 1;

    let b = this.bible[bi];
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
    this.updatePassageSelect();

    return {
      verse: this.formatVerse(v),
      name: this.formatVerseName(b, ci, vi),
    };
  }

  getSelectedVerse() {
    if (!this.isVerseDataValid(this.selected)) return;

    return {
      verse: this.formatVerse(this.selected.verse.data),
      name: this.formatVerseName(
        this.selected.book.data,
        this.selected.chapter.index,
        this.selected.verse.index
      ),
    };
  }

  // TODO: remove duplicate flag
  getRandomVerse() {
    //console.log(bible);
    let bi = Math.floor(Math.random() * this.bible.length);
    let book = this.bible[bi];
    //console.log(book);
    let ci = Math.floor(Math.random() * book.chapters.length);
    let chapter = book.chapters[ci];
    //console.log(chapter);
    let vi = Math.floor(Math.random() * chapter.length);
    let verse = chapter[vi];

    bookSelect.value = bi;
    chapterSelect.value = ci;
    verseSelect.value = vi;
    this.updatePassageSelect();

    return {
      verse: this.formatVerse(verse),
      name: this.formatVerseName(book, ci, vi),
    };
  }

  formatVerseName(b, c, v) {
    return `${b.name} ${parseInt(c) + 1}:${parseInt(v) + 1}`;
  }

  formatVerse(v) {
    //console.log(v[v.length - 1]);
    //if (v[v.length - 1] == "}") v = v.substring(0, v.lastIndexOf("{") - 1);
    v = v
      .replaceAll("{", "")
      .replaceAll("}")
      .replaceAll("[", "")
      .replaceAll("]", "");
    return v;
  }

  bibleLoaded(data) {
    this.bible = data.bible;
    this.bibles = data.bibles;

    passageElement.innerText = "Loaded! Click a button!";

    for (let i in this.bible) {
      bookSelectInput.innerHTML += `<option id="bibleSelect${i}" value="${i}">${this.bible[i].name}</option>`;
    }

    this.maxChapters = 0;
    this.maxVerses = 0;

    for (let i = 0; i < this.bible.length; i++) {
      this.maxChapters = Math.max(this.maxChapters, this.bible[i].chapters.length);
      for (let j = 0; j < this.bible[i].chapters.length; j++) {
        this.maxVerses = Math.max(this.maxVerses, this.bible[i].chapters[j].length);
      }
    }

    for (let i = 0; i < this.maxChapters; i++) {
      chapterSelectInput.innerHTML += `<option id="chapterSelect${i}" value="${i}">${
        i + 1
      }</option>`;
    }

    for (let i = 0; i < this.maxVerses; i++) {
      verseSelectInput.innerHTML += `<option id="verseSelect${i}" value="${i}">${
        i + 1
      }</option>`;
    }

    this.saveManager.loadSave({bible: this.bible});

    this.updatePassageSelect();
  }

  updateActiveVerse() {
    this.active = structuredClone(this.selected);

    nextVerseButton.disabled = this.isVerseDataFinal(this.active);
    previousVerseButton.disabled = this.isVerseDataFirst(this.active);
  }

  isVerseDataValid(data) {
    return (
      data.book.data != null &&
      data.chapter.data != null &&
      data.verse.data != null
    );
  }

  isVerseDataFinal(data) {
    return (
      data.book.index >= this.bible.length - 1 &&
      data.chapter.index >= data.book.data.chapters.length - 1 &&
      data.verse.index >= data.chapter.data.length - 1
    );
  }

  isVerseDataFirst(data) {
    return (
      data.book.index <= 0 && data.chapter.index <= 0 && data.verse.index <= 0
    );
  }
}
