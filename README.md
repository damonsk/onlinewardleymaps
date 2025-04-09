# OnlineWardleyMaps

[![Mentioned in Awesome Wardley Maps](https://awesome.re/mentioned-badge-flat.svg)](https://github.com/wardley-maps-community/awesome-wardley-maps#apps)

The source code that runs www.OnlineWardleyMaps.com.  

Also available as a standalone Visual Studio Extension - [vscode-wardley-maps](https://github.com/damonsk/vscode-wardley-maps).

Developed by [@damonsk](https://twitter.com/damonsk).

Wardley Mapping courtesy of Simon Wardley, CC BY-SA 4.0. To learn more, see [Simon's book](https://medium.com/wardleymaps/on-being-lost-2ef5f05eb1ec).

## Running locally

Dependencies for running locally: Node.js and Yarn.

    `npm install yarn -g`
    

Change directory to frontend.

    `cd frontend/`

Install dependencies

    `yarn install`

Commands:

To run locally, develop/edit. Open web browser @ http://localhost:3000

     `yarn dev`

To create minified scripts/styling.

    `yarn build`

To run all tests.

    `yarn test`

To create package for use in [vscode-wardley-maps](https://github.com/damonsk/vscode-wardley-maps) or [obsidian-wardley-maps](https://github.com/damonsk/obsidian-wardley-maps).

    `yarn package`

Alternatively, you can also run it locally using the provided Dockerfile.

From the root repository, build a container image via

    `docker build -t onlinewardleymaps .`

and then run it locally 

    `docker run -p 3000:3000 onlinewardleymaps`

Now you can access the frontend @ http://localhost:3000

## Support the Project

If you find [obsidian-wardley-maps](https://github.com/damonsk/obsidian-wardley-maps), [OnlineWardleyMaps](https://github.com/damonsk/onlinewardleymaps) or [vscode-wardley-maps](https://github.com/damonsk/vscode-wardley-maps) valuable, consider supporting its development:

[![Patreon](https://c5.patreon.com/external/logo/become_a_patron_button.png)](https://www.patreon.com/mapsascode/overview)

Follow on X (Twitter) [@MapsAsCode](https://x.com/mapsascode) for updates and announcements!

Your support helps maintain and improve this plugin as well as OnlineWardleyMaps and vscode-wardley-maps. Every contribution is appreciated. Thank you for your support!
