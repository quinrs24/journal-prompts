# Journal Prompts — answer history + ornament

Upload all six files to the root of your GitHub Pages repository, replacing the existing files. Do not upload the ZIP itself.

## New
- After writing and tapping Done, **View past answers** appears beside that prompt in My session. It reveals previous *saved* responses to the same question, newest first. It does not display previous responses during writing.
- Future saved sessions are indexed in a hidden **Answer History** tab inside your **existing private Google prompts spreadsheet**. The first successful save creates the tab automatically. No new public file, account permissions, or separate spreadsheet ID is required.
- Your existing Google Doc remains the canonical journal. It gets a centered `⋆˚꩜｡⋆` ornament between newly saved sessions, with bold date and prompt headings preserved.
- If a Google Doc save succeeds but indexing fails, the pending index is kept on this device. Open Settings → **Sync answer history** to retry. The app checks entry IDs before indexing to reduce duplicates.

## Limitations and safety
- **Future saves only.** Existing Google Doc entries are not imported.
- The history lookup matches the exact prompt wording (ignoring whitespace/case). Editing a question later may separate older answers from newer ones; stable prompt IDs are not yet implemented.
- Your journal responses are duplicated in the private Google Sheet's hidden history tab. Hidden is not a security control: keep the spreadsheet Restricted, just like your Google Doc.
- Do not clear browser data if Settings shows pending index saves.
- Google Docs and Sheets operations were syntax checked but not live-tested against your account. Save a short disposable test session, verify the Google Doc ornament and the hidden Answer History sheet, then test View past answers on a repeated question.
