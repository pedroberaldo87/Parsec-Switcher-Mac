async function runWithLoading(toRun) {
    const loadingOverlay = document.getElementById('loading-overlay');
    try {
        loadingOverlay.style.display = "flex";
        await toRun();
    } finally {
        loadingOverlay.style.display = "none";
    }
}

async function showYesNoPopup(description, negative_text, positive_text){
    const { root, closeBtn, noBtn, yesBtn } = generate_yes_no_popup(description, negative_text, positive_text);
    document.getElementById("popup-div").replaceChildren(root);
    const modal = new bootstrap.Modal(root);
    modal.show();

    return new Promise(resolve => {
        const resolveAndClose = result => {
            modal.hide();
            resolve(result);
        }
        closeBtn.addEventListener('click', () => resolveAndClose(false));
        noBtn.addEventListener('click', () => resolveAndClose(false));
        yesBtn.addEventListener('click', () => resolveAndClose(true));
    });
}

async function showTextInputPopup(placeholder, submit_text_button){
    const { root, closeBtn, input, submitBtn } = generate_text_input_popup(placeholder, submit_text_button);
    document.getElementById("popup-div").replaceChildren(root);
    const modal = new bootstrap.Modal(root);
    modal.show();

    return new Promise(resolve => {
        const resolveAndClose = result => {
            input.value = "";
            modal.hide();
            resolve(result);
        }
        closeBtn.addEventListener('click', () => resolveAndClose(null));
        submitBtn.addEventListener('click', () => resolveAndClose(input.value));
    });
}

function showToast(title, description){
    const container = document.getElementById("toast-container");
    const toastEl = generate_toast(title, description);
    container.append(toastEl);

    const inst = bootstrap.Toast.getOrCreateInstance(toastEl);
    toastEl.addEventListener("hidden.bs.toast", () => {
        inst.dispose();
        toastEl.remove();
    }, {once: true});
    inst.show();
}
