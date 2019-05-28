const electron = require("electron")
const url = require("url")
const path = require("path")

const {
    app,
    BrowserWindow,
    Menu,
    ipcMain
} = electron

process.env.NODE_ENV = "production"

let mainWindow
let addWindow

app.on("ready", () => {
    mainWindow
        = new BrowserWindow({
            webPreferences: {
                nodeIntegration: true
            }
        })
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, "mainWindow.html"),
        protocol: "file:",
        slashes: true
    }))
    mainWindow.on("closed", () => [
        app.quit()
    ])
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)
    Menu.setApplicationMenu(mainMenu)
})

function createAddWindow() {
    addWindow
        = new BrowserWindow({
            width: 300,
            height: 200,
            webPreferences: {
                nodeIntegration: true
            }
        })
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, "addWindow.html"),
        protocol: "file:",
        slashes: true
    }))

    addWindow.on("close", () => [
        addWindow = null
    ])
}

ipcMain.on("item:add", (e, item) => {
    mainWindow.webContents.send("item:add", item)
    addWindow.close()
})


const mainMenuTemplate = [{
    label: "File",
    submenu: [{
        label: "Add Item",
        click() {
            createAddWindow()
        }
    }, {
        label: "Clear Items",
        click() {
            mainWindow.webContents.send("item:clear")
        }
    }, {
        label: "Quit",
        accelerator: process.platform == "darwin" ? 'Cmd+Q' : "Ctrl+Q",
        click() {
            app.quit()
        }
    }]
}]

if (process.platform === "darwin")
    mainMenuTemplate.unshift({
        label: ""
    })

if (process.env.NODE_ENV != "production")
    mainMenuTemplate.push({
        label: "Dev",
        submenu: [{
            label: "Toggle dev tools",
            accelerator: process.platform == "darwin" ? 'Cmd+I' : "Ctrl+I",

            click(item, focusWindow) {
                focusWindow.toggleDevTools()
            }
        }, {
            role: 'reload'
        }]
    })