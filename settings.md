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

The accent color is used for the numbered-step circles in the page text.

```js
ACCENT_COLOR = "#91BD7D"
```

The page's background color, behind the info.

```js
BACKGROUND_COLOR = "#FCFBF4"
```

The color of the words.

```js
TEXT_COLOR = "#22302B"
```

## The title bar

The bar across the top of the screen, behind the title. `""` = no bar, just the page's background. The second color is for the title's words on the bar (`""` = the same as `TEXT_COLOR`).

```js
TITLE_BAR_COLOR = "#91BD7D"
TITLE_BAR_TEXT_COLOR = ""
```

The logo at the left of the bar, from the `images` folder (`.avif`, `.png`, `.jpg`, `.svg` and `.webp` all work). `""` = no logo. Clicking it goes to `LOGO_LINK` (`""` = not clickable). `LOGO_HEIGHT` is how tall it is in pixels (on phones at most 44). The words describe it for people who can't see it, so say where it goes.

```js
LOGO_IMAGE = "images/RTS_Logo-icon.avif"
LOGO_LINK = "https://rocktreesky.org"
LOGO_HEIGHT = 72
LOGO_WORDS = "Rock Tree Sky home page"
```

- `true` = the logo is shown all black.
- `false` = its own colors.

```js
LOGO_BLACK = true
```

## Fonts

The font for headings (the page title and the headings in the text) and the font for everything else, each with its weight: `400` is regular, `500` medium, `700` bold, `900` black. Type the font's name exactly as its maker spells it.

```js
HEADING_FONT = "Gotham Rounded"
HEADING_WEIGHT = 700

BODY_FONT = "Gotham Rounded"
BODY_WEIGHT = 700
```

How heavy `**bold**` words in the text are. It needs to be heavier than `BODY_WEIGHT` to stand out: with the text at 700, use `900` (black). A font from a file needs that weight's file in `FONT_FILES` too.

```js
BOLD_WEIGHT = 900
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

## The page layout

From top to bottom: the title, centered; the route map, text and the donation form side by side; then the student quotes, in two columns. On a mid-size screen the top row's text goes under the map. On narrow screens (phones, small tablets) everything stacks, left one first.

How far the page's contents stay from the left and right edges of the screen, in pixels (phones always use 16).

```js
PAGE_SIDE_SPACE = 96
```

The widest the contents can get, in pixels. On a screen wider than this plus the side space, the extra is left empty either side.

```js
PAGE_WIDTH = 1600
```

- `true` = the page's scroll bar is hidden (the page still scrolls with the mouse wheel, trackpad, touch or keyboard).
- `false` = the browser's normal scroll bar.

```js
HIDE_SCROLLBAR = true
```

How wide the text between the map and the form is, in pixels. The map gets the rest of the row. On screens narrower than about 1500 pixels there's no room for all three across, so this text goes under the map instead.

```js
TOP_TEXT_WIDTH = 300
```

The space between one row of sections and the next, and between the sections side by side in a row.

```js
ROW_GAP = 96
COLUMN_GAP = 64
```

Each row's color, title and picture. The rows are `top` (the map, text and form) and `bottom` (the student quotes).

- `color`: fills the row's background out to the edges of the screen. `"accent"` uses `ACCENT_COLOR`. `""` = no color.
- `title`: a heading centered across the top of the row. `""` = none.
- `picture`: a picture from the `images` folder, under the title and across the whole row. `""` = none. `pictureWords` describe it for people who can't see it.

```js
SECTIONS = {
  top:    { color: "", title: "" },
  bottom: { color: "", title: "Hear From The Students", picture: "images/college_tour_students.jpg", pictureWords: "" },
}
```

The space above and below the contents of a colored row, and how big row titles are, in pixels (titles shrink on phones so they fit).

```js
SECTION_PADDING = 64
SECTION_TITLE_SIZE = 36
```

How tall a row's picture is, in pixels. It fills the row's width and is cropped to this height, keeping the middle. `0` = the picture's own shape.

```js
SECTION_PICTURE_HEIGHT = 480
```

## The donation form

The Zeffy donation form. In Zeffy, open the campaign's Share options and copy its link (or its embed code's link, either works), then paste it here between the quotes. `""` shows a placeholder box instead.

```js
ZEFFY_FORM_LINK = ""
```

The words in the box while `ZEFFY_FORM_LINK` is `""`. `\n` starts a new line, like `"Donations open soon!\nCheck back in March."`.

```js
FORM_PLACEHOLDER = "Donation payment form will go inside this box (with details such as funds raised etc)"
```

How tall and wide the form is, in pixels. A form longer than this scrolls inside itself.

```js
FORM_HEIGHT = 700
FORM_WIDTH = 480
```

## Page text and pictures

Each section of words on the page has its own file in the `text` folder, named for where it is: `title.md` (the big title at the top), `beside-form.md` (between the map and the form), and `bottom-left.md` and `bottom-right.md` (the student quotes). Open one in any text editor, change the words, save, and reload the page. Pictures go in the `images` folder.

How to write it:

- In `title.md`, the first line, starting with `# `, is the page's big title. Every line right under it (up to an empty line) is another line of the title, so a long title can be split where you like. After an empty line, a paragraph is shown a little lighter, as a tagline.
- Leave an empty line between paragraphs. Each extra empty line adds a line's worth of space.
- `# Words` on its own line is a heading. `## Words` is a centered heading, and the lines right under it are centered too (good for a name with a photo).
- `**bold**`, `*italic*`, `***both***`.
- `[words people click](https://example.com)` is a link.
- `- item` makes a bulleted list, `1. item` a numbered list, and `1) item` numbered steps, each number in an accent-colored circle.
- `->` on its own line starts centering everything after it, `<-` on its own line stops. Or put `-> one line <-` on a line by itself.
- A `\` in front of a character shows it as it is, for example `\*` for a real asterisk.

How big the words are, in pixels: the text sections, and the big title at the top (it shrinks on phones so it fits).

```js
TEXT_SIZE = 17
TITLE_SIZE = 56
```

Text sections to center, by file name, like `["beside-form.md", "bottom-left.md"]`. `[]` centers none. (The title is always centered. To center just part of a section, use `->` and `<-` as above.)

```js
CENTERED_TEXT = []
```

Text sections shown as rounded boxes, by file name. Leave two or more empty lines in the file where one box ends and the next begins. `BOX_COLOR` is their color (`"accent"` uses `ACCENT_COLOR`).

```js
BOXED_TEXT = ["bottom-left.md", "bottom-right.md"]
BOX_COLOR = "#EDEBD5"
```

- `true` = each box slides in from its side when it scrolls into view, taking `BOX_ANIMATION_MS` (1000 = 1 second).
- `false` = the boxes are just there.

```js
BOX_ANIMATION = true
BOX_ANIMATION_MS = 700
```

How far up the screen a box's top has to come before it slides in, in percent of the screen's height from the bottom. `0` = as soon as it peeks in at the bottom; `25` = a quarter of the way up.

```js
BOX_START = 25
```

The space between one box and the next, in pixels.

```js
BOX_GAP = 64
```

Other text sections shown as one rounded box in `BOX_COLOR`, by file name. These don't slide in. `[]` = none.

```js
TEXT_CARDS = ["beside-form.md"]
```

Pictures:

- Put the picture file in the `images` folder, then write `![a few words describing it](images/the-file-name.jpg)` in a text file. The words in the square brackets are read aloud to people who can't see the picture.
- On a line of its own, a picture sits by itself, centered.
- Add `{banner}` after it (`![words](images/x.jpg) {banner}`) to make it a banner: it runs the full width of the section, edge to edge, with square corners.
- `!map!` on a line of its own shows another copy of the route map (it already has its own spot, at the top).
- A picture from another website works too, as long as its address starts with `https://`.
- Keep pictures under about 500 KB each (around 1500 pixels wide is plenty) so the page loads fast.

Widest a picture in the text can be, in pixels. A picture never gets wider than its section.

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

How tall `{banner}` pictures are, in pixels. 0 lets each keep its own shape. Any other number crops it to that height, keeping the middle.

```js
BANNER_HEIGHT = 0
```

## The route map

The animated map of the tour route, at the top left. When it scrolls into view, the line draws itself from the start, and each stop pops up as the line reaches it.

- `true` = the map sits in a rounded box like the student quotes (`BOX_COLOR`).
- `false` = just the map on the page.

```js
MAP_CARD = false
```

Positions are pixels on the satellite picture (`images/California-Satellite-Map.jpg`, 2114 wide and 2030 tall), counted from its top left corner. You don't have to measure them: turn on `MAP_EDIT_MODE` (below) and click the map.

The route, in order:

- `["Name", x, y]` is a stop. The first one is the start (a blue dot); the rest are numbered 1, 2, 3 in order and listed in the key. Add `"left"`, `"right"`, `"above"` or `"below"` after the position to say which side of the dot its name goes (right if left out).
- `[x, y]` is just a bend in the road. The line goes straight from each position to the next, so add bends wherever the road turns. Several can go on one line.

```js
ROUTE = [
  ["Ojai", 1104, 1629],
  [1093, 1643], [1094, 1654], [1092, 1660], [1088, 1660], [1054, 1640], [939, 1628], [936, 1622], [938, 1602],
  [937, 1595], [901, 1535], [867, 1488], [855, 1458], [847, 1380], [812, 1301], [773, 1260], [734, 1211],
  [681, 1158], [678, 1139], [663, 1138], [660, 1131], [660, 1114], [659, 1107], [640, 1095], [620, 1095],
  ["UC Santa Cruz", 613, 1092, "left"],
  [620, 1089], [626, 1062], [628, 1041], [636, 1026],
  ["San José State", 643, 1019, "below"],
  [634, 1021], [616, 1019], [597, 1007],
  ["Stanford", 595, 999, "left"],
  [597, 991], [604, 983], [622, 976], [605, 946], [575, 913],
  ["UC Berkeley", 580, 904],
]
```

Colors of the line, the numbered stops and the start, and how thick the line is in screen pixels.

```js
ROUTE_COLOR = "#FDC500"
STOP_COLOR = "#DC283C"
START_COLOR = "#1E78FF"
ROUTE_WIDTH = 4
```

The key: its title, the numbered list of stops, and a note under them.

- `true` = the key is shown.
- `false` = no key, just the map.

```js
SHOW_MAP_KEY = false
```

The key's title and the note under its list of stops. `""` leaves either out.

```js
ROUTE_TITLE = "Route from Ojai"
ROUTE_NOTE = ""
```

Where the key's top left corner goes on the map. `[]` puts it under the map instead. (On a small screen it always goes under the map.)

```js
MAP_LEGEND_AT = [70, 1650]
```

The zoomed-in box, for stops too close together to read on the whole map:

- `area`: the top left and bottom right corners of the part of the map to zoom in on.
- `at`: where the box's top left corner goes on the map.
- `width`: how wide the box is, in map pixels. Its height follows the area's shape. The bigger it is compared to the area, the more it zooms in.
- `title`: shown beside the box. `""` for none.

Stops inside the area get their numbers and names in the box, and a small dot on the main map. Use `MAP_DETAIL = null` for no box.

```js
MAP_DETAIL = {
  area: [[520, 883], [687, 1115]],
  at: [1135, 35],
  width: 564,
  title: "",
}
```

- `true` = the line draws itself when the map scrolls into view, taking `ROUTE_DRAW_MS` (1000 = 1 second).
- `false` = the whole route is just there.

```js
ROUTE_ANIMATION = true
ROUTE_DRAW_MS = 4000
```

- `true` = clicking the map shows its position and copies it, to paste into the settings above. A click in the zoomed box gives the spot's position on the main map. Turn it off before the page goes live.
- `false` = normal.

```js
MAP_EDIT_MODE = false
```
