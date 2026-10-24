/**
 * Persian text normalisation.
 *
 * Persian is written with the zero-width non-joiner (ZWNJ, U+200C) where a
 * suffix or a compound starts with a connecting letter: `می‌سازد`,
 * `پروژه‌ها`, `توسعه‌دهنده`. When that character is missing — the usual result
 * of typing on a keyboard that has no key for it, or of copying text out of a
 * chat window — the words either run together (`پروژهها`) or are split with a
 * full space (`پروژه ها`). Both look wrong next to correctly set type, and the
 * site mixes user-authored content with dictionary strings, so the two styles
 * end up side by side on the same page.
 *
 * This module fixes the second, more visible case: a full space where a ZWNJ
 * belongs. It is deliberately conservative — it only rewrites the handful of
 * patterns below, because guessing at Persian word boundaries would happily
 * turn `به خانه` into `بهخانه`. Text without Persian characters is returned
 * untouched, so Latin fields can be passed through safely.
 *
 * It is applied on read in `src/lib/data.ts`, which means the rendered page,
 * the JSON-LD, the metadata and the admin panel all agree, whatever is stored.
 */

/** Zero-width non-joiner. */
const ZWNJ = "\u200C";

/**
 * Letters that connect to the letter that follows them.
 *
 * A suffix after one of these needs a ZWNJ (`پروژه‌ها`, `مهارت‌ها`); after any
 * other letter it is written directly (`کارها`, `داناها`). Getting this
 * backwards is the usual reason automated "fixes" produce `کار‌ها`.
 */
const CONNECTING = "بپتثجچحخسشصضطظعغفقکگلمنهی";

/**
 * Letters that do *not* connect to the next letter.
 *
 * After one of these the suffix is attached directly, with no ZWNJ:
 * `کارها`, `داناها`, `روزها`.
 */
const NON_CONNECTING = "اآدذرزژوء";

/**
 * Compounds that are a single word in Persian but are commonly typed as two.
 *
 * Kept as an explicit list rather than a rule: there is no general way to know
 * that `توسعه دهنده` is one word while `به خانه` is two.
 */
const COMPOUNDS: ReadonlyArray<readonly [string, string]> = [
  ["توسعه دهنده", "توسعه‌دهنده"],
  ["فرانت اند", "فرانت‌اند"],
  ["بک اند", "بک‌اند"],
  ["نمونه کار", "نمونه‌کار"],
  ["به زودی", "به‌زودی"],
  ["به عنوان", "به‌عنوان"],
  ["دسته بندی", "دسته‌بندی"],
  ["جعبه ابزار", "جعبه‌ابزار"],
  ["متن باز", "متن‌باز"],
  ["گفت و گو", "گفت‌وگو"],
  ["جاوا اسکریپت", "جاوااسکریپت"],
  ["گیت هاب", "گیت‌هاب"],
  ["علامت گذاری", "علامت‌گذاری"],
  ["دسترس پذیر", "دسترس‌پذیر"],
  ["بی دردسر", "بی‌دردسر"],
  ["جابه جا", "جابه‌جا"],
  ["تمام وقت", "تمام‌وقت"],
  ["سلسله مراتب", "سلسله‌مراتب"],
  ["ری اکت", "ری‌اکت"],
  ["برنامه نویس", "برنامه‌نویس"],
  ["خوانده شده", "خوانده‌شده"],
  ["خوانده نشده", "خوانده‌نشده"],
  ["انتخاب شده", "انتخاب‌شده"],
  ["پروژه ای", "پروژه‌ای"],
  ["سابقه ای", "سابقه‌ای"],
  ["صفحه ای", "صفحه‌ای"],
  ["گزیده ای", "گزیده‌ای"],
  ["کارایی ای", "کارایی‌ای"],
  ["پروژه تان", "پروژه‌تان"],
];

/**
 * The same compounds, typed as one unbroken run of letters.
 *
 * `توسعهدهنده` is the most common Persian typo on a keyboard that has no
 * half-space key: nothing is missing from the sentence, the two halves of a
 * compound have simply been welded together. These cannot be found by rule —
 * there is no way to tell where one morpheme ends and the next begins — so the
 * list is explicit and limited to the vocabulary this site actually uses.
 *
 * Replacements are applied to whole words, which is why the entries are short
 * enough not to appear inside an unrelated word.
 */
const GLUED: ReadonlyArray<readonly [string, string]> = [
  ["توسعهدهنده", "توسعه‌دهنده"],
  ["برنامهنویس", "برنامه‌نویس"],
  ["فرانتاند", "فرانت‌اند"],
  ["بکاند", "بک‌اند"],
  ["نمونهکار", "نمونه‌کار"],
  ["جعبهابزار", "جعبه‌ابزار"],
  ["بهزودی", "به‌زودی"],
  ["بهعنوان", "به‌عنوان"],
  ["دستهبندی", "دسته‌بندی"],
  ["متنباز", "متن‌باز"],
  ["گیتهاب", "گیت‌هاب"],
  ["جاوااسکریپت", "جاوااسکریپت"],
  ["تایپاسکریپت", "تایپ‌اسکریپت"],
  ["ریاکت", "ری‌اکت"],
  ["دسترسپذیر", "دسترس‌پذیر"],
  ["بیدردسر", "بی‌دردسر"],
  ["جابهجا", "جابه‌جا"],
  ["تماموقت", "تمام‌وقت"],
  ["سلسلهمراتب", "سلسله‌مراتب"],
  ["خواندهشده", "خوانده‌شده"],
  ["خواندهنشده", "خوانده‌نشده"],
  ["انتخابشده", "انتخاب‌شده"],
  ["علامتگذاری", "علامت‌گذاری"],
  ["پروژهای", "پروژه‌ای"],
  ["سابقهای", "سابقه‌ای"],
  ["صفحهای", "صفحه‌ای"],
  ["گزیدهای", "گزیده‌ای"],
  ["گفتوگو", "گفت‌وگو"],
];

/**
 * Stems whose plural is often welded shut (`پروژهها`, `مهارتها`).
 *
 * A blanket "add a ZWNJ before every `ها`" rule would be wrong — `تنها` and
 * `گیاهان` end the same way — so the stems are listed and the suffix is matched
 * against them, longest form first.
 */
const PLURAL_STEMS = [
  "پروژه",
  "مهارت",
  "پیام",
  "تجربه",
  "ابزار",
  "فناوری",
  "داده",
  "تصویر",
  "نمونه‌کار",
  "کامپوننت",
  "کتابخانه",
  "سرویس",
  "فرصت",
  "رابط",
  "قابلیت",
] as const;

/**
 * Suffixes that are sometimes written as a separate word.
 *
 * The replacement depends on the preceding letter, which is why this is a
 * function and not a lookup table.
 */
const SUFFIXES = ["هایم", "های", "ها"] as const;

const PERSIAN = /[\u0600-\u06FF]/;

/**
 * Normalises spacing in a Persian string.
 *
 * Idempotent: running it twice changes nothing.
 */
export function normalizePersian(input: string): string {
  // Latin-only text (a project title, a technology name) must pass through
  // byte for byte.
  if (!PERSIAN.test(input)) return input;

  let text = input;

  // Arabic yeh and kaf → Persian. These render differently inside a Persian
  // sentence and are the other common artefact of copy-paste.
  text = text.replace(/\u064A/g, "\u06CC").replace(/\u0643/g, "\u06A9");

  // Collapse runs of spaces and tabs, but never newlines: long descriptions
  // are paragraph-separated by blank lines.
  text = text.replace(/[ \t]{2,}/g, " ");

  // "می سازد" / "نمی شود" → "می‌سازد" / "نمی‌شود".
  // The progressive prefix is never a standalone word in this content.
  text = text.replace(/(^|[\s\u200C])(ن?می)[ \t]+/g, `$1$2${ZWNJ}`);

  for (const [from, to] of COMPOUNDS) {
    text = text.split(from).join(to);
  }

  // "توسعهدهنده" → "توسعه‌دهنده": the same compounds with no separator at all.
  for (const [from, to] of GLUED) {
    text = text.split(from).join(to);
  }

  // "پروژهها" → "پروژه‌ها". Runs after GLUED so a welded compound is already
  // spelled correctly before its plural is looked at.
  for (const stem of PLURAL_STEMS) {
    text = text.split(`${stem}های`).join(`${stem}${ZWNJ}های`);
    text = text.split(`${stem}ها`).join(`${stem}${ZWNJ}ها`);
  }

  // "پروژه ها" → "پروژه‌ها", but "کار ها" → "کارها" (no ZWNJ after ر).
  for (const suffix of SUFFIXES) {
    const pattern = new RegExp(
      `([${CONNECTING}])[ \\t]+(${suffix})(?![\\u0600-\\u06FF])`,
      "g",
    );
    text = text.replace(pattern, `$1${ZWNJ}$2`);

    const plain = new RegExp(
      `([${NON_CONNECTING}])[ \\t]+(${suffix})(?![\\u0600-\\u06FF])`,
      "g",
    );
    text = text.replace(plain, "$1$2");
  }

  // No space before Persian punctuation.
  text = text.replace(/[ \t]+([،؛:!؟.»])/g, "$1");
  // No space after opening punctuation.
  text = text.replace(/([«(])[ \t]+/g, "$1");

  // A space next to a ZWNJ is always wrong; the ZWNJ is the separator.
  text = text.replace(/[ \t]*\u200C[ \t]*/g, ZWNJ);

  return text.trim();
}

/**
 * Normalises the given string fields of a plain object.
 *
 * Returns a new object; `undefined` and non-string values are left as they are
 * so the caller's shape is preserved.
 */
export function normalizePersianFields<T>(
  source: T,
  fields: ReadonlyArray<string>,
): T {
  const result: Record<string, unknown> = { ...(source as Record<string, unknown>) };

  for (const field of fields) {
    const value = result[field];
    if (typeof value === "string") {
      result[field] = normalizePersian(value);
    } else if (Array.isArray(value)) {
      result[field] = value.map((entry) =>
        typeof entry === "string" ? normalizePersian(entry) : entry,
      );
    }
  }

  return result as T;
}
