# OnlineWardleyMaps

[![Mentioned in Awesome Wardley Maps](https://awesome.re/mentioned-badge-flat.svg)](https://github.com/wardley-maps-community/awesome-wardley-maps#apps)

The source code that runs www.OnlineWardleyMaps.com.  

Also available as a standalone Visual Studio Extension - [vscode-wardley-maps](https://github.com/damonsk/vscode-wardley-maps).

Developed by [@damonsk](https://twitter.com/damonsk).

Wardley Mapping courtesy of Simon Wardley, CC BY-SA 4.0. To learn more, see [Simon's book](https://medium.com/wardleymaps/on-being-lost-2ef5f05eb1ec).

## Running locally

Dependancies for running locally. NodeJS and Yarn.

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
