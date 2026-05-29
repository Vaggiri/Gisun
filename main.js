const { app, BrowserWindow } = require('electron');
const path = require('path');

// Run the packaged-server.js to spin up Express
require('./packaged-server');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    fullscreen: true,
    frame: false,
    title: 'GisunOS',
    icon: path.join(__dirname, 'client', 'dist', 'logo.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    autoHideMenuBar: true
  });

  // Load local server with automatic retry in case it takes a moment to boot
  const loadPage = () => {
    mainWindow.loadURL('http://localhost:5000').catch((err) => {
      console.log('Express server not ready yet, retrying in 300ms...');
      setTimeout(loadPage, 300);
    });
  };

  loadPage();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
