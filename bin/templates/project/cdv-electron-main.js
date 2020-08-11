/*
    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.
*/

const fs = require('fs');
// Module to control application life, browser window and tray.
const { app, BrowserWindow } = require('electron');
const { autoUpdater } = require("electron-updater")
// Electron settings from .json file.
const cdvElectronSettings = require('./cdv-electron-settings.json');

if (cdvElectronSettings.updateServer) {
    autoUpdater.setFeedURL(cdvElectronSettings.updateServer);
}
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
    // Create the browser window.
    let appIcon;
    if (fs.existsSync(`${__dirname}/img/app.png`)) {
        appIcon = `${__dirname}/img/app.png`;
    } else if (fs.existsSync(`${__dirname}/img/icon.png`)) {
        appIcon = `${__dirname}/img/icon.png`;
    } else {
        appIcon = `${__dirname}/img/logo.png`;
    }

    process.env.GOOGLE_API_KEY = cdvElectronSettings.GOOGLE_API_KEY;
    const browserWindowOpts = Object.assign({}, cdvElectronSettings.browserWindow, { icon: appIcon });
    mainWindow = new BrowserWindow(browserWindowOpts);

    // Load a local HTML file or a remote URL.
    const cdvUrl = cdvElectronSettings.browserWindowInstance.loadURL.url;
    const loadUrl = cdvUrl.includes('://') ? cdvUrl : `file://${__dirname}/${cdvUrl}`;
    const loadUrlOpts = Object.assign({}, cdvElectronSettings.browserWindowInstance.loadURL.options);

    mainWindow.loadURL(loadUrl, loadUrlOpts);

    // Open the DevTools.
    if (cdvElectronSettings.browserWindow.webPreferences.devTools) {
        mainWindow.webContents.openDevTools();
    }

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
        mainWindow = null;
    });
}

var gotTheLock  = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.{app}.
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
