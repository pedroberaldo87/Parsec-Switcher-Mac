# ParsecSwitcher for macOS

[Português](README.pt-BR.md)

Keep several [Parsec](https://parsec.app) accounts on one Mac and switch between them without logging out and back in.

A macOS port (Tauri v2, Rust) of [DefineX-Studios/parsec-switcher](https://github.com/DefineX-Studios/parsec-switcher), the original Windows/Electron app. Full credit for the idea and the original app goes to DefineX Studios and its contributors. This repository keeps their commit history. The app's interface is in Portuguese.

## Install

1. Install Parsec in `/Applications` (the app starts and stops `/Applications/Parsec.app`).
2. Download the latest `.dmg` from the [Releases page](https://github.com/pedroberaldo87/Parsec-Switcher-Mac/releases/latest) and drag **ParsecSwitcher** to `/Applications`.

**Apple Silicon only.** The release is built on an Apple Silicon Mac, so it runs on M1 and newer Macs. For an Intel Mac, build from source (below).

### The app is not signed or notarized

It has no Apple Developer ID, so macOS Gatekeeper blocks it the first time ("cannot be opened because the developer cannot be verified", or "is damaged"). The code is public and you can read or build it yourself. If you trust it, do one of these:

- **macOS 14 and earlier:** right-click `ParsecSwitcher.app`, choose **Open**, then **Open** again in the dialog.
- **macOS 15 and later:** try to open the app once, then go to **System Settings → Privacy & Security**, scroll to the message about ParsecSwitcher and click **Open Anyway**.
- **Terminal, any version:** remove the quarantine flag.

  ```sh
  xattr -dr com.apple.quarantine /Applications/ParsecSwitcher.app
  ```

You only need to do this once per downloaded copy.

## How it works

Parsec keeps the logged-in session in `~/.parsec/user.bin`. ParsecSwitcher stores one `user.bin` per account under `~/Library/Application Support/parsec-switcher/MultiUser/<nickname>/`. When you switch, it quits Parsec, swaps the file, and starts Parsec again. It does not read, send or modify the contents of those files, and it makes no network requests.

The first time it runs it adopts your current Parsec session as the account called `default`. Rename it from the app.

## Build from source

Requirements: macOS, [Rust](https://rustup.rs) (stable), Node.js 20+ (only for the front-end checks).

```sh
cargo install tauri-cli --version 2.12.4 --locked
cargo tauri build          # DMG in src-tauri/target/release/bundle/dmg/
cargo tauri dev            # run in development

cd src-tauri && cargo test # Rust tests
node --test tests/*.test.mjs  # front-end checks
```

## Releases

The DMG on the Releases page is built locally by the maintainer, never by GitHub Actions. CI only runs the tests (`.github/workflows/tests.yml`). Each release has a `SHA256SUMS` file next to the DMG. To check your download:

```sh
shasum -a 256 -c SHA256SUMS
```

Maintainers: `scripts/release-local.sh <version>` checks that the version matches `tauri.conf.json`, `Cargo.toml` and `package.json`, runs the tests, builds the DMG, verifies its signature and writes `SHA256SUMS`. It prints the `git tag`, `git push` and `gh release create --draft` commands. With `--publish` it runs them, creating a draft release that you publish by hand.

## Credits and license

- Original app and idea: [DefineX Studios](https://github.com/DefineX-Studios/parsec-switcher) and contributors (MIT).
- macOS port: [pedroberaldo87](https://github.com/pedroberaldo87).
- Bundled third-party files (Bootstrap, Font Awesome Free, Orbitron, Outfit) are listed in [`gui/vendor/README.md`](gui/vendor/README.md).

MIT. See [LICENSE](LICENSE).

ParsecSwitcher is an independent project and is not affiliated with or endorsed by Parsec.
