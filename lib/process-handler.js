const {exec} = require('child_process');
const {global_state} = require("./initialize")
const {error} = require("./error");
const Timeout = require("await-timeout")
const {logger} = require("./logger");
const {isMac} = require("./constants");

function stopProcess(processName){
    return new Promise(async (resolve)=>{
        if (!await findProcess(processName)){
            resolve(true)
            return
        }
        const command = isMac
            ? `killall ${processName}`
            : `stop-process -Name ${processName} -Force`
        const opts = isMac ? {} : {shell: "powershell"}
        exec(command, opts, (err, stdout, stderr)=>{
            resolve(err == null && stderr.length === 0)
        })
    })
}

function startProcess(){
    logger.debug("Inside start")
    let batAndLocation = global_state.locations['parsecdLocation']

    let command
    if (isMac) {
        const appBundlePath = batAndLocation.split('/Contents/')[0]
        command = `open "${appBundlePath}"`
    } else {
        command = `start "${batAndLocation}"`
    }
    const opts = isMac ? {} : {shell: 'powershell.exe'}

    return new Promise((resolve)=>{
        exec(command, opts, (err, stdout, stderr)=>{
            resolve(err == null && stderr.length === 0)
        })
    })
}

function findProcess(processName){
    const command = isMac
        ? `pgrep -x ${processName}`
        : `get-process ${processName}`
    const opts = isMac ? {} : {shell: 'powershell.exe'}
    return new Promise((resolve)=>{
        exec(command, opts, (err, stdout, stderr)=>{
            if (isMac) {
                resolve(err == null)
            } else {
                resolve(err == null && stderr.length === 0)
            }
        })
    })
}

async function stopParsec(){
    if (!isMac) {
        if (!await stopProcess("pservice")){
            return error.STOP_FAILED
        }
    }

    if (!await stopProcess("parsecd")){
        return error.STOP_FAILED
    }

    while (await findProcess('parsecd')){
        await Timeout.set(500)
    }

    logger.debug("stopping parsec done")
    return error.SUCCESS
}

module.exports = {
    startProcess,
    stopProcess,
    findProcess,
    stopParsec,
}