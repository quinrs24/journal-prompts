# Journal Prompts

A free, local-first journaling prompt app. No accounts, analytics, or cloud database.

## Publish with GitHub Pages

1. Create a **public** GitHub repository named `journal-prompts` (the repository will contain app code only; **never upload journal backups or entries**).
2. Upload `index.html`, `app.js`, `sw.js`, `manifest.webmanifest`, and `icon.svg` to the root of the repository.
3. Go to **Settings → Pages → Build and deployment**, select **Deploy from a branch**, select `main` and `/ (root)`, then Save.
4. Once Pages is live, open the site in Safari on iPhone, tap Share → **Add to Home Screen**. On Mac, open the same URL in a normal browser window.

## Privacy and storage

- Journal text and custom prompts are stored using browser `localStorage` on each device, separately. They are **not** sent to GitHub, a database, or an analytics service by this app.
- Browser storage is **not encrypted or password-protected**. Anyone who can access the unlocked device/browser profile may be able to read it.
- Clearing website data, private browsing, changing browser profiles, uninstalling an installed app, or device failure may erase journal data. Storage may differ between Safari and a Home Screen installation.
- Export encrypted backups regularly using **Backup & privacy**. Backups use AES-GCM with a passphrase-derived key (PBKDF2-SHA256). The app cannot recover a forgotten passphrase. Keep backup files and passphrases safe.
- GitHub Pages serves the public app code and may log visits. The browser retrieves app files from GitHub, but the app does not transmit journal content.
- The service worker caches only static app files for offline use; journal text is not part of the cache.
- This is a personal project, not a professionally audited secure journaling product. For very sensitive material, device encryption, strong device passcodes, and regular encrypted backups are important.

## Updating

Changes to the app code can be uploaded to the repository. To make a new version of the offline cache, increment `CACHE` in `sw.js`. Never commit exported backup files to the repository.

## New in this update
- Past entries show the original saved date and time.
- Export all saved sessions to a Word (.docx) document from Past entries. The Word export is not encrypted; store it privately.
- Existing local entries are preserved because the storage key is unchanged.


## Roomier writing area
The session response fields are now document-sized (approximately 440px tall on phones and 480px on larger screens), and can still be resized manually on desktop. Existing Google syncing, saved drafts, and journal upload behavior are unchanged.


## Writing mode update
- One prompt at a time in a distraction-free, borderless writing page.
- Writing text 14px; prompt heading 17px.
- Tap Done to return to My session; tap + Add prompt to go back to the generator.
- Draft answers continue to use the existing localStorage data model and save on every input.
- Save session still appends all prompts and responses to the configured Google Doc.
- Service worker cache version bumped so installed apps receive the updated assets.

**Before updating:** keep a copy of the current website files. Test a sample draft and Google Doc save before relying on it for important writing.

### Delete a prompt while shuffling
The **Delete this prompt** button removes the currently displayed question from the master Google Sheet after confirmation. Google must be connected. Existing session drafts and previously saved writing are unaffected.

## Google Doc formatting update
New saved sessions now bold the date/time and each prompt, while leaving responses regular weight. Existing entries are unchanged. The app reads the Doc end position and applies formatting in the same Google Docs batch update as the text insertion.


## October 2026 update: edit, shuffle history, automatic dark mode

- **Edit this prompt**: When connected to Google, revise the current question in a browser dialog. The app updates the matching row in the authoritative Google Sheet, keeping its place in the list. Existing journal entries are not rewritten.
- **Back / Forward**: Browse the prompts you saw during this open app session. Shuffling after going back creates a new path. History is temporary and is not shared across devices.
- **Automatic dark mode**: Follows the device/browser `prefers-color-scheme` setting, with no toggle and no tracking.
- **Unchanged**: Writing Mode, draft autosave, Google Doc formatting and saving, prompt deletion, and Google Sheet syncing.

Google Sheets editing requires an active Google sign-in. Try editing a disposable prompt first. After deployment, refresh or reopen the installed app if you see an older cached version.
