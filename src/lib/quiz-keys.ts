// Keyboard shortcuts available while answering a question.
//
// The quiz UI renders up to five options (A–E), so the numeric shortcuts must
// cover all five positions. The certification page passes this list to its
// inline script because that script cannot import modules.

export const OPTION_SHORTCUT_KEYS: readonly string[] = ["1", "2", "3", "4", "5"];
