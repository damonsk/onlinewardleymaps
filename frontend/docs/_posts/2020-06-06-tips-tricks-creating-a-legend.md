---
layout: post
title: "Tips and Tricks #2 - Creating a Legend"
author: "OnlineWardleyMaps"
---

## Pioneers, Settlers and Town Planners Example

Notes are generic pieces of text that you can place anywhere on a map.  They can be versatile and allow you to add more context.  

Here is an example of using `note` elements combined with `pioneers`, `settlers` and `townplanners` elements to create a legend in the top right of the map.


### Template (copy and paste into your map)
```
// PST Legend Top Right
pioneers [0.95, 0.83] 120 30
settlers [0.88, 0.83] 120 30
townplanners [0.81, 0.83] 120 30

note Pioneers [0.91, 0.85]
note Settlers [0.84, 0.85]
note Town Planners [0.77, 0.85]
```

### Output

![Pioneers, Settlers and Town Planner Legend Example](/assets/tt2-pst.png)

To get started with this template <a href="https://onlinewardleymaps.com/#clone:owm-tips-tricks-pst" target="_blank">click here to clone this example.</a>
