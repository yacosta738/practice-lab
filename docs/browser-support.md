# Browser support

## Minimum supported browsers

Practice Lab supports these minimum browser versions:

- Chrome and Edge 123+
- Firefox 121+
- Safari on macOS and iOS 17.5+
- Chrome for Android 123+
- Firefox for Android 121+

The matching Browserslist targets are recorded in `package.json`. These are browser runtime
requirements, not Node.js requirements. Revisit the minimums when changing always-used platform
features or when usage data supports a deliberate baseline change.

The floor is chosen to cover the highest minimum among the site's unconditional features: CSS
`light-dark()` is supported from Chrome/Edge 123, Firefox 120, and Safari 17.5;
`Promise.withResolvers()` from Chrome/Edge 119, Firefox 121, and Safari 17.4; and
`Array.prototype.toSorted()` from Chrome/Edge 110, Firefox 115, and Safari 16. The Firefox minimum
is therefore 121, with the other browser minimums set by `light-dark()`.

## Progressive enhancements

Popover, CSS anchor positioning, `interestfor`, `popover="hint"`, and `Element.setHTML()` remain
progressive enhancements rather than baseline requirements. Keep their feature detection,
conditional polyfills, and rendering fallbacks unless browser testing demonstrates that a path can
be retired safely.

## Verification

Playwright runs the E2E suite against its installed Chromium, Firefox, and WebKit engines. Those are
current engine builds, not tests of each minimum version; WebKit is not a substitute for validating
every Safari or iOS release. Keep compatibility-path tests for the tooltip polyfills and both
`setAppHTML()` rendering branches.

## References

Compatibility thresholds reviewed on 2026-11-26:

- [MDN: `light-dark()`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark)
- [MDN:
  `Array.prototype.toSorted()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted)
  and [Can I Use](https://caniuse.com/mdn-javascript_builtins_array_tosorted)
- [MDN:
  `Promise.withResolvers()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers)
  and [Can I Use](https://caniuse.com/mdn-javascript_builtins_promise_withresolvers)
