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
