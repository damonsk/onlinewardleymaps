'use strict';
const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// Keep a reference for dev mode
let dev = false;

if (
	process.defaultApp ||
	/[\\/]electron-prebuilt[\\/]/.test(process.execPath) ||
	/[\\/]electron[\\/]/.test(process.execPath)
) {
	dev = true;
}

// Temporary fix broken high-dpi scale factor on Windows (125% scaling)
// info: https://github.com/electron/electron/issues/9691
if (process.platform === 'win32') {
	app.commandLine.appendSwitch('high-dpi-support', 'true');
	app.commandLine.appendSwitch('force-device-scale-factor', '1');
}

const isMac = process.platform === 'darwin';
const appCommandSender = arg => {
	return (item, focusedWindow) => {
		if (focusedWindow) {
			focusedWindow.webContents.send('appCommand', arg);
		}
	};
};

const template = [
	...(isMac
		? [
				{
					label: app.name,
					submenu: [
						{ role: 'about' },
						{ type: 'separator' },
						{ role: 'services' },
						{ type: 'separator' },
						{ role: 'hide' },
						{ role: 'hideothers' },
						{ role: 'unhide' },
						{ type: 'separator' },
						{ role: 'quit' },
					],
				},
		  ]
		: []),
	// { role: 'fileMenu' }
	{
		label: 'File',
		submenu: [
			{
				role: 'new',
				label: 'New Map',
				click: appCommandSender({ action: 'new-file' }),
			},
			{
				role: 'new',
				label: 'New Window',
				click: appCommandSender({ action: 'new-window' }),
			},
			{ type: 'separator' },
			{
				role: 'open',
				label: 'Open...',
				click: appCommandSender({ action: 'open-file' }),
			},
			{ type: 'separator' },
			{
				role: 'save',
				label: 'Save',
				click: appCommandSender({ action: 'save-file' }),
			},
			{
				role: 'save',
				label: 'Save As...',
				click: appCommandSender({ action: 'save-as' }),
			},
			{
				role: 'save',
				label: 'Export PNG',
				click: appCommandSender({ action: 'export' }),
			},
			{ type: 'separator' },
			isMac ? { role: 'close' } : { role: 'quit' },
		],
	},
	{
		label: 'Edit',
		submenu: [
			{ role: 'undo' },
			{ role: 'redo' },
			{ type: 'separator' },
			{ role: 'cut' },
			{ role: 'copy' },
			{ role: 'paste' },
			...(isMac
				? [
						{ role: 'pasteAndMatchStyle' },
						{ role: 'delete' },
						{ role: 'selectAll' },
						{ type: 'separator' },
						{
							label: 'Speech',
							submenu: [{ role: 'startspeaking' }, { role: 'stopspeaking' }],
						},
				  ]
				: [{ role: 'delete' }, { type: 'separator' }, { role: 'selectAll' }]),
		],
	},
	// { role: 'viewMenu' }
	{
		label: 'View',
		submenu: [
			{ role: 'reload' },
			{ role: 'forcereload' },
			{ role: 'toggledevtools' },
			{ type: 'separator' },
			{ role: 'resetzoom' },
			{ role: 'zoomin' },
			{ role: 'zoomout' },
			{ type: 'separator' },
			{ role: 'togglefullscreen' },
		],
	},
	// { role: 'windowMenu' }
	{
		label: 'Window',
		submenu: [
			{ role: 'minimize' },
			{ role: 'zoom' },
			...(isMac
				? [
						{ type: 'separator' },
						{ role: 'front' },
						{ type: 'separator' },
						{ role: 'window' },
				  ]
				: [{ role: 'close' }]),
		],
	},
	{
		role: 'help',
		submenu: [
			{
				label: 'Learn More',
				click: async () => {
					const { shell } = require('electron');
					await shell.openExternal('https://electronjs.org');
				},
			},
		],
	},
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1024,
		height: 768,
		show: false,
		webPreferences: {
			nodeIntegration: true,
		},
	});

	// and load the index.html of the app.
	let indexPath;

	if (dev && process.argv.indexOf('--noDevServer') === -1) {
		indexPath = url.format({
			protocol: 'http:',
			host: 'localhost:8080',
			pathname: 'index.html',
			slashes: true,
		});
	} else {
		indexPath = url.format({
			protocol: 'file:',
			pathname: path.join(__dirname, 'dist', 'index.html'),
			slashes: true,
		});
	}

	mainWindow.loadURL(indexPath);

	// Don't show until we are ready and loaded
	mainWindow.once('ready-to-show', () => {
		mainWindow.show();

		// Open the DevTools automatically if developing
		if (dev) {
			const {
				default: installExtension,
				REACT_DEVELOPER_TOOLS,
			} = require('electron-devtools-installer');
			installExtension(REACT_DEVELOPER_TOOLS).catch(err =>
				console.log('Error loading React DevTools: ', err)
			);
			mainWindow.webContents.openDevTools();
		}
	});

	// Emitted when the window is closed.
	mainWindow.on('closed', function() {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null;
	});
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		createWindow();
	}
});

ipcMain.on('new-window', () => {
	createWindow();
});

ipcMain.on('save-file', (e, d) => {
	console.log(d);
	let options = {
		title: 'Save Map',
		buttonLabel: 'Save',
		filters: [
			{ name: 'WardleyMaps', extensions: ['owm'] },
			{ name: 'Plain Text', extensions: ['txt'] },
			{ name: 'All Files', extensions: ['*'] },
		],
		properties: ['saveFile'],
	};

	if (d.new == true && d.filePath !== undefined && d.filePath.length > 0) {
		options.defaultPath = d.filePath;
	}

	if (d.new) {
		dialog.showSaveDialog(mainWindow, options).then(s => {
			if (s.canceled == false) {
				fs.writeFileSync(s.filePath, d.d);
				e.sender.send('save-file-changed', { filePath: s.filePath });
			}
		});
	} else {
		fs.writeFileSync(d.filePath, d.d);
	}

	console.log(d);
});

ipcMain.on('open-file', (e, d) => {
	let options = {
		title: 'Open Map',
		buttonLabel: 'Open',
		filters: [
			{ name: 'WardleyMaps', extensions: ['owm'] },
			{ name: 'Plain Text', extensions: ['txt'] },
			{ name: 'All Files', extensions: ['*'] },
		],
		properties: ['openFile'],
	};

	dialog.showOpenDialog(mainWindow, options).then(open => {
		if (open.canceled == false) {
			let d = fs.readFileSync(open.filePaths[0]).toString();
			e.sender.send('loaded-file', { data: d, filePath: open.filePaths[0] });
		}
	});

	console.log(d);
});
