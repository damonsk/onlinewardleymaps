
## How it works
1. The user interface accepts a text string known as mapText.  This mapText is a specific DSL format for onlinewardleymaps.
2. The mapText is parsed and converted into a structured format that can be used to render the map.
3. This process begins in frontend/src/conversion/Converter.ts. There are several interfaces/types to help with the conversion process in this file.
4. MapEnvironment.tsx begins the render, invokes the Converter to get the "WardleyMap" object, this is then passed to various useStates.
5. MapEnvironment renders MapView.tsx, passing the various WardleyMap types.
6. MapView.tsx additionally passes these objects to MapCanvas.js.  MapCanvas then uses MapElements class in frontend/src/MapElements.ts.   
7. Because there is a change in the MapElements.ts, it is important to update MapElements to use the original WardleyMap object, not the converted one.  This is because the MapElements class uses the original WardleyMap object and types to ensure consistency.
8. Ensure types are stores in frontend/src/types.
9. It is likely the types already exist, but they may lack the properties, so don't create new ones unless absolutely necessary.  
10. Ensure integrity, make sure types are not optional and set default values upstream from the Converter.ts.