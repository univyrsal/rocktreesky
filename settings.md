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

The background of the thermometer + pay panel.

```js
PANEL_COLOR = "#FCFBF5"
```

The page's background color, behind the info.

```js
BACKGROUND_COLOR = "#CCCCCC"
```

## Fonts

The font for headings (the page title and the big dollar amount) and the font for everything else, each with its weight: `400` is regular, `500` medium, `700` bold, `900` black. Type the font's name exactly as its maker spells it.

```js
HEADING_FONT = "Gotham Rounded"
HEADING_WEIGHT = 700

BODY_FONT = "Gotham Rounded"
BODY_WEIGHT = 700
```

Where fonts come from:

- Any font on [Google Fonts](https://fonts.google.com) works just by typing its name above.
- Any other font (like Gotham Rounded, which is sold by Hoefler&Co and isn't on Google Fonts) needs its font file in the `fonts` folder, listed here with its name and weight. `.woff2` files are smallest and load fastest; `.woff`, `.otf` and `.ttf` work too. Add one line per file, for example a second line with `weight: 400` for a regular file.

```js
FONT_FILES = [
  { family: "Gotham Rounded", weight: 700, file: "fonts/GothamRounded-Bold.woff2" },
]
```

The font shown while the main font loads, or instead of it if it can't be found (for example before its file is in the `fonts` folder). Nunito is a free rounded font from Google Fonts that looks similar to Gotham Rounded. If a font doesn't load, the browser console says which one and why.

```js
FALLBACK_FONT = "Nunito"
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

## The thermometer + pay panel

Which side of the screen the thermometer and pay widget sit on: `"right"` (the info is read first, then the pay form is right beside it) or `"left"` (the goal is the first thing people see).

```js
PANEL_SIDE = "right"
```

- `true` = the thermometer and pay widget stay in place on the screen while the info scrolls.
- `false` = they scroll away with the rest of the page.

On narrow screens (phones, small tablets) there isn't room for side-by-side, so the page always stacks: thermometer, then the info, then the pay widget.

```js
STAY_IN_PLACE = true
```

How wide the pay widget's column is.

```js
PAY_PANEL_WIDTH = 420
```

## Page text and pictures

The words on the page live in `content.md`, next to this file. Open it in any text editor, change the words, save, and reload the page. Pictures go in the `images` folder.

How to write it:

- The first line, starting with `# `, is the page's big title. The paragraph right under it is shown a little lighter, as a tagline.
- Leave an empty line between paragraphs. Each extra empty line adds a line's worth of space.
- `# Words` on its own line is a heading. `## Words` is a centered heading, and the lines right under it are centered too (good for a name with a photo).
- `**bold**`, `*italic*`, `***both***`.
- `[words people click](https://example.com)` is a link.
- `- item` makes a bulleted list, `1. item` a numbered list, and `1) item` numbered steps, each number in an accent-colored circle.
- `->` on its own line starts centering everything after it, `<-` on its own line stops. Or put `-> one line <-` on a line by itself.
- A `\` in front of a character shows it as it is, for example `\*` for a real asterisk.

Pictures:

- Put the picture file in the `images` folder, then write `![a few words describing it](images/the-file-name.jpg)` in `content.md`. The words in the square brackets are read aloud to people who can't see the picture.
- On a line of its own, a picture sits by itself, centered.
- A picture from another website works too, as long as its address starts with `https://`.
- Keep pictures under about 500 KB each (around 1500 pixels wide is plenty) so the page loads fast.

Widest a picture can be, in pixels. The text column is 720 wide, so 720 fills it.

```js
PICTURE_WIDTH = 720
```

How tall pictures are, in pixels. 0 lets each picture keep its own shape. Any other number makes every picture that tall: it fills the width and the height, taking the middle of the picture if the shape doesn't match, so a row of headshots all line up.

```js
PICTURE_HEIGHT = 0
```

How rounded the corners of pictures are, in pixels. 0 is square corners.

```js
PICTURE_CORNER_RADIUS = 12
```
