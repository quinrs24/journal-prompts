# Journal Prompts — Free write & shuffled library

Upload the six files in this ZIP to the root of your existing GitHub Pages repository, replacing the matching files. Wait for deployment, then close and reopen or refresh the app.

- **Prompt library:** randomly ordered each time you open the tab (including after an app refresh), with its own Shuffle button. Favoriting and background syncing do not reshuffle the current list. The display order does not rearrange rows in Google Sheets.
- **Free write:** button beside Keep this prompt opens a blank writing entry immediately, even with an empty prompt library. It joins My session and saves to Google Docs and the dated answer index just like a prompted entry, under the heading “Free write.” It does not add a question to the library. Free writes can appear in On This Day and share a past-answer history.
- **Writing size:** phones keep the 16px writing font intended to avoid automatic focus zoom; desktop devices with a mouse/trackpad return to the previous 14px size. Pinch zoom and text wrapping are retained.

Includes the preceding Answer now, One month ago, skip-cue, and mobile scrolling changes.

Validation: JavaScript syntax, six-file ZIP, and behavior checks with a DOM adapter and simulated Google responses. Real Google access, browser rendering, and physical phone gestures were not tested here.

---

# Journal Prompts — Answer again & mobile update

Upload the six files in this ZIP to the root of your existing GitHub Pages repository, replacing the matching files. Do not upload the ZIP itself. Wait for GitHub Pages to finish deploying, then close and reopen or refresh the app on your phone.

- **Answer now:** available in a prompt’s past-answer window and on each On This Day entry. Opens a new, blank response in My session. Earlier answers and existing drafts stay intact. Works even if the old prompt was removed from the prompt library; does not add it back to the library.
- **One month ago:** added between A week ago and Six months ago. Uses the same calendar date in your device’s timezone; if that date does not exist in the earlier month, uses its last day (for example March 31 → February 28 or 29).
- **Often skipped:** a small amber “!” note appears when you next encounter a prompt after skipping it at least five times without keeping or answering it. A skip means pressing Shuffle past a newly shown question. Browsing Back does not add skips; keeping, answering, or editing resets the counter. Counts persist on this device only and start with this update. Nothing is deleted automatically. Use the existing Delete button if you want to remove it from Google Sheets; past answers remain intact.
- **Phone writing:** a 16px input font addresses automatic zoom on focus, text wraps to the available width, and the writing page grows with your response. Removed nested writing scroll areas and the gesture restriction so browser pinch zoom and sideways panning remain available.

Google Docs saving, the ⋆˚꩜｡⋆ divider, private answer history, Favorites, plain-text list shortcuts, device dark mode, and existing draft storage are retained. No older unindexed entries are imported.

Verified JavaScript syntax and app behavior using a DOM test adapter with mocked Google responses, plus static mobile style checks. Browser layout, real Google sign-in/API access, and a physical iPhone keyboard/pinch interaction could not be tested here.
