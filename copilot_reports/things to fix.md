# List of broken things

- build, buy, outsource visual appearance not correct - colours
- using `buy component` dsl renders on the map but loses its <MapCompoment />
- wardley font has reverted to something else.
- react-ace editor mode-owm format doesn't style component Cup of Tea [0.79, 0.71] "label [-85.48, 3.78]" the quoted parts.
- react-ace-editor mode-owm format doesn't style "evolve" Kettle->Electric Kettle 0.62 "label [16, 5]" quoted parts
- moveable annotations with many coords ends up setting both to the same moved position. This needs to distinguish which instance was moved. Works for the first one.
- It's possible a evolved componenet to be included in the modkey + click fluid linking. This shouldn't happen.
- Improvement - modify decorators and be explicit on buy = bool, build = bool, outsource = bool, similar to market and ecosystem. Remove the use of strings.
- backgrounds are broken,
- drag meth label, seems to be taking the increaselabelspacing when moving the label making it move more than intended.
- dragging evolved components doesn't update mapText with coords.
