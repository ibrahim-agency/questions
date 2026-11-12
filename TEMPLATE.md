# The Freelancers — client questionnaires

Each client gets a folder. Its link is `https://ibrahim-agency.github.io/questions/<folder>/`.

## Add a new client
1. Copy the `trycotton` folder and rename the copy (e.g. `newbrand`).
2. In `newbrand/index.html`, change only the `window.TF_FORM` block:
   - `client`: the client's name (shown small in the footer)
   - `whatsapp`: the number that receives the answers (country code, no + or spaces)
   - `messageTitle`: first line of the WhatsApp message
   - `steps`: the questions
   - the page `<title>`
3. Commit and push to `main`. The link works in a minute or two.

## Step types
- `intro`: title + hint + start button
- `text`: free text (`long: true` for a big box, `required: true` to force an answer)
- `single`: one choice, moves on by itself (`other: true` adds "غير ذلك" with a text box)
- `multi`: several choices
- `review`: summary + send on WhatsApp + copy
- `when: a => ...`: only show the step if earlier answers match

## Design
All styling lives in `assets/freelancers.css` (ink `#1A1916` and linen `#F2ECE2` only;
Inter Tight, IBM Plex Sans Arabic, IBM Plex Mono). The logic lives in `assets/questionnaire.js`.
Change those once and every client page updates.

## Logo
Put `tf-lockup-horizontal-ink.svg` and `tf-lockup-horizontal-linen.svg` from the logo pack in
`assets/`, then set `HAS_LOGO = true` at the top of `assets/questionnaire.js`.
Until then the header shows the name set in Inter Tight.
