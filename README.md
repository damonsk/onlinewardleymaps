# OnlineWardleyMaps

[![Mentioned in Awesome Wardley Maps](https://awesome.re/mentioned-badge-flat.svg)](https://github.com/wardley-maps-community/awesome-wardley-maps#apps)

The source code that runs www.OnlineWardleyMaps.com.  

Also available as a standalone Visual Studio Extension - [vscode-wardley-maps](https://github.com/damonsk/vscode-wardley-maps).

Developed by [Damon Skelhorn](https://www.linkedin.com/in/skels/).

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

Publishing `wmlandscape` to npm is handled by GitHub Actions on `main`.

Alternatively, you can also run it locally using the provided Dockerfile.

From the root repository, build a container image via

    `docker build -t onlinewardleymaps .`

and then run it locally 

    `docker run -p 3000:3000 onlinewardleymaps`

Now you can access the frontend @ http://localhost:3000

## Running frontend + local API with docker-compose

This repository now includes a local Node.js/TypeScript API implementation of:

- `POST /v1/maps/save`
- `GET /v1/maps/fetch?id=<map-id>`

The API stores maps as `.owm` files in a configurable data directory.

To run both frontend and API together:

    `docker compose up --build`

Services:

- Frontend: http://localhost:3000
- API: http://localhost:3001

Configuration options (all optional):

- `NEXT_PUBLIC_API_ENDPOINT` (default: `http://localhost:3001/v1/maps/` in compose, production endpoint otherwise)
- `OWM_DATA_PATH` (default host path: `./data`)
- `OWM_DATA_DIR` (default container path: `/data`)

Example:

    `OWM_DATA_PATH=./local-maps docker compose up --build`

### API contract details

`POST /v1/maps/save`

- Request JSON:
  - `id` string (optional; if empty/missing, server generates UUID)
  - `text` string (required)
  - `mapIterations` string (optional JSON-encoded array)
- Behavior:
  - If `id` is provided, the corresponding `<id>.owm` file is overwritten.
  - If `id` is not provided, a new UUID is generated.
- Response JSON:
  - `{ "id": "...", "text": "...", "mapIterations": "..." }`

`GET /v1/maps/fetch?id=<map-id>`

- Response JSON:
  - `{ "id": "...", "text": "...", "mapIterations": "..." }`

## Support the Project

If you find [obsidian-wardley-maps](https://github.com/damonsk/obsidian-wardley-maps), [OnlineWardleyMaps](https://github.com/damonsk/onlinewardleymaps) or [vscode-wardley-maps](https://github.com/damonsk/vscode-wardley-maps) valuable, consider supporting its development:

[![Patreon](https://c5.patreon.com/external/logo/become_a_patron_button.png)](https://www.patreon.com/mapsascode/overview)

Follow on X (Twitter) [@MapsAsCode](https://x.com/mapsascode) for updates and announcements!

Your support helps maintain and improve this plugin as well as OnlineWardleyMaps and vscode-wardley-maps. Every contribution is appreciated. Thank you for your support!
