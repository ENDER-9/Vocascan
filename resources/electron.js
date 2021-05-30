const path = require("path");
const {
  app,
  BrowserWindow,
  ipcMain,
  Notification,
  Menu,
  shell,
} = require("electron");
const isDev = require("electron-is-dev");
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");
const i18n = require("i18next");
const i18nBackend = require("i18next-node-fs-backend");

const { MENU_TEMPLATE } = require("./utils/menu");
const { RegisterIpcHandler } = require("./utils/ipc");

app.allowRendererProcessReuse = true;
log.transports.file.level = "debug";
autoUpdater.logger = log;
autoUpdater.autoDownload = false;
autoUpdater.allowDowngrade = true; // just in case we want to revert a build
const gotTheLock = app.requestSingleInstanceLock();

i18n.use(i18nBackend);

const windows = {
  main: null,
  splash: null,
};

const timerIds = {
  showInterval: null,
  checkForUpdates: null,
  skipUpdateTimeout: null,
};

const TIMES = {
  beforeQuitAndUpdate: 2 * 1000,
  beforeStart: 2 * 1000,
  checkLaunchingInterval: 0.5 * 1000,
  checkUpdate: 1 * 60 * 60 * 1000, // every hour
  skipUpdateTimeout: 15 * 1000,
  skipUpdateShow: 1 * 1000,
};

let mainIsReady = false;
let splashShowEnough = false;
let updateAvailable = false;

const localize = async () => {
  await i18n.init({
    lng: app.getLocale(),
    debug: false,
    backend: {
      loadPath: path.join(
        __dirname,
        "../src/i18n/locales/{{lng}}/electron.json"
      ),
    },
    interpolation: {
      escapeValue: false,
    },
    saveMissing: true,
    fallbackLng: "en",
  });
};

const createWindow = () => {
  // Create the main window.
  windows.main = new BrowserWindow({
    width: 1440,
    height: 900,
    icon: path.join(__dirname, "../src/images/logo/vocascan-round-linux.png"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false,
    },
    show: false,
  });

  // Create the main window.
  windows.splash = new BrowserWindow({
    width: 350,
    height: 450,
    resizable: false,
    icon: path.join(__dirname, "../src/images/logo/vocascan-round-linux.png"),
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    show: false,
  });

  // insert menubar
  const mainMenu = Menu.buildFromTemplate(MENU_TEMPLATE);
  Menu.setApplicationMenu(mainMenu);

  // register ipc handler
  RegisterIpcHandler();

  windows.splash.loadURL(
    `file://${path.join(__dirname, "../resources/splash/splash-screen.html")}`
  );

  if (isDev) {
    // load redux and react dev tools
    const {
      default: installExtension,
      REACT_DEVELOPER_TOOLS,
      REDUX_DEVTOOLS,
    } = require("electron-devtools-installer");

    installExtension([REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS])
      .then((name) => {
        console.log(`Added Extension:  ${name}`);

        // open dev tools
        windows.main.webContents.openDevTools();

        // load dev server with hot reload
        windows.main.loadURL("http://localhost:3000");
      })
      .catch((err) => console.log("An error occurred: ", err));
  } else {
    // load static react build from build folder
    windows.main.loadURL(
      `file://${path.join(__dirname, "../build/index.html")}`
    );
  }

  // clear memory
  windows.main.on("closed", () => (windows.main = null));
  windows.splash.on("closed", () => (windows.splash = null));

  // open links in default browser
  windows.main.webContents.on("new-window", (e, url) => {
    e.preventDefault();
    shell.openExternal(url);
  });

  windows.splash.once("ready-to-show", () => {
    if (!isDev) {
      windows.splash.show();

      setTimeout(() => {
        splashShowEnough = true;
      }, TIMES.beforeStart);

      // start update check
      autoUpdater.checkForUpdates();
    }
  });

  windows.splash.webContents.on("did-finish-load", () => {
    windows.splash.webContents.send("translations", {
      check: i18n.t("splash.updates.check"),
      skipCheck: i18n.t("splash.updates.skipCheck"),
      download: i18n.t("splash.updates.download"),
      skipButton: i18n.t("splash.updates.skipButton"),
      starting: i18n.t("splash.start.starting"),
      restarting: i18n.t("splash.start.restarting"),
    });
  });

  windows.main.once("ready-to-show", () => {
    if (!isDev) {
      mainIsReady = true;
    }
  });
};

const launch = () => {
  timerIds.showInterval = setInterval(() => {
    if (mainIsReady && splashShowEnough) {
      // clear waiting interval
      clearInterval(timerIds.showInterval);

      windows.main.show();
      windows.splash.destroy();
    }
  }, TIMES.checkLaunchingInterval);
};

const updateNotify = (isDarwin, info) => {
  // clear check for updates interval
  clearInterval(timerIds.checkForUpdates);

  // send notification to main window
  if (windows.main) {
    windows.main.webContents.send("update-available", isDarwin, info);
  }

  // show push notification
  const notification = {
    title: `Vocascan ${info.version} is available!`,
  };

  if (isDarwin) {
    notification.body = "You have to download and install the update yourself.";
  } else {
    notification.body = "Update will be automatically installed on exit";
  }

  new Notification(notification).show();
};

const skipUpdateCheck = () => {
  if (windows.splash) {
    windows.splash.webContents.send("skipCheck");

    setTimeout(() => {
      launch();
    }, TIMES.skipUpdateShow);

    cancelSkipUpdate();
  }
};

const cancelSkipUpdate = () => {
  if (timerIds.skipUpdateTimeout) {
    clearTimeout(timerIds.skipUpdateTimeout);
    timerIds.skipUpdateTimeout = null;
  }
};

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (windows.main) {
      if (windows.main.isMinimized()) windows.main.restore();
      windows.main.focus();
    }
  });

  app.on("ready", async () => {
    await localize();

    createWindow();

    if (isDev) {
      windows.main.show();
    }

    // check for updates interval
    if (!isDev) {
      timerIds.checkForUpdates = setInterval(() => {
        autoUpdater.checkForUpdates();
      }, TIMES.checkUpdate);
    }
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("activate", () => {
    if (windows.main === null) {
      createWindow();
    }
  });
}

ipcMain.on("start-update", () => {
  if (updateAvailable && !isDev) {
    autoUpdater.quitAndInstall();
  }
});

ipcMain.on("skip-check", () => {
  skipUpdateCheck();
});

autoUpdater.on("checking-for-update", () => {
  if (windows.splash) {
    windows.splash.webContents.send("check");
  }

  cancelSkipUpdate();
  timerIds.skipUpdateTimeout = setTimeout(() => {
    skipUpdateCheck();
  }, TIMES.skipUpdateTimeout);
});

autoUpdater.on("update-available", (info) => {
  if (process.platform !== "darwin") {
    // download update if platform is not darwin
    autoUpdater.downloadUpdate();
  }

  cancelSkipUpdate();
  timerIds.skipUpdateTimeout = setTimeout(() => {
    skipUpdateCheck();
  }, TIMES.skipUpdateTimeout);

  if (windows.splash) {
    // check if mac -> cannot update without certificate
    if (process.platform !== "darwin") {
      windows.splash.webContents.send("download", info);
    } else {
      launch();
    }
  }

  if (windows.main && process.platform === "darwin") {
    updateNotify(true, info);
  }
});

autoUpdater.on("update-not-available", (info) => {
  if (windows.splash) {
    windows.splash.webContents.send("launch", info);

    launch();
    cancelSkipUpdate();
  }
});

autoUpdater.on("download-progress", (progress) => {
  if (windows.splash) {
    const formatted = Math.floor(progress.percent);
    windows.splash.webContents.send("progress", formatted);
    windows.splash.setProgressBar(formatted);
  }

  cancelSkipUpdate();
});

autoUpdater.on("update-downloaded", (info) => {
  updateAvailable = true;

  if (windows.splash) {
    windows.splash.webContents.send("relaunch", info);

    setTimeout(() => {
      autoUpdater.quitAndInstall();
    }, TIMES.beforeQuitAndUpdate);
  }

  if (windows.main && !windows.splash) {
    updateNotify(false, info);
  }

  cancelSkipUpdate();
});
