'use strict'

import { app, protocol, BrowserWindow, Menu, globalShortcut } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'

const isDevelopment = process.env.NODE_ENV !== 'production'
const path = require('path');

let mainWin = null
let toOpenDevTools = null

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  try {
    mainWin = new BrowserWindow({
      width: 1400,
      height: 1000,
      show: false,
      backgroundColor: '#2e2c29',
      title: '系统软件安装管理平台',
      webPreferences: {
        nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION === 'true',
        contextIsolation: process.env.ELECTRON_NODE_INTEGRATION !== 'true',
        webSecurity: true
      }
    })

    // 设置菜单栏
    const menuTemplate = [
      {
        label: '返回&(Ctrl+B)',
        accelerator: 'Ctrl+B',
        click: () => mainWin.webContents.goBack()
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
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate))

    // 显示窗口
    mainWin.once('ready-to-show', () => {
      mainWin.maximize()
      mainWin.show()
    })

    // 加载页面
    createProtocol('app')
    mainWin.loadURL('app://./index.html')

    // 打开开发者工具
    toOpenDevTools = () => mainWin.webContents.openDevTools()
  } catch (error) {
    console.error('Failed to create window:', error)
  }
}

// 监听应用事件
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.whenReady().then(() => {
  globalShortcut.register('ctrl+shift+alt+d', toOpenDevTools)
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on('ready', createWindow)

// 开发环境下的优雅退出
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
