# ParsecSwitcher para macOS

[English](README.md)

Mantenha várias contas do [Parsec](https://parsec.app) no mesmo Mac e alterne entre elas sem sair e entrar de novo.

Port para macOS (Tauri v2, Rust) do [DefineX-Studios/parsec-switcher](https://github.com/DefineX-Studios/parsec-switcher), o app original para Windows/Electron. O crédito da ideia e do app original é da DefineX Studios e de seus colaboradores. Este repositório mantém o histórico de commits deles. A interface do app está em português.

## Instalação

1. Instale o Parsec em `/Applications` (o app abre e fecha o `/Applications/Parsec.app`).
2. Baixe o `.dmg` mais recente na [página de Releases](https://github.com/pedroberaldo87/Parsec-Switcher-Mac/releases/latest) e arraste o **ParsecSwitcher** para `/Applications`.

**Só Apple Silicon.** A versão publicada é compilada em um Mac Apple Silicon, então roda em Macs M1 ou mais novos. Em um Mac Intel, compile a partir do código-fonte (abaixo).

### O app não é assinado nem notarizado

Ele não tem Developer ID da Apple, então o Gatekeeper do macOS bloqueia na primeira abertura ("não pode ser aberto porque o desenvolvedor não pode ser verificado" ou "está danificado"). O código é público e você pode ler ou compilar por conta própria. Se você confia nele, faça um destes:

- **macOS 14 ou anterior:** clique com o botão direito em `ParsecSwitcher.app`, escolha **Abrir** e confirme em **Abrir** no aviso.
- **macOS 15 ou posterior:** tente abrir o app uma vez, vá em **Ajustes do Sistema → Privacidade e Segurança**, role até a mensagem sobre o ParsecSwitcher e clique em **Abrir Mesmo Assim**.
- **Terminal, qualquer versão:** remova a marca de quarentena.

  ```sh
  xattr -dr com.apple.quarantine /Applications/ParsecSwitcher.app
  ```

Isso é necessário uma vez por cópia baixada.

## Como funciona

O Parsec guarda a sessão logada em `~/.parsec/user.bin`. O ParsecSwitcher guarda um `user.bin` por conta em `~/Library/Application Support/parsec-switcher/MultiUser/<apelido>/`. Ao trocar de conta, ele fecha o Parsec, troca o arquivo e abre o Parsec de novo. Ele não lê, não envia e não altera o conteúdo desses arquivos, e não faz requisições de rede.

Na primeira execução, ele adota a sua sessão atual do Parsec como a conta `default`. Renomeie pelo app.

## Compilar a partir do código-fonte

Requisitos: macOS, [Rust](https://rustup.rs) (stable), Node.js 20+ (só para as checagens do front-end).

```sh
cargo install tauri-cli --version 2.12.4 --locked
cargo tauri build          # DMG em src-tauri/target/release/bundle/dmg/
cargo tauri dev            # rodar em desenvolvimento

cd src-tauri && cargo test # testes de Rust
node --test tests/*.test.mjs  # checagens do front-end
```

## Releases

O DMG da página de Releases é compilado localmente pelo mantenedor, nunca pelo GitHub Actions. O CI só roda os testes (`.github/workflows/tests.yml`). Cada release traz um arquivo `SHA256SUMS` junto do DMG. Para conferir o seu download:

```sh
shasum -a 256 -c SHA256SUMS
```

Mantenedores: `scripts/release-local.sh <versão>` confere se a versão bate com `tauri.conf.json`, `Cargo.toml` e `package.json`, roda os testes, compila o DMG, verifica a assinatura e escreve o `SHA256SUMS`. Ele imprime os comandos `git tag`, `git push` e `gh release create --draft`. Com `--publish` ele os executa e cria um rascunho de release que você publica à mão.

## Créditos e licença

- App e ideia originais: [DefineX Studios](https://github.com/DefineX-Studios/parsec-switcher) e colaboradores (MIT).
- Port para macOS: [pedroberaldo87](https://github.com/pedroberaldo87).
- Os arquivos de terceiros incluídos (Bootstrap, Font Awesome Free, Orbitron, Outfit) estão listados em [`gui/vendor/README.md`](gui/vendor/README.md).

MIT. Veja o [LICENSE](LICENSE).

O ParsecSwitcher é um projeto independente, sem vínculo nem aval do Parsec.
