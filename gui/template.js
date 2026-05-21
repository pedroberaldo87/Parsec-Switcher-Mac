const {getInitials} = require("./utils");

function generate_user_card(userNickname, isCurrent){
    return `
<div class="user-card ${isCurrent ? 'active-account' : ''}" id="nick-${userNickname}">
    <div class="user-avatar">
        ${getInitials(userNickname)}
        <div class="status-indicator"></div>
    </div>
    <span class="user-nickname">${userNickname}</span>
    <div class="card-actions">
        <button class="btn-switch" id="switch-btn-${userNickname}" title="${isCurrent ? 'Conta ativa' : 'Trocar para esta conta'}">
            <i class="fa-solid ${isCurrent ? 'fa-circle-check' : 'fa-right-left'}"></i>
            ${isCurrent ? 'Ativa' : 'Trocar'}
        </button>
        <button class="btn-delete" id="delete-btn-${userNickname}" title="Excluir conta">
            <i class="fa-solid fa-trash-can"></i>
        </button>
    </div>
</div>`
}

function generate_yes_no_popup(description, no_text, yes_text) {
    return `
<div class="modal fade" tabindex="-1" role="dialog" id="yes-no-popup">
    <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Confirmação</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar" id="yes-no-popup-backdrop-btn"></button>
            </div>
            <div class="modal-body">
                <h5>${description}</h5>
            </div>
            <div class="modal-footer">
                <button data-bs-dismiss="modal" type="button" class="modal-btn modal-btn-cancel" id="yes-no-popup-negative-btn">${no_text}</button>
                <button data-bs-dismiss="modal" type="button" class="modal-btn modal-btn-danger" id="yes-no-popup-positive-btn">${yes_text}</button>
            </div>
        </div>
    </div>
</div>`
}

function generate_text_input_popup(placeholder, submit_text_button){
    return `
<div class="modal fade" id="text-input-popup" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Nova Conta</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar" id="text-input-popup-backdrop-btn"></button>
            </div>
            <div class="modal-body">
                <h5>${placeholder}</h5>
                <input id="text-input-popup-input-text" type="text" class="input-neon" placeholder="Ex: minha-conta" autocomplete="off" required>
            </div>
            <div class="modal-footer">
                <button type="button" class="modal-btn modal-btn-primary" id="text-input-popup-submit-btn">${submit_text_button}</button>
            </div>
        </div>
    </div>
</div>`
}

function generate_toast(title, description){
    return `
<div class="toast" role="alert" aria-live="assertive" aria-atomic="true">
    <div class="toast-header">
        <i class="fa-solid fa-circle-exclamation" style="color: var(--neon-magenta); margin-right: 8px;"></i>
        <strong class="me-auto">${title}</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Fechar"></button>
    </div>
    <div class="toast-body">${description}</div>
</div>`
}

module.exports = {generate_user_card, generate_yes_no_popup, generate_text_input_popup, generate_toast}
