// How the motion code talks to the red string without owning it. The string measures and draws
// itself (RedString); the head opening tells it how slack its first run is, and anything that
// settles cards tells it to measure its pins again.

export const STRING_SLACK = "redstring:slack";
export const STRING_MEASURE = "redstring:measure";

/** How slack the string's first run is: 0 is taut (its normal sag), about 0.15 hangs loose. */
export function setStringSlack(amount: number) {
  window.dispatchEvent(new CustomEvent(STRING_SLACK, { detail: amount }));
}

/** Asks the string to measure its pins again (after cards have settled). */
export function remeasureString() {
  window.dispatchEvent(new Event(STRING_MEASURE));
}
