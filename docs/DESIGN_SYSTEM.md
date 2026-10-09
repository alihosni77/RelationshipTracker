# Design system

## Direction

**Quiet intimacy, not neon gamification.** The visual language uses an ink-dark canvas, warm rose as the emotional accent, soft lavender for reflective/secondary actions and restrained green for positive status. Surfaces are layered by contrast and border, not by adding a different bright color to every card.

The design should feel composed and premium while remaining friendly. It should not resemble a finance dashboard, a dating marketplace or a game leaderboard.

## Foundations

The source of truth is **src/theme.ts**.

### Color roles

- Background: the deepest ink layer behind the whole screen.
- Background soft: inputs and inset surfaces that need separation from the canvas.
- Surface: standard cards and form containers.
- Elevated surface: controls or nested panels.
- Warm surface: emotionally important moments such as Love Tap.
- Text: primary copy and headings.
- Text soft: supporting labels that still need clear contrast.
- Muted: secondary copy; never use it for essential instructions if contrast is too weak.
- Border / border strong: structure and keyboard/focus affordances.
- Primary / primary soft: primary action and its lighter accents.
- Secondary / secondary soft: secondary actions, reflection and supporting highlights.
- Success / warning / danger: semantic states only.

Avoid arbitrary hex values in screens except for a documented decorative overlay. If a color is reused, promote it to a named token.

### Spacing and shape

Use the shared spacing scale (4, 8, 12, 16, 20, 24, 32, 40) and radius scale. Prefer a consistent rhythm over screen-specific one-off values. Cards should use one clear border, controlled padding and a single focal point.

### Typography and language

- Persian is the primary interface language.
- Headings are bold and concise; body copy should be readable and not overly compressed.
- Use text alignment and writing direction deliberately. Right-align Persian labels and content; do not assume that flexDirection alone handles RTL text direction.
- Use tabular numerals for timers and metrics where available.
- Avoid excessive all-caps English labels. Small English brand captions are decorative and must not carry essential meaning.

## Screen composition

### Welcome
- Brand mark and name establish identity.
- One visual focal point supports the emotional promise.
- Main title, concise explanatory copy and one dominant call to action.
- Privacy copy is present but secondary.

### Authentication
- One clear title and one concise explanation.
- Group fields in a single form surface with visible labels.
- Show validation and loading states; do not rely on placeholder text as the only label.
- Keep login/register switching easy to discover.
- Never add a password hint that implies the app can recover the original password.

### Home
- Brand/status row → personalized greeting → next meaningful moment → Love Tap → feature grid → privacy/wellbeing note.
- The next event should be the primary content anchor.
- Love Tap should look actionable but must not use motion or color to pressure repeated use.
- Feature cards share geometry and hierarchy; icons and accent colors may vary by semantic role.
- Provide clear empty states when there is no event or no partner pairing.

### Feature screens
- Keep the same surface, typography and input conventions as the refreshed welcome/auth/home screens.
- Every screen needs loading, empty, error and success states appropriate to its behavior.
- Keep destructive and privacy-sensitive actions visually distinct and explain their consequences.

## Interaction standards

- Interactive controls should have a comfortable touch area (target 44 × 44 points where practical).
- Every icon-only control needs an accessibility label.
- Pressed, disabled, loading, selected and error states must be visually distinguishable.
- Never communicate a state only through color.
- Respect reduced-motion preferences if animation is introduced.
- Do not use animation to obscure data sharing, permissions or consent changes.

## Responsive rules

- The same screen should remain usable on narrow phones and wider browser windows.
- Use centered max-width content on Web; do not stretch reading lines across a desktop viewport.
- Test a narrow viewport, a typical phone viewport and a wide browser viewport.
- Verify keyboard overlap, text scaling, safe areas and scroll reachability on native devices.

## Accessibility and QA checklist

- [ ] Main text is legible at default and increased system font sizes.
- [ ] Text/background contrast is sufficient; check actual token pairs rather than judging by appearance.
- [ ] All actions work with screen readers and have meaningful labels.
- [ ] Keyboard focus is visible on Web.
- [ ] RTL reading order and arrow direction are intentional.
- [ ] Empty, error, loading and disabled states are tested.
- [ ] No important text is clipped on small screens.
- [ ] Buttons do not depend on a color difference alone.
- [ ] The screen has one dominant focal point and a clear action hierarchy.
