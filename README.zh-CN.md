# CanoMind

**轻量、跨平台、开源且可离线使用的思维导图与图表编辑器。**

在一个快速的桌面应用中创建思维导图、流程图、组织结构图、甘特图等内容。

`免费` `Windows` `macOS` `Linux` `MIT License` `版本：v0.9.0`

#### [English](README.md) · [Türkçe](README.tr.md)

---

## 简介

CanoMind 将 Visio、XMind、MindManager 和甘特图工具的常用能力整合到现代化的 Office 风格界面中。应用基于 [Tauri](https://tauri.app)，体积小、运行快，并支持 Windows、macOS 和 Linux。

## 功能

- 创建思维导图、流程图、组织结构图、甘特计划和时间线。
- 使用 30 多种形状、表格、图表、待办框、便签、图片和链接。
- 为主题设置富文本格式、颜色、字体、对齐方式和自动布局。
- 使用多标签和多页面管理文档，并通过导航面板浏览和搜索内容。
- 演示、打印，以及导出为 PDF、Markdown、PNG、JPG、SVG 和 JSON。
- 导入 XMind（`.xmind`）、FreeMind（`.mm`）和基础 Visio（`.vsdx`）文件。
- 使用浅色、护眼、深色和黑色主题；界面支持 English、Türkçe 和简体中文。

## 下载

从 [Releases](https://github.com/canomorph/canomind/releases) 下载 Windows、macOS 或 Linux 安装包。

## 开始使用

**环境要求：** Node.js 18+、Rust 和适用于当前系统的 [Tauri prerequisites](https://tauri.app/start/prerequisites/)。

```bash
git clone https://github.com/canomorph/canomind.git
cd canomind
npm install
npm run tauri dev      # 启动开发版本
npm run tauri build    # 构建安装包
```

`npm install` 也会下载拼写检查词典并复制到 `public/dict`。

## 技术栈

Tauri 2 · React · TypeScript · Vite · Zustand · pdf-lib · JSZip · nspell (Hunspell)

## 说明

- MindManager（`.mmap`）暂不支持，因为没有公开且允许使用的文件格式规范。
- Visio 支持形状、文本和连接线，不包含完整的 Visio 功能。
