const { ipcMain, dialog, clipboard } = require("electron");
const { autoUpdater } = require("electron-updater");
const fs = require("fs");

const { getVersionString } = require("./util");

const RegisterIpcHandler = () => {
  ipcMain.on("checkForUpdates", () => {
    autoUpdater.checkForUpdates();
  });

  ipcMain.on("openAbout", async () => {
    const versionString = getVersionString();

    const { response } = await dialog.showMessageBox({
      type: "info",
      title: "Vocascan",
      message: versionString,
      noLink: true,
      buttons: ["Ok", "Copy"],
    });

    if (response === 1) {
      clipboard.writeText(versionString);
    }
  });

  ipcMain.on("save-file", (event, arg) => {
    dialog
      .showSaveDialog({
        title: "Select where you want to save the file",
        buttonLabel: "Save",
        // Restricting the user to only json Files.
        filters: [
          {
            name: "JSON file",
            extensions: ["json"],
          },
        ],
        properties: [],
      })
      .then((file) => {
        if (!file.canceled) {
          // Creating and Writing to the json file
          fs.writeFile(file.filePath.toString(), arg, function (err) {
            if (err) throw err;
          });
          event.sender.send("save-file-reply");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

module.exports = {
  RegisterIpcHandler,
};
