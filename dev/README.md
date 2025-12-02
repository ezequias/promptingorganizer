# Prompt Organizer

**A beautiful, fast, and fully offline Prompt Organizer** built with pure HTML, CSS, and vanilla JavaScript.  
Perfect for writers, developers, AI enthusiasts, or anyone who wants to save, categorize, and quickly reuse their favorite prompts.

**Works 100% in the browser** – no server, no installation required.

**Live Demo**: [Open in browser](https://ezequias.github.io/promptingorganizer/)  
Or just open `index.html` in any modern browser!

---

## Screenshot

![Prompt Organizer Screenshot](./assets/img/screenshot.jpg)

---

## Features

| Feature | Description |
|--------|-------------|
| **Drag & Drop Categories** | Reorder categories with a beautiful 8-dot grip |
| **Prompt Counter** | Shows total prompts per category (`General ● 12`) |
| **Resizable Input** | Drag the bottom-right `⋮⋮` handle to resize the textarea |
| **Smart Placeholders** | Text inside `[brackets]` is highlighted in yellow |
| **Copy to Clipboard** | One-click copy with visual feedback |
| **Delete Prompts** | Trash icon with hover animation |
| **Category Management** | Create, rename (double-click), delete categories |
| **Unlimited Prompts** | Add as many as you want per category |
| **Multiline Display** | Preserves formatting and wraps naturally |
| **Active Category Highlight** | Clear visual feedback |
| **Persistent Storage** | `localStorage` – survives reloads and restarts |
| **Import / Export** | Download/upload `.json` with timestamp |
| **Fully Responsive** | Works on desktop, tablet, and phone |
| **Material Design** | Clean cards, shadows, Roboto font, Material Icons |
| **No Dependencies** | Pure vanilla JS + Google Fonts (CDN) |
| **Keyboard Friendly** | Press `Enter` to add or save |
| **Safe Overwrite Protection** | Confirmation dialogs |

---

## File Structure
├── index.html          → Main page
├── style.css           → All styling
├── script.js           → Core logic
├── logo-new.png        → Header logo
├── favicon.ico         → Favicon
└── assets/
└── img/
└── screenshot.jpg


---

## How to Use

1. **Open** `index.html` in your browser  
   *(double-click or drag into Chrome/Firefox/Edge)*

2. **Add a category** → type name → press `Enter` or click **Add**

3. **Select a category** → it becomes active

4. **Write your prompt** in the resizable textarea  
   → Use `[placeholders]` to highlight variables  
   → Drag the `⋮⋮` handle to resize

5. **Choose category** → click **Add Prompt**

6. **Use prompt cards**:
   - **Copy** → copies full text
   - **Trash** → deletes prompt

7. **Manage categories**:
   - **Double-click** to rename
   - **Trash icon** to delete (with confirmation)

8. **Backup / Transfer**:
   - **Download** → saves `prompts-YYYYMMDD-HHMMSS.json`
   - **Upload** → restore from file (with confirmation)

---

9. **Privacy & Security**

**100% client-side** – nothing sent to any server
**Data stored in localStorage** and .json exports
**You own your data**