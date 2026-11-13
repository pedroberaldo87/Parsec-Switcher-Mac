// DOM builders. Every dynamic value (nicknames, messages) goes in through
// textContent / setAttribute, never through HTML strings.

function el(tag, { className, text, attrs, style } = {}, children = []) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    if (attrs) for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    if (style) for (const [k, v] of Object.entries(style)) node.style.setProperty(k, v);
    for (const child of children) node.append(child);
    return node;
}

function icon(classes) {
    return el('i', { className: classes });
}

function generate_user_card(userNickname, isCurrent) {
    const switchBtn = el('button', {
        className: 'btn-switch',
        attrs: { title: isCurrent ? 'Conta ativa' : 'Trocar para esta conta' },
    }, [
        icon(`fa-solid ${isCurrent ? 'fa-circle-check' : 'fa-right-left'}`),
        document.createTextNode(isCurrent ? ' Ativa' : ' Trocar'),
    ]);
    const renameBtn = el('button', { className: 'btn-rename', attrs: { title: 'Renomear conta' } }, [icon('fa-solid fa-pen')]);
    const deleteBtn = el('button', { className: 'btn-delete', attrs: { title: 'Excluir conta' } }, [icon('fa-solid fa-trash-can')]);

    const card = el('div', { className: `user-card${isCurrent ? ' active-account' : ''}` }, [
        el('div', { className: 'user-avatar' }, [
            document.createTextNode(getInitials(userNickname)),
            el('div', { className: 'status-indicator' }),
        ]),
        el('span', { className: 'user-nickname', text: userNickname }),
        el('div', { className: 'card-actions' }, [switchBtn, renameBtn, deleteBtn]),
    ]);
    return { card, switchBtn, renameBtn, deleteBtn };
}

function generate_empty_state() {
    return el('div', { className: 'empty-state' }, [
        icon('fa-solid fa-users-slash'),
        el('p', { text: 'Nenhuma conta cadastrada' }),
    ]);
}

function generate_yes_no_popup(description, no_text, yes_text) {
    const closeBtn = el('button', {
        className: 'btn-close',
        attrs: { type: 'button', 'data-bs-dismiss': 'modal', 'aria-label': 'Fechar' },
    });
    const noBtn = el('button', {
        className: 'modal-btn modal-btn-cancel',
        text: no_text,
        attrs: { type: 'button', 'data-bs-dismiss': 'modal' },
    });
    const yesBtn = el('button', {
        className: 'modal-btn modal-btn-danger',
        text: yes_text,
        attrs: { type: 'button', 'data-bs-dismiss': 'modal' },
    });
    const root = el('div', { className: 'modal fade', attrs: { tabindex: '-1', role: 'dialog' } }, [
        el('div', { className: 'modal-dialog modal-dialog-centered', attrs: { role: 'document' } }, [
            el('div', { className: 'modal-content' }, [
                el('div', { className: 'modal-header' }, [el('h5', { className: 'modal-title', text: 'Confirmação' }), closeBtn]),
                el('div', { className: 'modal-body' }, [el('h5', { text: description })]),
                el('div', { className: 'modal-footer' }, [noBtn, yesBtn]),
            ]),
        ]),
    ]);
    return { root, closeBtn, noBtn, yesBtn };
}

function generate_text_input_popup(placeholder, submit_text_button) {
    const closeBtn = el('button', {
        className: 'btn-close',
        attrs: { type: 'button', 'data-bs-dismiss': 'modal', 'aria-label': 'Fechar' },
    });
    const input = el('input', {
        className: 'input-neon',
        attrs: { type: 'text', placeholder: 'Ex: minha-conta', autocomplete: 'off', required: '' },
    });
    const submitBtn = el('button', {
        className: 'modal-btn modal-btn-primary',
        text: submit_text_button,
        attrs: { type: 'button' },
    });
    const root = el('div', { className: 'modal fade', attrs: { tabindex: '-1' } }, [
        el('div', { className: 'modal-dialog modal-dialog-centered' }, [
            el('div', { className: 'modal-content' }, [
                el('div', { className: 'modal-header' }, [el('h5', { className: 'modal-title', text: 'Nova Conta' }), closeBtn]),
                el('div', { className: 'modal-body' }, [el('h5', { text: placeholder }), input]),
                el('div', { className: 'modal-footer' }, [submitBtn]),
            ]),
        ]),
    ]);
    return { root, closeBtn, input, submitBtn };
}

function generate_toast(title, description) {
    const closeBtn = el('button', {
        className: 'btn-close',
        attrs: { type: 'button', 'data-bs-dismiss': 'toast', 'aria-label': 'Fechar' },
    });
    return el('div', { className: 'toast', attrs: { role: 'alert', 'aria-live': 'assertive', 'aria-atomic': 'true' } }, [
        el('div', { className: 'toast-header' }, [
            el('i', {
                className: 'fa-solid fa-circle-exclamation',
                style: { color: 'var(--neon-magenta)', 'margin-right': '8px' },
            }),
            el('strong', { className: 'me-auto', text: title }),
            closeBtn,
        ]),
        el('div', { className: 'toast-body', text: String(description) }),
    ]);
}
