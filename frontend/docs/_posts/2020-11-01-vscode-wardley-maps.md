---
layout: post
title: "Wardley Maps for Visual Studio Code"
author: "OnlineWardleyMaps"
tags: "vscode"
---

Wardley Maps for Visual Studio Code is a Wardley Map generator. It takes map code written in the editor and renders it as a Wardley Map.  You can interact with the map by repositioning components by dragging/dropping.  Changes made via the rendered map are reflected back into your map code.

## Quick Links
 
>  - [Getting Started](#getting-started)
>  - [Get the extension](#get-the-extension)
>  - [Using the extension](#using-the-extension)
>    - [Syntax Highlighting](#syntax-highlighting)
>    - [Displaying Maps](#displaying-maps)
>    - [Auto Completions](#auto-completions)
>    - [Snippets](#snippets)

## Getting Started

First, you need to make sure you have Visual Studio Code installed.  [Skip ahead](#get-the-extension) if you're already setup.  

Head over to <https://code.visualstudio.com/download> and download and install the version for your operating system.

## Get the extension

Once Visual Studio Code is installed and running, search and install Wardley Maps extension from the Extensions panel. To get to the Extensions panel, from the file menu, select `View` -> `Extensions`.  You can also use the keyboard shortcut (Windows) <kbd>Ctrl+Shift+X</kbd> / (macOS) <kbd>Cmd+Shift+X</kbd>.

Simply search for and install the extension `Wardley Maps` shown below. 

**Alternatively**, if you are familiar with VSCode, you can shortcut this process by entering the following command into the Command Palette ((Windows) <kbd>Ctrl+Shift+P</kbd> / (macOS) <kbd>Cmd+Shift+P</kbd>).  `ext install damonsk.vscode-wardley-maps`

![Searching for VS Code Extension](/assets/vscode-extensions-search.png)

## Using the extension 

  - [Syntax Highlighting](#syntax-highlighting)
  - [Displaying Maps](#displaying-maps)
  - [Auto Completions](#auto-completions)
  - [Snippets](#snippets)

### Syntax Highlighting

To reduce the cognitive load when reading maps as code, this extension brings with it syntax highlighting.  

To enable syntax highlighting, you have two options.  By default, any file with an extenion of `.wm` or `.owm` will auto enable the syntax highlighting. 

For existing files, or new unsaved files, you can set the Language Mode.

Using the Command Palette (keyboard shortcut: (Windows) <kbd>Ctrl+Shift+P</kbd> / (macOS) <kbd>Cmd+Shift+P</kbd>) enter `Change Language Mode`, press enter and then select `Wardley Map`

![Setting Language Mode](/assets/vscode-set-language.gif)

### Displaying Maps

Using the Command Palette (keyboard shortcut: (Windows) <kbd>Ctrl+Shift+P</kbd> / (macOS) <kbd>Cmd+Shift+P</kbd>) enter `Wardley Maps: Display Map` and then press enter.

![Display Wardley Map](/assets/vscode-display-map.gif)

### Auto Completions

To access the code completions (or intellisense) within the text editor, press <kbd>Ctrl+Space</kbd>.  Code completions (shown in red below) will contain both the keywords (such as `component` `anchor` `ecosystem`) as well as any variables specific to your map.  For example, `component Hot Water [...]` will result in a variable `Hot Water`.  Variables can be used to link components in a value chain.  `Hot Water->Water`

![Display Code Completions](/assets/vscode-completions.png)

### Snippets

Similar to code completions, to access snippets within the text editor, press <kbd>Ctrl+Space</kbd>.  Snippets (shown in yellow below) are complete examples which you can modify, you may <kbd>tab</kbd> between placeholders for quick editing.  

The following snippet `anchor name [0.9, 0.1]` has three placeholders.

`anchor <initial text cursor> [<tab to edit>, <tab again to edit>]`

![Display Code Snippets](/assets/vscode-completions.png)