/**
 * Persian (fa-IR) dictionary — the primary locale.
 *
 * Written as native Persian rather than a literal translation of the English
 * file: sentences are re-shaped where a word-for-word rendering would read
 * stiffly, and the half-space (ZWNJ, U+200C) is used wherever Persian
 * orthography requires it (`می‌شود`, `پروژه‌ها`, `به‌زودی`).
 *
 * Conventions this file follows:
 *   - Half-space in every compound and prefix: `توسعه‌دهنده فرانت‌اند`,
 *     `نمونه‌کار`, `بی‌دردسر`, `دسترس‌پذیر`, `سلسله‌مراتب`.
 *   - Persian punctuation, never the Latin one: `،` `؛` `:` `؟` and `«»`
 *     for quotations. `٫` is not used; numbers stay as typed.
 *   - No `!`, no exclamation-style enthusiasm, no emoji: the register is a
 *     colleague describing work, not a brochure.
 *   - Verbs are active and specific. "می‌سازم" beats "ساخته می‌شود";
 *     "در اولین فرصت پاسخ می‌دهم" beats "منتظر شنیدن صدای شما هستیم".
 *
 * Glossary for shared domain terms (kept consistent across the app):
 *   front-end developer → توسعه‌دهنده فرانت‌اند
 *   project             → پروژه
 *   skill               → مهارت
 *   experience          → سابقه کاری
 *   message             → پیام
 *   featured            → شاخص
 * Technology names (React, Next.js, TypeScript) stay in Latin script, which is
 * how Persian-speaking developers write them.
 */

import type { Dictionary } from "./en";

const fa = {
  meta: {
    siteName: "علی سویزی",
    role: "توسعه‌دهنده فرانت‌اند",
    homeTitle: "علی سویزی — توسعه‌دهنده فرانت‌اند",
    homeDescription:
      "نمونه‌کارهای علی سویزی، توسعه‌دهنده فرانت‌اند که رابط‌های وب سریع و دسترس‌پذیر را با React، Next.js و TypeScript می‌سازد.",
    keywords: [
      "علی سویزی",
      "توسعه‌دهنده فرانت‌اند",
      "برنامه‌نویس ری‌اکت",
      "Next.js",
      "TypeScript",
      "طراحی وب",
      "نمونه‌کار",
    ],
    ogImageAlt: "علی سویزی — توسعه‌دهنده فرانت‌اند",
    adminTitle: "پنل مدیریت",
    loginTitle: "ورود",
  },

  language: {
    label: "زبان",
    switchTo: "تغییر زبان به {language}",
  },

  nav: {
    label: "پیمایش بخش‌ها",
    home: "خانه",
    about: "درباره من",
    experience: "سابقه کاری",
    work: "نمونه‌کارها",
    contact: "تماس",
    navigateTo: "رفتن به بخش {section}",
  },

  hero: {
    greeting: "سلام، من",
    getInTouch: "تماس با من",
    downloadResume: "دریافت رزومه",
    scroll: "برای ادامه اسکرول کنید",
  },

  about: {
    heading: "درباره من",
    paragraph2:
      "به جزئیاتی اهمیت می‌دهم که باعث می‌شوند یک رابط بی‌دردسر کار کند: سلسله‌مراتب بصری روشن، تعامل دسترس‌پذیر و سرعتی که روی اینترنت کند هم دوام بیاورد. در وقت‌های آزاد درباره‌ی طراحی می‌خوانم، به پروژه‌های متن‌باز کمک می‌کنم و ابزارهای تازه را امتحان می‌کنم.",
    skillsTitle: "مهارت‌ها و ابزارها",
    skillsSubtitle:
      "ابزارهایی که برای رساندن یک پروژه تا مرحله‌ی انتشار انتخاب می‌کنم.",
    skillCategories: {
      frontend: "فرانت‌اند",
      backend: "بک‌اند",
      database: "پایگاه داده",
      devops: "دواپس",
      mobile: "موبایل",
      design: "طراحی",
      other: "سایر",
    },
    availabilityFreelance: "آماده همکاری پروژه‌ای",
    availabilityCollaboration: "آماده همکاری مشترک",
    photoAlt: "تصویر {name}",
  },

  experience: {
    heading: "سابقه کاری",
    empty: "هنوز سابقه کاری ثبت نشده است.",
    at: "در {company}",
  },

  work: {
    heading: "پروژه‌های منتخب",
    featured: "پروژه شاخص",
    otherHeading: "سایر پروژه‌ها",
    otherDescription: "گزیده‌ای از سایر پروژه‌هایی که در آن‌ها نقش داشته‌ام.",
    emptyTitle: "پروژه‌های تازه در راه است",
    emptyDescription: "چند پروژه تازه در دست کار است؛ به‌زودی دوباره سر بزنید.",
    repository: "کد منبع {title}",
    liveSite: "نسخه آنلاین {title}",
    caseStudy: "مطالعه موردی",
    viewProject: "مشاهده صفحه {title}",
  },

  project: {
    backToWork: "بازگشت به نمونه‌کارها",
    navigation: "پیمایش پروژه‌ها",
    overview: "درباره پروژه",
    details: "مشخصات پروژه",
    role: "نقش من",
    year: "سال",
    client: "کارفرما",
    stack: "تکنولوژی‌ها",
    gallery: "تصاویر پروژه",
    galleryEmpty: "هنوز تصویری برای این پروژه ثبت نشده است.",
    imageAlt: "{title} — تصویر {index}",
    liveSite: "مشاهده نسخه آنلاین",
    sourceCode: "مشاهده کد منبع",
    previous: "پروژه قبلی",
    next: "پروژه بعدی",
    notFound: "این پروژه وجود ندارد یا حذف شده است.",
  },

  contact: {
    heading: "تماس با من",
    title: "بیایید درباره پروژه شما صحبت کنیم",
    description:
      "اگر به دنبال همکاری تمام‌وقت، همکاری پروژه‌ای یا گفت‌وگو درباره یک ایده فنی هستید، خوشحال می‌شوم جزئیات را بشنوم. در اولین فرصت پاسخ می‌دهم.",
    connectHeading: "راه‌های ارتباطی",
    emailLabel: "ایمیل",
    phoneLabel: "تلفن",
    locationLabel: "موقعیت مکانی",
    location: "مشهد، ایران",
    followHeading: "شبکه‌های اجتماعی",
    resumePrompt: "برای مطالعه سابقه کامل",
    downloadResume: "دریافت رزومه",
    form: {
      name: "نام",
      namePlaceholder: "نام و نام خانوادگی",
      email: "ایمیل",
      emailPlaceholder: "you@example.com",
      subject: "موضوع",
      subjectPlaceholder: "موضوع پیام",
      message: "پیام",
      messagePlaceholder:
        "درباره پروژه، بازه زمانی و بودجه مورد نظرتان بنویسید.",
      submit: "ارسال پیام",
      submitting: "در حال ارسال…",
      successTitle: "پیام شما ارسال شد",
      successBody: "از این‌که نوشتید سپاسگزارم. در اولین فرصت پاسخ می‌دهم.",
      sendAnother: "ارسال پیام دیگر",
    },
    errors: {
      nameRequired: "لطفاً نام خود را وارد کنید.",
      emailRequired: "لطفاً نشانی ایمیل خود را وارد کنید.",
      emailInvalid: "لطفاً یک نشانی ایمیل معتبر وارد کنید.",
      subjectRequired: "لطفاً موضوع پیام را وارد کنید.",
      messageRequired: "لطفاً متن پیام را وارد کنید.",
      sendFailed: "ارسال پیام انجام نشد. لطفاً دوباره تلاش کنید.",
    },
  },

  states: {
    loading: "در حال بارگذاری…",
    loadingPortfolio: "در حال بارگذاری نمونه‌کارها…",
    errorTitle: "خطایی رخ داد",
    errorBody:
      "بارگذاری این صفحه انجام نشد. لطفاً دوباره تلاش کنید؛ اگر مشکل ادامه داشت، کمی بعد مراجعه کنید.",
    retry: "تلاش دوباره",
    notFoundTitle: "صفحه پیدا نشد",
    notFoundBody: "صفحه‌ای که به دنبال آن هستید وجود ندارد یا جابه‌جا شده است.",
    backHome: "بازگشت به صفحه اصلی",
  },

  login: {
    title: "ورود مدیر",
    subtitle: "برای مدیریت محتوای سایت وارد شوید.",
    email: "ایمیل",
    password: "رمز عبور",
    submit: "ورود",
    submitting: "در حال ورود…",
    errors: {
      emailPasswordRequired: "ایمیل و رمز عبور الزامی است.",
      tooManyAttempts:
        "تعداد تلاش‌ها بیش از حد مجاز است. لطفاً {seconds} ثانیه دیگر دوباره تلاش کنید.",
      invalidCredentials: "ایمیل یا رمز عبور نادرست است.",
      unavailable: "ورود موقتاً در دسترس نیست.",
    },
  },

  admin: {
    title: "پنل مدیریت",
    logout: "خروج",
    viewSite: "مشاهده سایت",
    tabs: {
      projects: "پروژه‌ها",
      skills: "مهارت‌ها",
      experiences: "سابقه کاری",
      content: "محتوای سایت",
      messages: "پیام‌ها",
      account: "حساب کاربری",
    },
    actions: {
      add: "افزودن",
      edit: "ویرایش",
      delete: "حذف",
      save: "ذخیره",
      saving: "در حال ذخیره…",
      cancel: "انصراف",
      markAsRead: "علامت‌گذاری به‌عنوان خوانده‌شده",
    },
    errors: {
      loadFailed: "بارگذاری این اطلاعات انجام نشد.",
      saveFailed: "ذخیره تغییرات انجام نشد.",
      deleteFailed: "حذف این مورد انجام نشد.",
      unexpected: "خطایی رخ داد. لطفاً دوباره تلاش کنید.",
      unauthorized: "برای انجام این کار باید به‌عنوان مدیر وارد شوید.",
      idRequired: "شناسه این مورد لازم است.",
      notFound: "این مورد دیگر وجود ندارد.",
      titleRequired: "عنوان الزامی است.",
      titleTooLong: "عنوان بیش از حد طولانی است.",
      descriptionRequired: "توضیحات الزامی است.",
      descriptionTooLong: "توضیحات بیش از حد طولانی است.",
      technologiesRequired: "حداقل یک تکنولوژی لازم است.",
      projectUrlInvalid: "نشانی پروژه باید یک آدرس معتبر http(s) باشد.",
      githubUrlInvalid: "نشانی گیت‌هاب باید یک آدرس معتبر http(s) باشد.",
      imageEmpty: "فایل انتخاب‌شده خالی است.",
      imageTooLarge: "حجم تصویر باید کمتر از {megabytes} مگابایت باشد.",
      imageUnsupported:
        "قالب تصویر پشتیبانی نمی‌شود. از JPEG، PNG، WebP یا AVIF استفاده کنید.",
      imageUnreadable:
        "این فایل به‌عنوان تصویر خوانده نشد. لطفاً یک فایل JPEG، PNG، WebP یا AVIF بارگذاری کنید.",
      nameRequired: "نام مهارت الزامی است.",
      nameTooLong: "نام مهارت بیش از حد طولانی است.",
      nameFaTooLong: "نام فارسی بیش از حد طولانی است.",
      categoryTooLong: "دسته‌بندی بیش از حد طولانی است.",
      experienceFieldsRequired:
        "عنوان شغلی، شرکت، بازه زمانی، توضیحات و تکنولوژی‌ها همه الزامی هستند.",
      roleCompanyTooLong: "عنوان شغلی یا نام شرکت بیش از حد طولانی است.",
      periodTooLong: "بازه زمانی بیش از حد طولانی است.",
      unknownField: "فیلد محتوای ناشناخته.",
      valueRequired: "مقدار الزامی است.",
      valueTooLong: "این مقدار بیش از حد طولانی است.",
      emailInvalid: "یک ایمیل معتبر وارد کنید.",
      slugInvalid:
        "نشانی پروژه فقط می‌تواند شامل حروف کوچک لاتین، عدد و خط تیره باشد.",
      yearInvalid: "سال باید چهار رقم باشد؛ مثلاً ۲۰۲۴.",
      galleryTooMany: "حداکثر می‌توانید {max} تصویر برای گالری اضافه کنید.",
      currentPasswordRequired: "رمز عبور فعلی را وارد کنید.",
      currentPasswordInvalid: "رمز عبور فعلی نادرست است.",
      passwordTooShort: "رمز عبور جدید باید حداقل {min} کاراکتر باشد.",
      passwordMismatch: "دو رمز عبور واردشده یکسان نیستند.",
      emailTaken: "این ایمیل پیش‌تر برای حساب دیگری ثبت شده است.",
      tooManyAttempts:
        "تعداد تلاش‌ها بیش از حد مجاز است. لطفاً {seconds} ثانیه دیگر دوباره تلاش کنید.",
    },
    confirm: {
      deleteProject: "این پروژه حذف شود؟ این کار قابل بازگشت نیست.",
      deleteSkill: "این مهارت حذف شود؟ این کار قابل بازگشت نیست.",
      deleteExperience: "این سابقه کاری حذف شود؟ این کار قابل بازگشت نیست.",
      deleteMessage: "این پیام حذف شود؟ این کار قابل بازگشت نیست.",
    },
    projects: {
      heading: "پروژه‌ها",
      addTitle: "افزودن پروژه",
      editTitle: "ویرایش پروژه",
      loading: "در حال بارگذاری پروژه‌ها…",
      saveLabel: "ذخیره پروژه",
      title: "عنوان",
      titleFa: "عنوان (فارسی)",
      slug: "نشانی صفحه (slug)",
      slugHint:
        "خالی بگذارید تا از روی عنوان ساخته شود. فقط حروف کوچک لاتین، عدد و خط تیره.",
      description: "توضیحات",
      descriptionFa: "توضیحات (فارسی)",
      longDescription: "متن مطالعه موردی",
      longDescriptionFa: "متن مطالعه موردی (فارسی)",
      longDescriptionHint:
        "هر پاراگراف را با یک خط خالی جدا کنید. در صفحه پروژه نمایش داده می‌شود.",
      role: "نقش من",
      year: "سال",
      client: "کارفرما",
      coverImage: "تصویر کاور",
      image: "تصویر",
      imageHint: "JPEG، PNG، WebP یا AVIF، حداکثر ۸ مگابایت.",
      gallery: "تصاویر گالری",
      galleryHint:
        "JPEG، PNG، WebP یا AVIF، هر تصویر حداکثر ۸ مگابایت و در مجموع ۸ تصویر.",
      galleryExisting: "گالری فعلی",
      galleryRemove: "حذف",
      galleryEmpty: "هنوز تصویری در گالری نیست.",
      projectUrl: "نشانی نسخه آنلاین",
      githubUrl: "نشانی کد منبع",
      technologies: "تکنولوژی‌ها (با کاما جدا کنید)",
      featured: "پروژه شاخص",
      order: "ترتیب نمایش",
      featuredBadge: "شاخص",
      orderLabel: "ترتیب: {order}",
      empty: "هنوز پروژه‌ای ثبت نشده است. اولین پروژه را اضافه کنید.",
    },
    skills: {
      heading: "مهارت‌ها",
      toolboxHint:
        "همین مهارت‌ها در کارت «مهارت‌ها و ابزارها» صفحه اصلی نمایش داده می‌شوند. دسته‌بندی، گروه هر مهارت را تعیین می‌کند؛ ترتیب نمایش، جای آن را؛ و سطح، نوار کوچک زیر نامش را.",
      addTitle: "افزودن مهارت",
      editTitle: "ویرایش مهارت",
      loading: "در حال بارگذاری مهارت‌ها…",
      saveLabel: "ذخیره مهارت",
      name: "نام",
      nameFa: "نام (فارسی)",
      category: "دسته‌بندی",
      level: "سطح",
      levelLabel: "سطح مهارت: {level}٪",
      selectCategory: "انتخاب دسته‌بندی",
      icon: "آیکون",
      order: "ترتیب نمایش",
      orderLabel: "ترتیب: {order}",
      empty: "هنوز مهارتی ثبت نشده است.",
    },
    experiences: {
      heading: "سابقه کاری",
      addTitle: "افزودن سابقه کاری",
      editTitle: "ویرایش سابقه کاری",
      loading: "در حال بارگذاری سابقه کاری…",
      saveLabel: "ذخیره سابقه کاری",
      title: "عنوان شغلی",
      company: "شرکت",
      period: "بازه زمانی",
      description: "توضیحات",
      technologies: "تکنولوژی‌ها (با کاما جدا کنید)",
      titleFa: "عنوان شغلی (فارسی)",
      companyFa: "شرکت (فارسی)",
      periodFa: "بازه زمانی (فارسی)",
      descriptionFa: "توضیحات (فارسی)",
      technologiesFa: "تکنولوژی‌ها (فارسی، با کاما جدا کنید)",
      persianHint:
        "اختیاری است. هر فیلدی که خالی بماند، متن انگلیسی‌اش نمایش داده می‌شود.",
      order: "ترتیب نمایش",
      orderLabel: "ترتیب: {order}",
      empty: "هنوز سابقه کاری ثبت نشده است.",
    },
    content: {
      heading: "محتوای سایت",
      loading: "در حال بارگذاری محتوا…",
      persianSuffix: "(فارسی)",
      heroTitle: "عنوان اصلی",
      heroSubtitle: "زیرعنوان",
      heroDescription: "توضیح کوتاه",
      aboutText: "متن درباره من",
      contactEmail: "ایمیل تماس",
      contactPhone: "تلفن تماس",
    },
    account: {
      heading: "حساب کاربری",
      description:
        "ایمیل و رمز عبوری که با آن‌ها وارد پنل می‌شوید. این اطلاعات جدا از محتوای سایت ذخیره می‌شود.",
      email: "ایمیل ورود",
      currentPassword: "رمز عبور فعلی",
      newPassword: "رمز عبور جدید",
      confirmPassword: "تکرار رمز عبور جدید",
      passwordHint:
        "حداقل {min} کاراکتر. برای نگه‌داشتن رمز فعلی، هر دو فیلد رمز جدید را خالی بگذارید.",
      save: "ذخیره تغییرات",
      saving: "در حال ذخیره…",
      success: "اطلاعات حساب به‌روز شد.",
    },
    messages: {
      heading: "پیام‌ها",
      loading: "در حال بارگذاری پیام‌ها…",
      total: "کل: {count}",
      unread: "خوانده‌نشده: {count}",
      empty: "هنوز پیامی دریافت نشده است.",
      newBadge: "جدید",
    },
  },
} satisfies Dictionary;

export default fa;
