# Journal Prompts — simplified update

Upload all six files to the **root** of your existing GitHub Pages repository, replacing the current files. Do not upload the containing folder.

## What's changed
- Removed Forward; Back and Shuffle remain.
- Removed Past Entries tab and encrypted backup/restore UI.
- Renamed Backup & privacy to Settings.
- Google sign-in welcome screen; after authorizing, the app opens and syncs prompts.
- Existing saved local drafts remain available through **Open my saved draft without signing in**.
- Failed/unconfirmed Google Doc saves remain accessible in Settings, including retry.
- Existing prompt library, Writing Mode, Google Sheets/Docs sync, edit/delete, and automatic dark mode remain.

## Important
- Google OAuth access tokens are held in browser memory, not permanently stored. You may be asked to sign in again after refreshing/reopening the app. This is expected and safer than storing Google access tokens in localStorage.
- Do not delete local browser/site data if you have an unsaved draft or an unconfirmed save.
- A failed/uncertain Google Doc save may already have appended the entry; check the Doc before retrying.
- Your private Google Sheet and Doc remain private. Do not publish a client secret or access token.
- This update does not modify or delete any existing Google Docs entries or Sheet prompts.

## Suggested quick test
1. Open site and connect Google.
2. Confirm prompt count and shuffle/back.
3. Edit a disposable prompt and confirm it syncs.
4. Write a short test session and save to Google Doc.
5. Check the app on a phone and in dark mode.
