# OnlineWardleyMaps

[![Mentioned in Awesome Wardley Maps](https://awesome.re/mentioned-badge-flat.svg)](https://github.com/wardley-maps-community/awesome-wardley-maps#apps)

The source code that runs www.OnlineWardleyMaps.com, a tool for creating Wardley Maps using a text-based DSL that renders as an interactive SVG visualization.

Also available as a standalone Visual Studio Extension - [vscode-wardley-maps](https://github.com/damonsk/vscode-wardley-maps).

## Features

- Text-based map creation with real-time visualization
- Interactive editing with component drag-and-drop
- Multiple map styles (plain, color, wardley, handwritten)
- Component linking and evolution visualization
- Support for anchors, notes, and annotations
- Export maps as PNG images
- Shareable map URLs

## Map Syntax Example

```
title My Wardley Map
component Customer [0.9, 0.2]
component Service [0.7, 0.55]
component Database [0.5, 0.85]
Service->Database
Customer->Service
evolution Genesis->Custom->Product->Commodity
```

## Architecture

- React-based frontend with ACE editor integration
- SVG-based map rendering using modular symbol components
- Text parser with specialized extraction strategies
- Two-way binding between text and visual elements
- Component hierarchy:
  - Editor - ACE editor with custom language support
  - MapCanvas - Main SVG container for all map elements
  - Symbol components - Reusable SVG elements for visualization
  - Position handlers - Coordinate transformation and drag-and-drop

## Running locally

Dependencies for running locally: NodeJS and Yarn.

    npm install yarn -g

Install dependencies

    yarn install

Commands:

To run locally, develop/edit. Open web browser @ http://localhost:3000

     yarn start

To create minified scripts/styling.

    yarn build

To run all tests.

    yarn test

To start storybook.

    yarn run storybook

To create package for use in [vscode-wardley-maps](https://github.com/damonsk/vscode-wardley-maps).

    yarn package

## Credits

Developed by [@damonsk](https://twitter.com/damonsk).

Wardley Mapping courtesy of Simon Wardley, CC BY-SA 4.0. To learn more, see [Simon's book](https://medium.com/wardleymaps/on-being-lost-2ef5f05eb1ec).
