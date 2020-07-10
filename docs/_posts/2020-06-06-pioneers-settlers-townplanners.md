---
layout: post
title: 'Using Pioneers, Settlers and Town Planners'
author: 'OnlineWardleyMaps'
---

## Usage:

```
pioneers [<visibility>, <maturity>] <width> <height>
settlers [<visibility>, <maturity>] <width> <height>
townplanners [<visibility>, <maturity>] <width> <height>
```

## Let's look at each part.

`pioneers`, `settlers` and `townplanners` are keywords. Each new line in your editor should begin with one of these keywords.

`<visibility>` and `<maturity>` are the co-ordinates of where you want the block to appear on your map. For example 0.9, 0.2 would translate roughly to _Visible_ and _Custom Built_.

As we build it up it should now look like

`pioneers [0.9, 0.2]`

Next up are the width and height properties. These are numbers. A good starter would be 150 80.

`pioneers [0.9, 0.2] 150 80`

An example of a Web Site component with pioneers would look like:

```
component Web Site [0.82, 0.25]
build Web Site
pioneers [0.9, 0.2] 150 80
```

## Output

![My helpful screenshot](/assets/pst-output.png)
