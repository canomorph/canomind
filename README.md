# CanoMind

**Mind map, diagrams, gantt chart, timeline and more; an alternative open-source software for Xmind, Visio and other paid mind map softwares, completely offline editor.** Shapes, connectors, topics, relationships, data binding, color schemes, and real support for `.vsdx` / `.xmind` files. Open source, offline, and yours.

`100% Free` `Windows` `macOS` `Linux` `License: MIT` `Status: v0.4.0`

---
Screenshots
<img width="1282" height="802" alt="Canomind 0 4 0 screenshot" src="https://github.com/user-attachments/assets/bbac6ff8-42f1-4276-9bc4-08c2a30501b7" />
<img width="1282" height="802" alt="Ekran görüntüsü 2026-11-15 175254" src="https://github.com/user-attachments/assets/1981d986-7b21-467e-9969-8b656aa5e569" />
<img width="1282" height="802" alt="Ekran görüntüsü 2026-11-15 175322" src="https://github.com/user-attachments/assets/e875a5f7-c7fe-4fcd-b9a5-bd1053132f52" />
<img width="1282" height="802" alt="Ekran görüntüsü 2026-11-15 175351" src="https://github.com/user-attachments/assets/7ca940cd-3963-42fb-8894-e8c9af48995d" />
<img width="1282" height="802" alt="Ekran görüntüsü 2026-11-15 175415" src="https://github.com/user-attachments/assets/40abae39-f6a4-422a-9ba0-c2353071283c" />

## 📦 Download

| Platform | Format | Notes |
|----------|--------|-------|
| **Windows** | `.exe` (portable) / `.msi` (installer) | ✅ Official build — [Releases](https://github.com/canomorph/canomind/releases) |
| **macOS** | Source code | ⚠️ No pre-built binary; clone and build from source |
| **Linux** | Source code | ⚠️ No pre-built binary; clone and build from source |

Latest release: **v0.4.0**

---

## ✨ Features

### 📄 Document & File Management

- **Create, open, save** — supports `.vsdx`, `.xmind`, and a unified native format with atomic writes and local backups.
- **Export** to Canomind, FreeMind, Xmind, Visio, PDF, PNG, SVG, JPEG, Markdown, JSON.
- **Advanced raster export** with resolution, background color, transparency, and scale control.
- **Print** with easy settings.
- **Autosave** to a local saved file.
- **Local templates** — save, list, and apply templates.
- **Schema validation** for file integrity.

### 📑 Page & View Management

- **Add, delete, rename, reorder, duplicate** pages.
- **Zoom, pan, grid, snap, rulers, guides** — full canvas navigation.
- **Focus mode** hides distractions; **presentation mode** for full-screen playback.
- **Dark mode** with system-follow option and white, sepia and black modes.

### 🔷 Diagram Mode (DIAGRAM)

- **Shapes** — add, move, copy, group, align, distribute, lock, layer ordering.
- **Connectors** — dynamic, straight, and curved; routing, splitting, auto-connect.
- **Containers** for grouping related shapes.
- **ShapeSheet** — per-shape data cells with formula support and autocomplete.
- **Freeform drawing** with adjustable precision and smoothing.
- **Smart tags**, shape search pane, advanced shape handles.

### 🎨 Style, Formatting & Customization

- **Quick style customization** for fill, line, font, shadow, corner, and arrow styles.
- **Topic, edge, and shape style** controls.
- **Drawing background** — solid color or gradient.
- **Stencil layout** configuration (background, text color, grid).
- **SVG export format** selection.
- **Snap strength** per axis for guides and objects.

### ✅ Task & Project Management (MAP)

- **Task status** — to-do, in-progress, done. 
- **Task dates** — start and due.
- **Progress percentage** per task.
- **Task filtering** by status, date, or label.

### 📥 Import

- **CSV**, **Markdown**, **OPML**, **Word (DOCX)**
- **MindManager**, **FreeMind**, **Lighten**, **MindNode**
- **TextBundle**
- **Local images** placed on any page.

### 🖥️ UI & Usability

#### Ribbon & Toolbar
- Ribbon tab toggle (`Ctrl+F1`), keyboard ribbon access (`Alt+H`), full ribbon customization.
- **Quick Access Toolbar (QAT)** — customize, reposition, and add commands via right-click.

#### Keyboard Shortcuts & Text Editing
- Full-screen (`F5`), direct text edit (`F2`), text dialog (`F11`), format pane (`F3`).
- Tool selection (`Ctrl+1` pointer, `Ctrl+2` text), group (`Ctrl+G`), bring forward (`Ctrl+Shift+F`).
- **Key Assist panel** listing all shortcuts; full shortcut customization, search, and reset.
- **Find & Replace** (`Ctrl+F` / `Ctrl+H`).
- **Presentation mode** launch.

#### Contextual Helpers
- **Smart guidelines** for alignment feedback.
- **Floating toolbar** on topic selection.
- **Add Topic button** on canvas.
- **Shape search pane**, smart tags, auto-connect, advanced handles, formula autocomplete.

---

## 🚀 Getting Started

### Windows (pre-built)

Download the latest `.exe` or `.msi` from the [Releases page](https://github.com/canomorph/canomind/releases).

### macOS / Linux (from source)

```bash
git clone https://github.com/canomorph/canomind.git
cd canomind
npm install
npm run build   
