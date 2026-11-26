<div align="center">

# CanoMind

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#license)
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Platforms: Windows, macOS, Linux](https://img.shields.io/badge/platforms-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)
[![Built with Tauri](https://img.shields.io/badge/built%20with-Tauri%202-24C8DB.svg)](https://tauri.app)

**A lightweight, cross-platform mind map and diagram editor.**
Mind maps, flowcharts, org charts, Gantt plans and more, in one fast desktop app.

[Türkçe](README.tr.md) · [中文](README.cn.md) · Version 1.0.0 · by Canomorph Creative


</div>

---

## Overview

CanoMind combines the production power of Visio, XMind, MindManager and Gantt tools in a modern, Office-style interface. It is built with [Tauri](https://tauri.app), so it stays small, fast and native on Windows, macOS and Linux.

---

## Download

Pick the installer that matches your operating system. Each release ships with the files below.

| Platform | Architecture | Format | Download |
|---|---|---|---|
| Windows | x64 | MSI | [Download](https://github.com/canomorph/canomind/releases/download/canomind-1-0-0/CanoMind_1.0.0_x64_en-US.msi) |
| Windows | x64 | NSIS (.exe) | [Download](https://github.com/canomorph/canomind/releases/download/canomind-1-0-0/CanoMind_1.0.0_x64-setup.exe) |
| macOS | Not specified | PKG installer | [Download](https://github.com/canomorph/canomind/releases/download/canomind-1-0-0/canomind-macos.pkg) |
| macOS | Not specified | TAR.GZ archive | [Download](https://github.com/canomorph/canomind/releases/download/canomind-1-0-0/canomind-macos.tar.gz) |
| Linux | x64 | AppImage | [Download](https://github.com/canomorph/canomind/releases/download/canomind-1-0-0/CanoMind_1.0.0_amd64.AppImage) |
| Linux | x64 | DEB (Debian, Ubuntu) | [Download](https://github.com/canomorph/canomind/releases/download/canomind-1-0-0/CanoMind_1.0.0_amd64.deb) |
| Linux | x64 | RPM (Fedora, openSUSE) | [Download](https://github.com/canomorph/canomind/releases/download/canomind-1-0-0/CanoMind-1.0.0-1.x86_64.rpm) |
| Linux | x64 | Arch Linux package (.pkg.tar.zst) | [Download](https://github.com/canomorph/canomind/releases/download/canomind-1-0-0/canomind-linux-x86_64.pkg.tar.zst) |
| Linux | x64 | TAR.GZ archive | [Download](https://github.com/canomorph/canomind/releases/download/canomind-1-0-0/canomind-linux-x86_64.tar.gz) |

---
## Screenshots
-------
<img width="400" alt="Ekran görüntüsü 2026-11-16 205500" src="https://github.com/user-attachments/assets/7fb37fe9-2597-414c-956b-2ca7172355e4" />
<img width="400" alt="Ekran görüntüsü 2026-11-16 205647" src="https://github.com/user-attachments/assets/7ea8fe4a-44ea-461b-b9d1-7e17e9e42fe6" />
<img width="400" alt="Ekran görüntüsü 2026-11-16 210724" src="https://github.com/user-attachments/assets/131ca468-a7eb-4f95-be36-75b90a071866" />
<img width="400" alt="Ekran görüntüsü 2026-11-16 210015" src="https://github.com/user-attachments/assets/1a0e8ef8-ee32-41a8-bf31-4b9ce021607c" />

#### New Drawing Feature

<img width="800" alt="Ekran görüntüsü 2026-11-26 094045" src="https://github.com/user-attachments/assets/f1799624-0111-447f-97ad-24c260b220ab" />

#### New Themes

<img width="800" alt="Ekran görüntüsü 2026-11-26 093733" src="https://github.com/user-attachments/assets/da13918c-4304-4ca2-bb00-d02e76bda0c3" />

#### New Timeline Template

<img width="800" alt="Ekran görüntüsü 2026-11-26 093720" src="https://github.com/user-attachments/assets/3d704d45-3471-4e22-aca2-db2626c5d378" />

---

---

## Features

### Create
- **Mind maps in one click:** select a box and press **+** to add a connected subtopic, or drag the **+** onto another box to link them. Subtopics are numbered automatically (1, 1.1, 1.1.1).
- **30+ shapes** plus flowchart, arrow and callout sets, drag and drop or click to place.
- **Words-only mind maps:** plain text items that show **+** handles on hover.
- **Tables, charts** (column, bar, line, pie, donut, area), **to-do boxes**, notepads, sticky notes, images and links.
- **Notes and images inside boxes**, with boxes that grow so nothing overflows.
- **Templates:** mind map, to-do list, event planner, SWOT, Eisenhower matrix, pros and cons, business model canvas, Kanban, fishbone, flowchart, org chart, Gantt plan and timeline.
- **Auto layout:** horizontal or vertical (org chart style), applied in place.

### Edit
- **Office-style ribbon** that collapses gracefully when the window gets small.
- **Rich text:** format just the selected words (bold, italic, color, size, font), bullet and numbering styles, system fonts.
- **Spell and grammar check:** works offline in 35 languages, with Word-like options.
- Text outline and shadow, text direction, live in-box editing with caret and selection.
- **Themes:** one click recolors every mind map (main color plus pastel sub boxes).
- Fill, line and opacity controls, quick styles and color schemes you can add to, delete and reorder.
- Alignment, grouping, locking, format painter, undo and redo, right-click menu.

### Organize
- **Multiple files as tabs** and **multiple pages per file**, with page colors.
- **Page setup:** A and B series, HD to 8K screen sizes or a custom size, portrait or landscape.
- Rulers with page-size marks, four grid types, background color and background images.
- **Navigation pane:** your map as an outline, with search.
- Comments on any box.
- **Draw:** pen, highlighter, eraser with thickness and opacity.

### Present and share
- **Presentation mode:** one box per slide, with images above and notes below.
- Full screen mode and print.
- **Open and import:** `.canomind`, XMind (`.xmind`), FreeMind (`.mm`), Visio (`.vsdx`, basic), Markdown (`.md`).
- **Save and export:** `.canomind`, XMind, FreeMind, Visio, PDF (vector, selectable text), Markdown, PNG, JPG, SVG, JSON.

### Make it yours
- Themes: light, sepia, dark and black.
- Interface languages: English, Turkish and Chinese. Spell-check language is separate.
- Adjustable UI scale and configurable Enter-key behavior.

---

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

---

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

---

## Tech stack

Tauri 2 (Rust) · React · TypeScript · Vite · Zustand · pdf-lib · JSZip · nspell (Hunspell)

---

## Notes

- Visio support covers shapes, text and connectors, not full Visio features.

---

## License

This project is licensed under the **MIT License**.

Copyright (c) 2026 Canomorph Creative

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
