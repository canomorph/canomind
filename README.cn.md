<div align="center">

# CanoMind

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#许可证)
![版本](https://img.shields.io/badge/%E7%89%88%E6%9C%AC-1.0.0-blue.svg)
![平台：Windows、macOS、Linux](https://img.shields.io/badge/%E5%B9%B3%E5%8F%B0-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)
[![基于 Tauri 构建](https://img.shields.io/badge/%E5%9F%BA%E4%BA%8E-Tauri%202-24C8DB.svg)](https://tauri.app)

**轻量级、跨平台的思维导图与图表编辑器。**
思维导图、流程图、组织结构图、甘特图等，尽在一款快速的桌面应用中。

[English](README.md) · [Türkçe](README.tr.md) · 版本 1.0.0 · 由 Canomorph Creative 开发

概述 · 功能 · 键盘快捷键 · 快速开始 · 技术栈 · 注意事项 · 许可证

</div>

---

## 概述

CanoMind 将 Visio、XMind、MindManager 和甘特图工具的专业能力，整合到现代化的 Office 风格界面中。它基于 [Tauri](https://tauri.app) 构建，因此在 Windows、macOS 和 Linux 上体积小巧、运行快速且具备原生体验。

---

## 功能

### 创建
- **一键生成思维导图：** 选中一个方框并按 **+** 即可添加相连的子主题，或将 **+** 拖到另一个方框上以建立连接。子主题会自动编号（1、1.1、1.1.1）。
- **30 多种形状**，以及流程图、箭头和标注集，可拖放或点击放置。
- **纯文字思维导图：** 悬停时显示 **+** 控制点的纯文本项目。
- **表格、图表**（柱形、条形、折线、饼图、环形、面积）、**待办方框**、记事本、便签、图片和链接。
- **方框内的备注和图片**，方框会自动扩展，内容不会溢出。
- **模板：** 思维导图、待办清单、活动策划、SWOT、艾森豪威尔矩阵、优缺点分析、商业模式画布、看板、鱼骨图、流程图、组织结构图、甘特图计划和时间线。
- **自动布局：** 横向或纵向（组织结构图样式），原地应用。

### 编辑
- **Office 风格功能区：** 窗口变小时会优雅地收起。
- **富文本：** 仅对选中的文字设置格式（粗体、斜体、颜色、字号、字体），项目符号和编号样式，系统字体。
- **拼写和语法检查：** 支持 35 种语言的离线检查，提供类似 Word 的选项。
- 文字轮廓和阴影、文字方向，以及方框内带光标和选区的实时编辑。
- **主题：** 一键重新着色所有思维导图（主色加柔和的子方框配色）。
- 填充、线条和不透明度控制，快速样式以及可添加、删除和重新排序的配色方案。
- 对齐、组合、锁定、格式刷、撤销和重做，以及右键菜单。

### 组织
- **多文件以标签页打开**，**每个文件可包含多个页面**，页面可设置颜色。
- **页面设置：** A 系列和 B 系列纸张、从高清到 8K 的屏幕尺寸或自定义尺寸，纵向或横向。
- 带页面尺寸标记的标尺、四种网格类型、背景颜色和背景图片。
- **导航窗格：** 以大纲形式显示您的思维导图，并支持搜索。
- 可为任意方框添加评论。
- **绘图：** 钢笔、荧光笔、可调粗细和不透明度的橡皮擦。

### 演示与分享
- **演示模式：** 每张幻灯片一个方框，图片在上，备注在下。
- 全屏模式和打印。
- **打开与导入：** `.canomind`、XMind（`.xmind`）、FreeMind（`.mm`）、Visio（`.vsdx`，基础支持）、Markdown（`.md`）。
- **保存与导出：** `.canomind`、XMind、FreeMind、Visio、PDF（矢量格式，文字可选取）、Markdown、PNG、JPG、SVG、JSON。

### 个性化设置
- 主题：浅色、护眼色、深色和纯黑。
- 界面语言：英语、土耳其语和中文。拼写检查语言可单独设置。
- 可调节界面缩放比例，并可配置 Enter 键行为。

---

## 键盘快捷键

| 操作 | 快捷键 |
|---|---|
| 新建、打开、保存、另存为 | `Ctrl+N`、`Ctrl+O`、`Ctrl+S`、`Ctrl+Shift+S` |
| 添加子主题、添加同级主题 | `Tab`、`Enter` |
| 编辑文字 | `F2` 或双击 |
| 全选方框、全选连接线 | `Ctrl+A`、`Shift+A` |
| 复制、剪切、粘贴、创建副本 | `Ctrl+C`、`Ctrl+X`、`Ctrl+V`、`Ctrl+D` |
| 撤销、重做 | `Ctrl+Z`、`Ctrl+Y` |
| 平移 | 鼠标中键、`Alt`+拖动、`Shift`+滚轮 |
| 缩放 | `Ctrl`+滚轮 |
| 演示 | `F5` |

---

## 快速开始

**环境要求：** [Node.js](https://nodejs.org) 18+、[Rust](https://rustup.rs) 以及适用于您系统的 [Tauri 前置条件](https://tauri.app/start/prerequisites/)。

```bash
git clone https://github.com/canomorph/canomind.git
cd canomind
npm install
npm run tauri dev      # 以开发模式运行
npm run tauri build    # 生成安装程序（Windows 上为 MSI 和 NSIS）
```

`npm install` 还会获取拼写检查词典，并将其复制到 `public/dict`。

---

## 技术栈

Tauri 2（Rust）· React · TypeScript · Vite · Zustand · pdf-lib · JSZip · nspell（Hunspell）

---

## 注意事项

- 不支持 MindManager（`.mmap`），因为目前没有允许此类支持的公开文件格式规范。
- Visio 支持涵盖形状、文字和连接线，但不包括 Visio 的全部功能。

---

## 许可证

本项目采用 **MIT 许可证**授权。

版权所有 (c) 2026 Canomorph Creative

以下 MIT 许可证文本为保证法律效力，保留原始英文版本。

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
