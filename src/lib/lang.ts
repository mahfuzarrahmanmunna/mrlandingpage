const BENGALI = /[ঀ-৿]/;

/** `lang` attribute for mixed-language copy, so browsers, screen readers and crawlers read the right script. */
export function langOf(text: string | undefined) {
  return text && BENGALI.test(text) ? "bn" : undefined;
}
