## How it works

1. The user interface accepts a text string known as mapText. This mapText is a specific DSL format for onlinewardleymaps.
2. The mapText is parsed and converted into a structured format that can be used to render the map.
3. This process begins in frontend/src/conversion/Converter.ts. There are several interfaces/types to help with the conversion process in this file.
4. MapEnvironment.tsx begins the render, invokes the Converter to get the "WardleyMap" object, this is then passed to various useStates.
5. MapEnvironment renders MapView.tsx, passing the various WardleyMap types.
6. MapView.tsx additionally passes these objects to MapCanvas.js. MapCanvas then uses MapElements class in frontend/src/MapElements.ts.
7. Because there is a change in the MapElements.ts, it is important to update MapElements to use the original WardleyMap object, not the converted one. This is because the MapElements class uses the original WardleyMap object and types to ensure consistency.
8. Ensure types are stores in frontend/src/types.
9. It is likely the types already exist, but they may lack the properties, so don't create new ones unless absolutely necessary.
10. Ensure integrity, make sure types are not optional and set default values upstream from the Converter.ts.

## Wardley Map Components

- Components represent elements on the map with evolution (x) known as maturity and value chain (y) positioning known as visibility
- Links show relationships between components
- Anchors define user needs
- Annotations add context to map sections
- Pipeline components show progression stages
- Evolution stages typically follow: Genesis → Custom → Product → Commodity

## Commands

From within ./frontend/ directory.

- `yarn start` - Start development server
- `yarn build` - Build production bundle
- `yarn test` - Run all tests
- `yarn test src/components/map/Anchor.test.js` - Run specific test
- `yarn lint` - Run ESLint, Prettier formatting

## Editor Design and Architecture

### Text-Based Map Creation

- Maps are created using a domain-specific language (DSL)
- Text input is automatically converted to visual map elements
- Two-way binding between text and visualization
- Each map element has a specific syntax (`component Name [visibility, maturity]`)
- Changes to map text are reflected in real-time on the visual map

### Editor Components

- Built on ACE Editor (react-ace) for text editing
- Supports syntax highlighting and auto-completion with a custom mode - mode-owm
- Provides intelligent suggestions for map elements
- Auto-suggests existing component names for links
- Highlights errors in the editor gutter
- Elements can be clicked in the map to highlight their code

### Conversion Pipeline

1. Text input → Converter → Multiple extraction strategies
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
evolve Service 0.9
component Kettle [0.45, 0.57]
pipeline Kettle
{
  component Campfire Kettle [0.50]
  component Electric Kettle [0.63]
}
```

## Map Rendering Architecture

### SVG Structure

- Maps are rendered as SVG with nested group elements
- Coordinate system: (0,0) at top-left, (1,1) at bottom-right
- X-axis represents evolution (genesis to commodity)
- Y-axis represents visibility/value (invisible to visible)
- `PositionCalculator` converts between logical and screen coordinates

### Component Hierarchy

- `MapView` - Top-level container that renders the title and map
- `UnifiedMapCanvas` - Main SVG container that organizes all map elements
- `MapGraphics` - Defines common SVG graphics (markers, patterns, etc.)
- Map foundation elements:
  - `MapBackground` - Renders the background grid
  - `MapGrid` - Renders the grid lines
  - `MapEvolution` - Renders the evolution axis labels

### Map Elements

- `MapComponent` - Base component for map elements with positioning
- `Movable` - HOC that adds drag-and-drop functionality
- `ComponentSymbol` - Visual representation of components (circles, squares)
- Element types:
  - Regular components (circles)
  - Pipeline components (squares)
  - Submap components (nested maps)
  - Market components
  - Ecosystem components

### Interactive Features

- Drag-and-drop positioning of elements
- Quick-link creation by holding mod key + clicking components
- Double-click to add new components at cursor position
- Line highlighting shows code for selected elements
- Inertia indicators for components with resistance to change

### Symbol Components

- Modular SVG-based symbols in `src/components/symbols/`
- Each map element type has a dedicated symbol component:
  - `ComponentSymbol` - Standard component (circle)
  - `PipelineComponentSymbol` - Pipeline component (square)
  - `EcosystemSymbol` - Ecosystem with concentric circles pattern
  - `MarketSymbol` - Market representation with distinctive shape
  - `MethodSymbol` - Shows build/buy/outsource methods
  - `LinkSymbol` - Connection between components with flow options
- Symbol components handle:
  - Visual appearance (SVG elements)
  - Style variations based on state (evolved/normal)
  - Click handlers for interaction
  - Consistent styling via props inheritance
- All components are memoized with React.memo for performance
- Used by higher-level components in `src/components/map/`

### Link Strategies

- Strategy pattern implementation in `src/linkStrategies/`
- Handles the complex logic of component connections:
  - Regular components to regular components
  - Evolved to evolving components
  - Anchors to components
  - Various evolution state combinations
- Key components:
  - `LinksBuilder` - Orchestrates all strategies and builds final links collection
  - Strategy classes for specific link types (e.g., `EvolvedToEvolvingLinksStrategy`)
- Benefits:
  - Separates link determination logic from rendering
  - Handles evolution states elegantly
  - Makes it easy to toggle link visibility based on map settings
  - Allows filtering links based on component states
- Each strategy implements the same interface with:
  - Constructor taking links and map elements
  - `getLinks()` method returning applicable links and elements
