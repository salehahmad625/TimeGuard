const addBtn = document.getElementById("addBtn");
const inputForm = document.getElementById("inputForm");
const websiteVal = document.getElementById("website");
const limitVal = document.getElementById("limit");
const cancelButton = document.querySelector(".cancelButton");
const submitButton = document.querySelector(".submitButton");
const tableBody = document.querySelector(".table-body");

let arr = [];
let limitReached = [];

addBtn.addEventListener("click", () => {
  addBtn.style.display = "none";
  inputForm.style.display = "grid";
});

cancelButton.addEventListener("click", () => {
  inputForm.style.display = "none";
  addBtn.style.display = "grid";
});

submitButton.addEventListener("click", () => {
  inputForm.style.display = "none";
  addBtn.style.display = "grid";
  addToArr(websiteVal.value, limitVal.value);
  tableBody.appendChild(createRow(websiteVal.value, limitVal.value, 0));
});

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get("myList", (result) => {
    let storedData = result.myList;
    if (storedData !== undefined) {
      arr = JSON.parse(storedData);
      console.log("Array from storage: " + JSON.stringify(arr));
      // storeArrInChrome();
      let retrievedList = JSON.parse(storedData);
      populateContent(retrievedList);
    }
  });
  setTimeout(() => {
    let editButtons = document.querySelectorAll(".edit-button");
    addEditListeners(editButtons);
    let trashButtons = document.querySelectorAll(".trash-button");
    addTrashListeners(trashButtons);
  }, 50);
});

//use chrome storage to create rows, then add?

function createRow(website, limit, time) {
  let row = document.createElement("div");

  row.setAttribute("id", getDomain(website, false));
  row.setAttribute("class", "table-row");

  // console.log(website  );
  // let limitBool = await isLimitReached(website);
  // if (isLimitReached) {
  //   row.setAttribute("background-color", "red");
  // }

  let content = document.createElement("div");
  content.setAttribute("class", "content-container");

  let siteEntry = document.createElement("div");
  siteEntry.setAttribute("class", "website");
  siteEntry.textContent = website;
  let limitEntry = document.createElement("div");
  limitEntry.setAttribute("class", "limit");
  limitEntry.textContent = limit + " min";
  let timeSpent = document.createElement("div");
  timeSpent.setAttribute("class", "time");
  timeSpent.textContent = Math.floor(time / 60) + " min";

  let actions = document.createElement("div");
  actions.setAttribute("class", "buttons-container");

  let edit = document.createElement("a");
  edit.setAttribute("class", "edit-button");
  let editBtn = document.createElement("img");
  editBtn.setAttribute("src", "edit-pencil.png");
  edit.appendChild(editBtn);

  let trash = document.createElement("a");
  trash.setAttribute("class", "trash-button");
  let trashBtn = document.createElement("img");
  trashBtn.setAttribute("src", "trash-icon.png");
  trash.appendChild(trashBtn);

  actions.appendChild(edit);
  actions.appendChild(trash);

  content.appendChild(siteEntry);
  content.appendChild(limitEntry);
  content.appendChild(timeSpent);
  content.appendChild(actions);
  row.appendChild(content);
  let hidden = injectEditControls();
  row.appendChild(hidden);
  addEditListener(edit);
  addTrashListener(trash);
  return row;
}

function addToArr(websiteName, timeLimit) {
  let newObj = { website: websiteName, limit: timeLimit, time: 0 };
  arr.push(newObj);
  storeArrInChrome();
  // if (!map.has(websiteName)) {
  //   arr.push(newObj);
  //   map.set(websiteName, { limit: timeLimit, time: 0 });
  //   storeArrInChrome();
  // } else {
  //   //error: already entered this URL!
  //   //todo: check duplicates, i.e. www.website.com is same as website.com
  // }
}

function storeArrInChrome() {
  chrome.storage.sync.set({ myList: JSON.stringify(arr) });
  chrome.runtime.sendMessage({ type: "websitesUpdated", objects: arr });
  // console.log(arr.map((obj) => obj.website));
  // console.log(JSON.stringify(arr.map((obj) => obj.website)));
  // chrome.runtime.sendMessage({
  //   type: "websitesUpdated",
  //   websites: arr.map((obj) => obj.website),
  // });
}

function populateContent(data) {
  if (tableBody) {
    data.forEach((item) => {
      let row = createRow(item.website, item.limit, item.time);
      tableBody.appendChild(row);
    });
  }
}

function injectEditControls() {
  let container = document.createElement("div");
  container.setAttribute("class", "edit-controls");
  container.style.display = "none";
  let websiteInput = document.createElement("input");
  websiteInput.setAttribute("type", "text");
  websiteInput.setAttribute("placeholder", "Enter website");
  websiteInput.setAttribute("class", "website-input");
  let limitInput = document.createElement("input");
  limitInput.setAttribute("type", "number");
  limitInput.setAttribute("placeholder", "Enter limit (minutes)");
  limitInput.setAttribute("class", "limit-input");
  container.appendChild(websiteInput);
  container.appendChild(limitInput);

  let actions = document.createElement("div");
  actions.setAttribute("class", "buttons-container");

  let cancelAnchor = document.createElement("a");
  let cancelImg = document.createElement("img");
  cancelImg.setAttribute("class", "cancelButton");
  cancelImg.setAttribute("src", "red-x.png");
  cancelAnchor.appendChild(cancelImg);
  let submitAnchor = document.createElement("a");
  let submitImg = document.createElement("img");
  submitImg.setAttribute("class", "submitButton");
  submitImg.setAttribute("src", "green-check.png");
  submitAnchor.appendChild(submitImg);
  actions.appendChild(cancelAnchor);
  actions.appendChild(submitAnchor);
  container.appendChild(actions);
  return container;
}

function addEditListener(editButton) {
  let row = editButton.closest(".table-row");
  let content = row.querySelector(".content-container");
  let editControls = row.querySelector(".edit-controls");
  let website = row.querySelector(".website");
  let limit = row.querySelector(".limit");
  let websiteInput = row.querySelector(".website-input");
  let limitInput = row.querySelector(".limit-input");
  let submitBtn = row.querySelector(".submitButton");
  let cancelBtn = row.querySelector(".cancelButton");

  editButton.addEventListener("click", () => {
    editControls.style.display = "grid";
    content.style.display = "none";
    websiteInput.value = website.textContent;
    limitInput.value = limit.textContent;
  });

  cancelBtn.addEventListener("click", () => {
    content.style.display = "grid";
    editControls.style.display = "none";
  });

  submitBtn.addEventListener("click", () => {
    updateArr(website.textContent, websiteInput.value, limitInput.value);
    website.textContent = websiteInput.value;
    limit.textContent = limitInput.value + " min";
    content.style.display = "grid";
    editControls.style.display = "none";
  });
}

function addEditListeners(editButtons) {
  editButtons.forEach((button) => {
    addEditListener(button);
  });
}

function addTrashListener(trashButton) {
  let row = trashButton.closest(".table-row");
  let website = row.querySelector(".website");
  let websiteName = website.textContent;
  trashButton.addEventListener("click", () => {
    let ind = findIndInArr(websiteName);
    removeFromArr(ind);
    row.remove();
  });
}

function addTrashListeners(trashButtons) {
  trashButtons.forEach((button) => {
    addTrashListener(button);
  });
}

function removeFromArr(ind) {
  arr.splice(ind, 1);
  storeArrInChrome();
}

function findIndInArr(name) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].website == name || getDomain(arr[i].website, false) == name) {
      return i;
    }
  }
  return -1;
}

function updateArr(oldName, newName, newLimit) {
  let ind = findIndInArr(oldName);
  if (ind == -1) {
    return;
  }
  arr[ind].website = newName;
  if (oldName !== newName) {
    arr[ind].time = 0;
  }
  arr[ind].limit = newLimit;
  storeArrInChrome();
}

function getDomain(url, subdomain) {
  subdomain = subdomain || false;

  url = url.replace(/(https?:\/\/)?(www.)?/i, "");

  if (!subdomain) {
    url = url.split(".");

    url = url.slice(url.length - 2).join(".");
  }

  if (url.indexOf("/") !== -1) {
    return url.split("/")[0];
  }

  return url;
}

function getDataFromChromeStorage(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(key, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[key]);
      }
    });
  });
}

async function isLimitReached(website) {
  let storedData = await getDataFromChromeStorage("limitReached");
  limitReached = JSON.parse(storedData);
  return limitReached.includes(website);
  // chrome.storage.sync.get("limitReached", (result) => {
  //   let storedData = result.limitReached;
  //   limitReached = JSON.parse(storedData);
  //   console.log(JSON.stringify(limitReached));
  // });
  // if (limitReached.includes(website)) {
  //   return true;
  // }
  // return false;
}

// chrome.runtime.onMessage.addListener((request) => {
//   if (request.action == "updateUITime") {
//     console.log("received update from background");
//     let updatedTime = request.updatedTime;
//     let website = request.website;
//     let ind = findIndInArr(website);
//     if (ind == -1) {
//       return;
//     }
//     arr[ind].time = updatedTime;
//     console.log(updatedTime);
//     let row = document.getElementById(website);
//     let timeUI = row.querySelector(".time");
//     timeUI.textContent = parseInt(updatedTime);
//     // chrome.storage.sync.set({ myList: JSON.stringify(arr) });
//     storeArrInChrome();
//   }
// });

/* Features to Add
    -Trash functionality
    -Unique URLs only (reddit.com = www.reddit.com)
      -implement map for this
    -Valid URLs only (no nonsense)
    -Valid time inputs (numbers only, less than 24 hrs, etc.)
*/
