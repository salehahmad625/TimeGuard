let arr = [];
let limitReached = [];

let active = {};

const addTime = () => {
  if (active.name) {
    const timeDiff = parseInt((Date.now() - active.time) / 1000);
    console.log(`You used ${timeDiff} seconds on ${active.name}`);
    let ind = findIndInArr(active.name);
    arr[ind].time += timeDiff;
    chrome.storage.sync.set({ myList: JSON.stringify(arr) });
    active = {};
    // findReachedLimits();
    // chrome.storage.sync.set({ limitReached: JSON.stringify(limitReached) });
  }
};

const getActiveTab = () => {
  return new Promise((resolve) => {
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      (activeTab) => {
        resolve(activeTab[0]);
      }
    );
  });
};

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

const startTracking = async () => {
  const activeTab = await getActiveTab();
  let storedData = await getDataFromChromeStorage("myList");
  arr = JSON.parse(storedData);
  let url = activeTab.url;
  // check if the tab's url is among the arrays of url
  let website = getDomain(url, false);
  console.log(website);
  console.log(JSON.stringify(arr));
  console.log(findIndInArr(website));
  if (findIndInArr(website) !== -1) {
    // set the site and current time
    if (active.name !== website) {
      // if a different site is active then end the existing site's session
      addTime();
      active = {
        name: website,
        time: Date.now(),
      };
      console.log(`${active.name} visited at ${active.time}`);
    }
  }
};

chrome.tabs.onUpdated.addListener(() => {
  startTracking();
});

chrome.tabs.onActivated.addListener(() => {
  console.log("activated");
  if (active.name) {
    addTime();
  }
  // check to see if the active tab is among the sites being tracked
  startTracking();
});

chrome.windows.onFocusChanged.addListener((window) => {
  console.log("tabs changed");
  if (window === -1) {
    // browser lost focus
    console.log("browser lost focus");
    addTime();
  } else {
    startTracking();
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "websitesUpdated") {
    arr = message.objects;
    console.log(arr);
  }
});

function resetStatistics() {
  //logic for setting all the times back to 0
}

chrome.alarms.create("resetAlarm", {
  when: getMidnightTimestamp(),
  periodInMinutes: 24 * 60,
});

function getMidnightTimestamp() {
  const now = new Date();
  const midnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );
  return midnight.getTime();
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "resetAlarm") {
    resetStatistics();
  }
});

function findIndInArr(name) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].website == name || getDomain(arr[i].website, false) == name) {
      return i;
    }
  }
  return -1;
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

// function findReachedLimits() {
//   for (let i = 0; i < arr.length; i++) {
//     let seconds = arr[i].limit * 60;
//     console.log(seconds);
//     console.log(arr[i].time);
//     if (arr[i].time > seconds && !limitReached.includes(arr[i].website)) {
//       limitReached.push(arr[i].website);
//     }
//   }
//   console.log(limitReached);
// }
