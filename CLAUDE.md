# Online Wardley Maps - Development Guidelines

## Commands
- `yarn start` - Start development server
- `yarn build` - Build production bundle
- `yarn test` - Run all tests
- `yarn test src/components/map/Anchor.test.js` - Run specific test
- `yarn lint` - Run ESLint
- `yarn prettify` - Run Prettier formatting
- `yarn storybook` - Start Storybook on port 9001
- `yarn package` - Create distributable package using Rollup

## Code Style
- Use tabs for indentation
- Use single quotes for strings
- Use trailing commas in objects and arrays
- Follow React best practices
- ESLint extends: eslint:recommended, plugin:react/recommended
- Component props should use appropriate PropTypes
- Keep components focused on a single responsibility
- Test components with Jest and React Testing Library

## Structure
- Components should be in `src/components/`
- Constants in `src/constants/`
- Utilities in appropriate subdirectories
- Test files should be named `*.test.js` next to implementation files
- Map element extraction strategies in `src/conversion/`
- Storyline components in `*.story.js` files for Storybook

## Git Workflow
- Use `yarn precommit` before committing (runs lint-staged)
- Keep commits focused on single logical changes
- Follow existing code style when making modifications

## Wardley Map Components
- Components represent elements on the map with evolution (x) and value chain (y) positioning
- Links show relationships between components
- Anchors define user needs
- Annotations add context to map sections
- Pipeline components show progression stages
- Evolution stages typically follow: Genesis → Custom → Product → Commodity

## Editor Design and Architecture

### Text-Based Map Creation 
- Maps are created using a domain-specific language (DSL)
- Text input is automatically converted to visual map elements
- Two-way binding between text and visualization
- Each map element has a specific syntax (`component Name [x, y]`)
- Changes to map text are reflected in real-time on the visual map

### Editor Components
- Built on ACE Editor (react-ace) for text editing
- Supports syntax highlighting and auto-completion
- Provides intelligent suggestions for map elements
- Auto-suggests existing component names for links
- Highlights errors in the editor gutter
- Elements can be clicked in the map to highlight their code

### Conversion Pipeline
1. Text input → Converter class → Multiple extraction strategies
2. Each strategy handles specific element types (components, links, etc.)
3. Structured map data object is created
4. React components render the visual representation
5. User interactions can modify both text and visual elements

### Example Map Syntax
```
title My Wardley Map
component Customer [0.9, 0.2]
component Service [0.7, 0.55]
component Database [0.5, 0.85]
Service->Database
Customer->Service
evolution Genesis->Custom->Product->Commodity
```

## API Reference (api.wardleymaps.ai)

### Map Management
- `GET /v2/maps/fetch?id={mapId}` - Retrieve map by ID
- `POST /v2/maps/save` - Save a map (body: id, text, meta)
- `GET /v2/maps/list` - List maps with pagination
- `DELETE /v2/maps/{mapId}` - Delete a map

### Image Generation
- `GET /v2/maps/{mapId}/png` - Get PNG image of map
- `GET /v2/maps/{mapId}/svg` - Get SVG representation of map
- `POST /v2/render` - Generate image from map text
  - Params: format (png/svg/pdf), style, width, height

### Analysis
- `POST /v2/analyze` - Analyze map components and structure
- `POST /v2/validate` - Validate map syntax and positioning
- `POST /v2/evolution` - Get evolutionary path analysis

### AI Integration
- `POST /v2/ai/generate` - Generate map from text description
- `POST /v2/ai/enhance` - Enhance existing map with AI suggestions
- `POST /v2/ai/comment` - Get AI commentary on map structure

### Implementation Notes
- All endpoints return JSON unless otherwise specified (image endpoints)
- Authentication required for write operations
- Rate limiting applies to prevent abuse
- Cross-origin requests allowed with proper headers

## Future Enhancements
- Server-side API for image generation from OWM text:
  - Create an Express endpoint that accepts OWM text via POST
  - Leverage existing `Converter.parse()` to interpret map data
  - Use headless browser (Puppeteer/Playwright) to render map
  - Return PNG/SVG image of rendered map
  - Expose simple API: `/api/generate-image` with text payload
  - Consider supporting additional output formats (SVG, PDF)

- API for retrieving existing maps as images:
  - Add GET endpoint: `/api/maps/{mapId}/image` 
  - Retrieve map data using existing `fetch` endpoint (currently at `https://maps.wardleymaps.ai/v2/maps/fetch?id={mapId}`)
  - Render map server-side with minimal React instance
  - Support query parameters for customization:
    - `format`: png, svg, pdf (default: png)
    - `style`: plain, color, wardley, handwritten (use existing styles)
    - `width`/`height`: dimensions (use defaults if not specified)
  - Add caching layer to improve performance for frequently accessed maps
  - Consider batch endpoint for retrieving multiple maps as images