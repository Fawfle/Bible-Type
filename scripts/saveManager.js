export default class SaveManager {

  constructor() {
      
  }


  createNewSave() {
    let newSave = { version: VERSION, completed: [] };
  
    // completed is a boolean array of [book][chapter][verse];
  
    for (let book of bible) {
      let b = [];
  
    for (let chapter of book.chapters) {
      let c = [];

      for (let verse of chapter) c.push(false);

      b.push(c);
    }
  
      newSave.completed.push(b);
    }
  
    return newSave;
  }
    
  updateSaveCookie() {
    document.cookie = `save=${JSON.stringify(save)};expires=Fri, 31 Dec 9999 23:59:59 GMT Secure`;
  }
    
  loadSaveCookie() {
    if (document.cookie == "") return null;
    let s = document.cookie.split("; ").find((row) => row.startsWith("save"))?.split("=")[1];
    return JSON.parse(s);
  }
}