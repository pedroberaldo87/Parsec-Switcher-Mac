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
    const html = generate_yes_no_popup(description, negative_text, positive_text);
    const popupDiv = document.getElementById("popup-div");
    popupDiv.innerHTML = html;
    const modal = new bootstrap.Modal(document.querySelector("#yes-no-popup"));
    modal.show();

    return new Promise(resolve => {
        const resolveAndClose = result => {
            modal.hide();
            resolve(result);
        }
        document.getElementById('yes-no-popup-backdrop-btn').addEventListener('click', () => resolveAndClose(false));
        document.getElementById('yes-no-popup-negative-btn').addEventListener('click', () => resolveAndClose(false));
        document.getElementById('yes-no-popup-positive-btn').addEventListener('click', () => resolveAndClose(true));
    });
}

async function showTextInputPopup(placeholder, submit_text_button){
    const html = generate_text_input_popup(placeholder, submit_text_button);
    const popupDiv = document.getElementById("popup-div");
    popupDiv.innerHTML = html;
    const modal = new bootstrap.Modal(document.querySelector("#text-input-popup"));
    modal.show();

    const input = document.getElementById('text-input-popup-input-text');

    return new Promise(resolve => {
        const resolveAndClose = result => {
            input.value = "";
            modal.hide();
            resolve(result);
        }
        document.getElementById('text-input-popup-backdrop-btn').addEventListener('click', () => resolveAndClose(null));
        document.getElementById('text-input-popup-submit-btn').addEventListener('click', () => resolveAndClose(input.value));
    });
}

function showToast(title, description){
    const container = document.getElementById("toast-container");
    container.innerHTML = container.innerHTML + generate_toast(title, description);

    const toastElList = document.querySelectorAll(".toast");
    toastElList.forEach((toastEl) => {
        const inst = bootstrap.Toast.getOrCreateInstance(toastEl);
        inst.show();
        toastEl.addEventListener("hidden.bs.toast", () => {
            inst.dispose();
            toastEl.remove();
        }, {once: true});
    });
}
