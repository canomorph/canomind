
# CanoMind

**A lightweight, cross-platform open source, offline, mind map and diagram editor.**

Mind maps, flowcharts, org charts, Gantt plans and more, in one fast desktop app

`100% Free` `Windows` `macOS` `Linux` `License: MIT` `Status: v0.9.0`

#### [Türkçe açıklama için tıklayın](https://github.com/canomorph/canomind/blob/main/README.tr.md)

---
## Screenshots
<img width="800" alt="Ekran görüntüsü 2026-11-16 205500" src="https://github.com/user-attachments/assets/7fb37fe9-2597-414c-956b-2ca7172355e4" />
<img width="400" alt="Ekran görüntüsü 2026-11-16 210724" src="https://github.com/user-attachments/assets/131ca468-a7eb-4f95-be36-75b90a071866" />
<img width="400" alt="Ekran görüntüsü 2026-11-16 205754" src="https://github.com/user-attachments/assets/fd7fa7ba-4699-498d-a099-1e2fe80c24a3" />
<img width="400" alt="Ekran görüntüsü 2026-11-16 205844" src="https://github.com/user-attachments/assets/67704f8d-d3d0-4aae-9599-b227df921249" />
<img width="400" alt="Ekran görüntüsü 2026-11-16 205647" src="https://github.com/user-attachments/assets/7ea8fe4a-44ea-461b-b9d1-7e17e9e42fe6" />

## 📦 Download

| Platform | Format | Notes |
|----------|--------|-------|
| **Windows** | `.exe` / `.msi` / `portable.zip`  | ✅ Official build — [Releases](https://github.com/canomorph/canomind/releases) |
| **macOS** | `.dmg` / `build.zip with .app` | ✅ Official build — [Releases](https://github.com/canomorph/canomind/releases)  |
| **Linux** | `.appimage` / `.deb` / `build.zip` | ✅ Official build — [Releases](https://github.com/canomorph/canomind/releases)  |

Work on a mobile version will be undertaken depending on the demand for the desktop version of the application.

Latest release: **v0.9.0**

---

## Overview
 
CanoMind combines the production power of Visio, XMind, MindManager and Gantt tools in a modern, Office-style interface. It is built with [Tauri](https://tauri.app), so it stays small, fast and native on Windows, macOS and Linux.
 
## Features
 
### Create
- **Mind maps in one click:** select a box and press **+** to add a connected subtopic, or drag the **+** onto another box to link them. Subtopics are numbered automatically (1, 1.1, 1.1.1).
- **30+ shapes** plus flowchart, arrow and callout sets, drag and drop or click to place.
- **Tables, charts** (column, bar, line, pie, donut, area), **to-do boxes**, notepads, sticky notes, images and links.
- **Notes and images inside boxes**, with boxes that grow so nothing overflows.
- **Templates:** mind map, to-do list, event planner, SWOT, Eisenhower matrix, pros and cons, business model canvas, Kanban, fishbone, flowchart, org chart, Gantt plan and timeline.
- **Auto layout:** horizontal or vertical (org chart style), applied in place.
### Edit
- **Office-style ribbon** that collapses gracefully when the window gets small.
- **Rich text:** format just the selected words (bold, italic, color, size, font), bullet and numbering styles, system fonts.
- **Spell and grammar check:** works offline in 35 languages, with Word-like options.
- Fill, line and opacity controls, quick styles and color schemes you can add to, delete and reorder.
- Alignment, grouping, locking, format painter, undo and redo, right-click menu.
### Organize
- **Multiple files as tabs** and **multiple pages per file**, with page colors.
- **Page setup:** A and B series, HD to 8K screen sizes or a custom size, portrait or landscape.
- Rulers with page-size marks, four grid types, background color and background images.
- **Navigation pane:** your map as an outline, with search.
- Comments on any box.
### Present and share
- **Presentation mode:** one box per slide, with images above and notes below.
- Full screen mode and print.
- **Open and import:** `.canomind`, XMind (`.xmind`), FreeMind (`.mm`), Visio (`.vsdx`, basic).
- **Save and export:** `.canomind`, XMind, FreeMind, Visio, PDF (vector, selectable text), Markdown, PNG, JPG, SVG, JSON.
### Make it yours
- Themes: light, sepia, dark and black.
- Interface languages: English and Turkish. Spell-check language is separate.
- Adjustable UI scale and configurable Enter-key behavior.
## Keyboard shortcuts
 
| Action | Shortcut |
|---|---|
| New, open, save, save as | `Ctrl+N`, `Ctrl+O`, `Ctrl+S`, `Ctrl+Shift+S` |
| Add subtopic, add sibling | `Tab`, `Enter` |
| Edit text | `F2` or double-click |
| Select all boxes, all connectors | `Ctrl+A`, `Shift+A` |
| Copy, cut, paste, duplicate | `Ctrl+C`, `Ctrl+X`, `Ctrl+V`, `Ctrl+D` |
| Undo, redo | `Ctrl+Z`, `Ctrl+Y` |
| Pan | middle mouse, `Alt`+drag, `Shift`+wheel |
| Zoom | `Ctrl`+wheel |
| Presentation | `F5` |

## 🚀 Installation

Download the latest Windows, MacOS and Linux setup and source code files from the [Releases page](https://github.com/canomorph/canomind/releases).

### File formats

Windows: .msi, .exe

MacOS: .dmg

Linux: .appimage, .deb
 
## Getting started
 
**Requirements:** [Node.js](https://nodejs.org) 18+, [Rust](https://rustup.rs) and the [Tauri prerequisites](https://tauri.app/start/prerequisites/) for your system.
 
```bash
git clone https://github.com/canomorph/canomind.git
cd canomind
npm install
npm run tauri dev      # run in development
npm run tauri build    # create installers (MSI and NSIS on Windows)
```
 
`npm install` also fetches the spell-check dictionaries and copies them into `public/dict`.
 
## Tech stack
 
Tauri 2 (Rust) · React · TypeScript · Vite · Zustand · pdf-lib · JSZip · nspell (Hunspell)
 
## Notes
 
- MindManager (`.mmap`) is not supported because there is no public file format specification that permits it.
- Visio support covers shapes, text and connectors, not full Visio features.
