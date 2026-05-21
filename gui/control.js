const PSS = require("../lib/account-handler");
const templates = require("./template");
const { global_state } = require("../lib/initialize");
const { initialize } = require("../lib/initialize");
const { errorToMessage, error } = require("../lib/error");
const { showToast, showYesNoPopup, showTextInputPopup, runWithLoading } = require("./elements");
const { beforeQuit } = require("../lib/before-quit")
const { logger } = require("../lib/logger");
const { shell } = require('electron');

const accountsContainer = document.getElementById('accounts-container');

window.addEventListener('unload', beforeQuit)
window.addEventListener('DOMContentLoaded', main)

function switchAccountHandler(nickname) {
  runWithLoading(async () => {
    logger.debug(`switching ${nickname}`)
    const err = await PSS.switchAccount(nickname);
    if (!err) return;
    showToast("Erro!", errorToMessage[err])
  });
}

function checkAdminAccess(){
    if (process.platform === 'darwin') {
        document.getElementById("admin-priv").style.display = "none";
        return;
    }
    let exec = require('child_process').exec;
    exec('NET SESSION', function(err,so,se) {
        document.getElementById("admin-priv").style.display = se.length === 0 ? "none" : "block";
    });
}

function getParsecVersion(){
    const packageVals = require('../package.json')
    document.getElementById('parsec_version').innerHTML = "v" + packageVals.version;
}

function render() {
    logger.debug("rendering");
    checkAdminAccess();
    getParsecVersion();
    accountsContainer.innerHTML = "";

    const state = PSS.returnAccountList();
    const {accounts, currentUser} = state;

    if (accounts.length === 0) {
        accountsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-users-slash"></i>
                <p>Nenhuma conta cadastrada</p>
            </div>`;
        return;
    }

    logger.debug(JSON.stringify(accounts));
    for (const nickname of accounts) {
        const userCardString = templates.generate_user_card(nickname, nickname === currentUser);
        accountsContainer.insertAdjacentHTML('beforeend', userCardString);

        document.getElementById(`switch-btn-${nickname}`).addEventListener('click', ()=>switchAccountHandler(nickname));
        document.getElementById(`nick-${nickname}`).addEventListener('dblclick', ()=>switchAccountHandler(nickname));

        document.getElementById(`delete-btn-${nickname}`).addEventListener('click', async function () {
            const agreed = await showYesNoPopup(`Tem certeza que deseja excluir a conta "${nickname}"?`, "Cancelar", "Excluir");
            if (!agreed) return;
            logger.debug(`deleting ${nickname}`)
            const err = await PSS.deleteAccount(nickname);
            if (!err) return;
            showToast("Erro!", errorToMessage[err])
        });
    }
}

async function main() {
    const errorCode = await initialize();
    logger.debug("initializing")
    if (errorCode) showToast("Erro!", errorToMessage[errorCode]);
    if (!global_state.flags.parsecDataLocationFound) showToast("Erro!", errorToMessage[error.PARSEC_NOT_INSTALLED])
    if (!global_state.flags.parsecdFound) showToast("Erro!", errorToMessage[error.PARSECD_NOT_IN_DEFAULT]);

    global_state.onConfigChanged.push(render);
    document.getElementById('add-account-btn').addEventListener('click', async function () {
        const nickname = await showTextInputPopup("Digite um apelido para a conta", "Adicionar");
        if (!nickname) {
            showToast("Erro!", "Digite um nome válido");
            return;
        }
        await runWithLoading(async () => {
            const err = await PSS.addAccount(nickname);
            if (!err) return;
            showToast("Erro!", errorToMessage[err]);
        });
    });
    render();
}
