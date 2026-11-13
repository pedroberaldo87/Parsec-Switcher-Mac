const { invoke } = window.__TAURI__.core;

const accountsContainer = document.getElementById('accounts-container');

window.addEventListener('DOMContentLoaded', main);

function switchAccountHandler(nickname) {
    runWithLoading(async () => {
        try {
            await invoke('switch_account', { nickname });
            await render();
        } catch (err) {
            showToast("Erro!", err);
        }
    });
}

async function getParsecVersion() {
    const version = await invoke('get_app_version');
    document.getElementById('parsec_version').textContent = "v" + version;
}

async function render() {
    await getParsecVersion();
    accountsContainer.replaceChildren();

    let state;
    try {
        state = await invoke('list_accounts');
    } catch (err) {
        showToast("Erro!", err);
        return;
    }

    const { accounts, current_user: currentUser } = state;

    if (accounts.length === 0) {
        accountsContainer.append(generate_empty_state());
        return;
    }

    for (const nickname of accounts) {
        const { card, switchBtn, renameBtn, deleteBtn } = generate_user_card(nickname, nickname === currentUser);
        accountsContainer.append(card);

        switchBtn.addEventListener('click', () => switchAccountHandler(nickname));
        card.addEventListener('dblclick', () => switchAccountHandler(nickname));

        renameBtn.addEventListener('click', async function () {
            const newName = await showTextInputPopup(`Novo nome para "${nickname}"`, "Renomear");
            if (!newName) return;
            await runWithLoading(async () => {
                try {
                    await invoke('rename_account', { oldNickname: nickname, newNickname: newName });
                    await render();
                } catch (err) {
                    showToast("Erro!", err);
                }
            });
        });

        deleteBtn.addEventListener('click', async function () {
            const agreed = await showYesNoPopup(`Tem certeza que deseja excluir a conta "${nickname}"?`, "Cancelar", "Excluir");
            if (!agreed) return;
            await runWithLoading(async () => {
                try {
                    await invoke('delete_account', { nickname });
                    await render();
                } catch (err) {
                    showToast("Erro!", err);
                }
            });
        });
    }
}

async function main() {
    try {
        const initResult = await invoke('initialize');
        if (!initResult.parsec_data_found) showToast("Erro!", "Parsec não está instalado");
        if (!initResult.parsecd_found) showToast("Erro!", "Parsec não encontrado no local padrão");
    } catch (err) {
        showToast("Erro!", err);
    }

    document.getElementById('add-account-btn').addEventListener('click', async function () {
        const nickname = await showTextInputPopup("Digite um apelido para a conta", "Adicionar");
        if (!nickname) {
            showToast("Erro!", "Digite um nome válido");
            return;
        }
        await runWithLoading(async () => {
            try {
                await invoke('add_account', { nickname });
                await render();
            } catch (err) {
                showToast("Erro!", err);
            }
        });
    });

    await render();
}
