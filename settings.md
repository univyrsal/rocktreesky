# Rock Tree Sky — Page Settings

Every adjustable setting for the fundraising page lives in this file. The page reads only the grey code blocks; everything else (like this text) is notes for people, so write notes anywhere you like.

How to edit:

- Each setting looks like `NAME = value`, inside a code block (between lines of three backticks).
- Numbers are plain (`80`). Text and colors go in quotes (`"#ffffff"`). On/off settings are `true` or `false` with no quotes.
- Save this file, then reload the page to see the change.
- If a code block has a mistake, just that block is skipped and its settings fall back to the built-in defaults (the browser console says which block).
- Settings only load when the page is served (on localhost or online), not when index.html is opened straight from the folder.

Sizes are in screen pixels at normal zoom. 96 pixels is about 1 inch.

## Colors

The accent color fills the thermometer and its bulb.

```js
ACCENT_COLOR = "#6ABF4B"
```

## The thermometer

The goal shown before the first Givebutter sync. Once the GitHub Action has synced, the goal set on the Givebutter campaign is used instead, so change it there too.

```js
DEFAULT_GOAL = 10000
```

How far apart the dollar marks along the tube are. `2500` puts marks at $2,500, $5,000, $7,500 and $10,000. `0` hides them.

```js
SCALE_STEP = 2500
```

How wide the tube is. The bulb at the bottom grows with it.

```js
THERMOMETER_WIDTH = 56
```

Whether the thermometer fills up and the dollar amount counts up when the page opens (`true`), or both just appear already filled (`false`). The second setting is how long the fill takes, in milliseconds (1000 = 1 second).

```js
ANIMATE_ON_LOAD = true
FILL_ANIMATION_MS = 1600
```

## The left panel

- `true` = the thermometer and pay widget stay in place on the screen while the info on the right scrolls.
- `false` = they scroll away with the rest of the page.

On narrow screens (phones, small tablets) there isn't room for side-by-side, so the page always stacks: thermometer, then the info, then the pay widget.

```js
STAY_IN_PLACE = true
```

How wide the pay widget's column is.

```js
PAY_PANEL_WIDTH = 420
```
