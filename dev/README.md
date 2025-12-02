# Prompt Organizer – README

A beautiful, fast, and fully offline **Prompt Organizer** built with pure HTML, CSS, and vanilla JavaScript. Perfect for writers, developers, AI enthusiasts, or anyone who wants to save, categorize, and quickly reuse their favorite prompts.

Works 100% in the browser – no server, no installation required.

**Live Demo**: Just open `index.html` a stable version in any modern browser!
Or go to: !(https://ezequias.github.io/promptingorganizer/)

## Screenshot
![Screenshot](./assets/img/screenshot.jpg)

## Features

| Feature | Description |
|-------|-----------|
| **Category Management** | Create, rename (double-click), and delete categories |
| **Unlimited Prompts** | Add as many prompts as you want to any category |
| **Multiline Prompt Display** | Prompts are shown in clean, textarea-like cards that wrap naturally and preserve line breaks |
| **Copy to Clipboard** | One-click copy button on every prompt (with visual feedback) |
| **Delete Prompts** | Remove individual prompts with a trash icon |
| **Active Category Highlight** | Currently selected category is clearly highlighted |
| **Persistent Storage** | All data saved automatically in `localStorage` – survives page reloads and browser restarts |
| **Import / Export** | Download all your data as a nicely formatted JSON file<br>Upload a previously exported file to restore or transfer everything |
| **Fully Responsive** | Works great on desktop, tablets, and phones |
| **Material Design Aesthetic** | Clean cards, subtle shadows, Roboto font, and Material Icons |
| **No Dependencies** | Zero external libraries – only vanilla JS + Google Fonts & Material Icons (CDN) |
| **Keyboard Friendly** | Press Enter to add categories or save edits |
| **Safe Data Overwrite Protection** | Confirmation dialogs before deleting categories or importing data |

## File Structure

```
├── index.html      → Main page
├── style.css       → All styling (Material-inspired + custom fixes)
├── script.js       → Core logic (categories, prompts, import/export)
├── logo-new.png    → Header logo (feel free to replace)
└── favicon.ico     → Favicon
```

## How to Use

1. **Open** `index.html` in your browser (double-click the file or drag it into Chrome/Firefox/Edge).
2. **Add a category** → type name → “Add Category”
3. **Select a category** → it becomes active (highlighted)
4. **Write your prompt** in the big textarea → choose category → “Add Prompt”
5. **Use the buttons** on each prompt card:
   - Copy icon → copies the full prompt text to clipboard
   - Trash icon → deletes the prompt
6. **Manage categories**:
   - Double-click a category name to rename it
   - Click the trash icon next to a category to delete it (deletes all prompts inside)
7. **Backup / Transfer**:
   - Click **Download** → saves a timestamped `.json` file with everything
   - Click **Upload** → select a previously downloaded file → confirms overwrite → restores everything

## Customization

- Change colors by editing the `:root` variables at the top of `style.css`
- Replace `logo-new.png` with your own logo (keep same filename or update the `<img src>` path)
- Change default categories by editing the initial array in `script.js`:

```js
let categories = JSON.parse(localStorage.getItem('promptCategories')) || ['General', 'Creative', 'Technical'];
```

## Privacy & Security

- 100% client-side – nothing is ever sent to any server
- Data lives only in your browser’s `localStorage` and in the JSON files you export
- You control everything

## Browser Support

Tested and working perfectly on:
- Chrome / Edge / Brave (latest)
- Firefox (latest)
- Safari (macOS & iOS)

## Future Ideas (feel free to contribute!)

- Search / filter prompts
- Drag-and-drop reordering
- Tags in addition to categories
- Dark mode toggle
- Markdown preview for prompts
- Sync via Dropbox/Google Drive link

Enjoy organizing your prompts!