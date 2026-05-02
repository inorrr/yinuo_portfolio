# Hanging Letters Configuration

This document explains the `CONFIG` object in [script.js](/Users/yinuozhao/Desktop/General/yinuo_portfolio/script.js), which controls layout, motion, interaction, and rendering for the hanging-letter landing page.

## Content And Layout

- `name`
  The exact text rendered as the hanging letter installation.

- `sidePadding`
  Horizontal margin as a fraction of viewport width. `0.08` means 8% padding on each side.

- `topAnchorPadding`
  Distance in pixels from the top edge of the viewport to the string anchor points.

- `baseFontDesktop`
  Starting font size for desktop before responsive fitting adjusts it.

- `baseFontMobile`
  Starting font size for mobile before responsive fitting adjusts it.

- `minFont`
  Minimum allowed font size after layout fitting.

- `maxFont`
  Maximum allowed font size.

- `letterSpacingFactor`
  Spacing multiplier between letters. Higher values spread letters farther apart.

- `wordGapFactor`
  Spacing multiplier for the gap between words, such as the space between `YINUO` and `ZHAO`.

- `minLengthFactor`
  Minimum allowed string length as a fraction of viewport height.

- `maxLengthFactor`
  Maximum allowed string length as a fraction of viewport height.

## Physics Core

- `ropeSegments`
  Number of rope segments used for each hanging string.
  Higher values create a smoother, more natural bend because the string is simulated as a chain of points instead of a single breakpoint.
  Lower values make the rope stiffer and more angular.

- `gravity`
  Downward acceleration applied to the moving points. Higher values make the hanging system feel heavier and fall faster.

- `airFriction`
  How much velocity survives each integration step.
  Values below `1` reduce motion over time.
  A value of `1` means almost no damping from air friction itself.
  Values above `1` can create unnatural energy gain.

- `substeps`
  Number of smaller physics updates per fixed simulation step. Higher values improve stability but cost more performance.

- `constraintIterations`
  Number of times rope-length constraints are solved per step. Higher values make the strings feel tighter and less stretchy.

## Return And Settling

- `returnStrength`
  How strongly the lower point carrying each letter is pulled back toward its rest position.

- `midReturnStrength`
  Return strength applied across the rope control points.
  Higher values make the upper part of the rope reorganize itself faster.
  This name remains from the earlier single-midpoint version, but it now affects the multi-point rope chain rather than one midpoint only.

- `settleBoost`
  Extra multiplier applied during recovery when the pointer is no longer actively interacting. Higher values make the letters return more eagerly.

## Idle Motion

- `idleForce`
  Strength of the ambient sway when nothing is touching the letters.

- `idleFrequency`
  Speed of the idle oscillation.

- `idleRestFactor`
  Amount of idle motion that remains during settling.
  `1` keeps full idle motion active.
  `0` removes idle motion completely while settling.
  `0.16` means only 16% of normal idle motion remains.

## Pointer Interaction

- `pointerRadius`
  Distance from the pointer within which a letter point can be affected.

- `pointerRecentMs`
  Time window in milliseconds after movement during which the pointer is still treated as active.

- `pointerVelocityInfluence`
  Amount of pointer speed that contributes to pushing the points.

- `pointerPush`
  Base strength of direct pointer influence on the hanging points.

## String Interaction

- `stringTouchRadius`
  Distance from the pointer within which a rope segment can be bent.

- `stringPull`
  Strength of pointer influence on the rope itself.

## Motion Limits And Rendering

- `maxVelocity`
  Cap on per-step carried velocity. Lower values make motion calmer and prevent explosive swings.

- `stringWidth`
  Stroke width of the strings when rendered on canvas.

- `devicePixelCap`
  Maximum device pixel ratio used for canvas rendering, which helps balance sharpness and performance on dense displays.

## Tuning Notes

- `airFriction: 1` means almost no natural damping from air friction, so most settling comes from return forces and constraint solving.

- `maxVelocity: 1` is very restrictive and can make motion feel highly controlled.

- `constraintIterations` works together with `ropeSegments`.
  More `ropeSegments` makes the rope curve more naturally.
  More `constraintIterations` makes that rope feel tighter and less stretchy.

- Lower `returnStrength` and `midReturnStrength` create a gentler recovery.

- Higher `pointerPush` and `stringPull` increase interaction amplitude.

- Higher `idleForce` makes the letters feel more alive even when untouched.

## Multi-Segment Rope Change

The string system originally used a single midpoint plus the final letter bob, which meant each string effectively had one main bend point.

It now uses a small rope chain:

- a fixed top anchor
- multiple intermediate rope points
- a final bob point carrying the letter

This makes the strings:

- bend more smoothly
- react more naturally to brushing
- distribute motion across the rope instead of hinging at one point
- feel more like a real suspended cord

If you want the rope to look even smoother, increase `ropeSegments`.
If you want it to stay visually tighter and more controlled, increase `constraintIterations` instead of only raising `ropeSegments`.
