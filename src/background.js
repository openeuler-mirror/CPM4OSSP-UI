'use strict'

import { app, protocol, BrowserWindow, Menu, globalShortcut } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'

const isDevelopment = process.env.NODE_ENV !== 'production'
const path = require('path')
let toOpenDevTools = null
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true }}
])
let mainWin = null
async function createWindow() {
  try{
    mainWin = new BrowserWindow({
      width: 1400,
      height: 1000,
      show: false,
      backgroundColor: '#2e2c29',
      title: '系统软件安装管理平台',
      webPreferences: {
        nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
        contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
        webSecurity: false 
      }
    })
    const menuTemplate = Menu.buildFromTemplate([
      {
        label: '返回&(Ctrl+B)',
        accelerator: 'Ctrl+B',
        click: () => {
          mainWin.webContents.goBack()
        }
      },
      {
        label: '全屏&(Ctrl+F)',
        accelerator: 'Ctrl+F',
        role: 'togglefullscreen'
      },
      {
        label: '退出&(Ctrl+Q)',
        accelerator: 'Ctrl+Q',
        role: 'close'
      },
      {
        label: '强制刷新&(Ctrl+S)',
        accelerator: 'Ctrl+S',
        role: 'reload'
      }
    ])
    Menu.setApplicationMenu(menuTemplate)
    mainWin.once('ready-to-show', () => {
      mainWin.maximize()
      mainWin.show()
    })
    createProtocol('app')
    mainWin.loadURL('app://./index.html')
    toOpenDevTools = function() {
      mainWin.webContents.openDevTools()
    }
  } catch(error) {
    console.log(error)
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.whenReady().then(() => {
  globalShortcut.register('ctrl+shift+alt+d', () => {
    toOpenDevTools()
  })
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('ready', async() => {
  createWindow()
})

if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
