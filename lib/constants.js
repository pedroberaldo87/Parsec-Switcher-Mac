const path = require('path')
const os = require("os")

const isMac = process.platform === 'darwin'

const appDataPath = isMac
    ? path.join(os.homedir(), 'Library', 'Application Support', 'parsec-switcher')
    : path.join(os.homedir(), 'AppData', 'Roaming', 'parsec-switcher');

const configPath = path.join(appDataPath,'config.json')

const dataPath = path.join(appDataPath,'account_data.json')

const multiUserPath = path.join(appDataPath,'MultiUser')

const defaultUserPath = path.join(multiUserPath,'default')

const parsecDataLocationOther = isMac
    ? path.join(os.homedir(), '.parsec')
    : "C:\\ProgramData\\Parsec"

const parsecDataLocationDefault = isMac
    ? path.join(os.homedir(), '.parsec')
    : path.join(appDataPath,'..','Parsec')

const projectRoot = path.join(__dirname,'..')

const indexJSPathNew = path.join(projectRoot,'gui','gui_cli.js')

const iconPathNew = isMac
    ? path.join(projectRoot,'icon.icns')
    : path.join(projectRoot,'icon.ico')

const electronPathNew = isMac
    ? path.join(projectRoot,'node_modules','.bin','electron')
    : path.join(projectRoot,'node_modules','.bin','electron.cmd')

const htmlPath = path.join(projectRoot,'gui','index.html')

module.exports = {
    isMac,
    appDataPath,
    configPath,
    dataPath,
    multiUserPath,
    defaultUserPath,
    parsecDataLocationOther,
    parsecDataLocationDefault,
    indexJsPath: indexJSPathNew,
    iconPath: iconPathNew,
    electronPath: electronPathNew,
    htmlPath
}