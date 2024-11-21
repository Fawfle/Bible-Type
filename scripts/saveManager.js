import { VERSION } from "../index.js";

const COMPLETED_VERSES_KEY = "completed-verses";

const SAVE_ID = 0;

export default class SaveManager {

  constructor(bibleLoader) {
    this.save = null;

    // always second
    //bibleLoader.onLoad[1] = ((d) => this.loadSave(d));
  }

  // called once after bible is loaded
  loadSave(data) {
    this.save = this.readSave();

    if (this.save == null) {
      this.save = this.createNewSave(data.bible);
      this.writeSave();

      console.log(this.save);
    } else {
      if (this.save.version != VERSION) {
        this.save.version = VERSION;
        this.writeSave();
      }
    }
  }

  setVerseCompleted(verseData) {
    let saveRow = this.save.completed[verseData.book.index][verseData.chapter.index].split("");
    saveRow[verseData.verse.index] = "1";
    this.save.completed[verseData.book.index][verseData.chapter.index] = saveRow.join("");
    this.save.edited = new Date(Date.now()).toUTCString();
    this.writeSave();
  }

  createNewSave(bible) {
    let newSave = { version: VERSION, createdVersion: VERSION, created: new Date(Date.now()).toUTCString(), edited: new Date(Date.now()).toUTCString(), completed: [] };
    // completed is a string array of (string[][]) [book](string[]) [chapter] (string)[verse];

    for (let book of bible) {
      let b = [];
  
    for (let chapter of book.chapters) {
      let c = "0".repeat(chapter.length);
      b.push(c);
    }
  
      newSave.completed.push(b);
    }
  
    return newSave;
  }

  readSave() {
    return JSON.parse(window.localStorage.getItem(COMPLETED_VERSES_KEY));
  }

  writeSave() {
    window.localStorage.setItem(COMPLETED_VERSES_KEY, JSON.stringify(this.save));
  }
  
  /*
  really complicated, localStorage is better/easier for what I need

  readDatabase() {
    let data;

    let openRequest = indexedDB.open(DATABASE_NAME);

    openRequest.onupgradeneeded = () => {
      let db = openRequest.openRequest;
      if (!db.objectStoreNames.contains(OBJECT_STORE_NAME)) db.createObjectStore(OBJECT_STORE_NAME, {keyPath: OBJECT_STORE_PATH});
    };

    openRequest.onsuccess = () => {
      let db = openRequest.result;
      let tx = db.transaction(OBJECT_STORE_NAME, "readonly");
      let store = tx.objectStore(OBJECT_STORE_NAME);
      
      data = store.get(SAVE_ID);

      // not found
      data.onerror = (err) => {
        err.preventDefault();
        err.stopPropagation();
        console.log("Database not found");
        return null;
      }

      tx.oncomplete = () => db.close();
    }

    return data;
  }

  writeSaveToDatabase() {
    let openRequest = indexedDB.open(DATABASE_NAME);

    openRequest.onupgradeneeded = () => {
      let db = openRequest.openRequest;
      if (!db.objectStoreNames.contains(OBJECT_STORE_NAME)) db.createObjectStore(OBJECT_STORE_NAME, {keyPath: OBJECT_STORE_PATH});
    };

    openRequest.onsuccess = () => {
      let db = openRequest.result;
      let tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      let store = tx.objectStore(OBJECT_STORE_NAME);

      // put overwrites
      store.put(save, SAVE_ID).

      tx.oncomplete = () => db.close();
    }
    
    openRequest.onerror = () => console.error("Error", openRequest.error);
  }
  */
}