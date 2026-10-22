/**
 * Persian (fa-IR) dictionary — the primary locale.
 *
 * Written as native Persian rather than a literal translation of the English
 * file: sentences are re-shaped where a word-for-word rendering would read
 * stiffly, and the half-space (ZWNJ, U+200C) is used where Persian orthography
 * requires it (`میشود`, `پروژهها`, `بهزودی`).
 *
 * Glossary for shared domain terms (kept consistent across the app):
 *   front-end developer → توسعهدهنده فرانتاند
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
    homeTitle: "علی سویزی — توسعهدهنده فرانتاند",
    homeDescription:
      "نمونهکارهای علی سویزی، توسعهدهنده فرانتاند که رابطهای وب سریع و دسترسپذیر با React، Next.js و TypeScript میسازد.",
    keywords: [
      "علی سویزی",
      "توسعهدهنده فرانتاند",
      "برنامهنویس ریاکت",
      "Next.js",
      "TypeScript",
      "طراحی وب",
      "نمونهکار",
    ],
    ogImageAlt: "علی سویزی — توسعهدهنده فرانتاند",
    adminTitle: "پنل مدیریت",
    loginTitle: "ورود",
  },

  language: {
    label: "زبان",
    switchTo: "تغییر زبان به {language}",
  },

  nav: {
    label: "پیمایش بخشها",
    home: "خانه",
    about: "درباره من",
    experience: "سابقه کاری",
    work: "نمونهکارها",
    contact: "تماس",
    navigateTo: "رفتن به بخش {section}",
  },

  hero: {
    greeting: "سلام، من",
    getInTouch: "تماس بگیرید",
    downloadResume: "دانلود رزومه",
    scroll: "برای دیدن ادامه اسکرول کنید",
  },

  about: {
    heading: "درباره من",
    paragraph2:
      "برای جزئیاتی که یک رابط را بیدردسر میکنند اهمیت قائلم: سلسلهمراتب بصری روشن، تعامل دسترسپذیر، و کاراییای که روی یک اتصال کند هم دوام بیاورد. وقتی پشت کیبورد نیستم، درباره طراحی میخوانم، به پروژههای متنباز مشارکت میکنم، و هر چیزی که به کارم اضافه شود یاد میگیرم.",
    skillsTitle: "جعبه‌ابزار من",
    skillsSubtitle:
      "همان چیزی که در فهرست مهارت‌هایم ثبت شده؛ ابزارهایی که برای رساندن یک پروژه به مرحله انتشار انتخاب می‌کنم.",
    skillCategories: {
      frontend: "فرانت‌اند",
      backend: "بک‌اند",
      database: "داده",
      devops: "دواپس",
      mobile: "موبایل",
      design: "طراحی",
      other: "دیگر",
    },
    availabilityFreelance: "آماده همکاری پروژهای",
    availabilityCollaboration: "آماده همکاری مشترک",
    photoAlt: "تصویر {name}",
  },

  experience: {
    heading: "سابقه کاری من",
    empty: "هنوز سابقهای ثبت نشده است.",
    at: "در {company}",
  },

  work: {
    heading: "چند نمونه از کارهای من",
    featured: "پروژه شاخص",
    otherHeading: "پروژههای دیگر",
    otherDescription: "گزیدهای از پروژههای دیگری که روی آنها کار کردهام",
    emptyTitle: "پروژهها بهزودی",
    emptyDescription:
      "در حال کار روی چند پروژه تازه هستم. بهزودی سر بزنید تا ببینید چه ساختهام.",
    repository: "کد منبع {title}",
    liveSite: "نسخه آنلاین {title}",
    caseStudy: "مطالعه موردی",
    viewProject: "مشاهده صفحه {title}",
  },

  project: {
    backToWork: "همه نمونه‌کارها",
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
    title: "بیایید با هم کار کنیم",
    description:
      "همیشه خوشحال میشوم درباره فرصتهای تازه بشنوم؛ چه یک موقعیت تماموقت، چه همکاری پروژهای، و چه فقط یک گفتوگو درباره تکنولوژی.",
    connectHeading: "راههای ارتباطی",
    emailLabel: "ایمیل",
    phoneLabel: "تلفن",
    locationLabel: "موقعیت مکانی",
    location: "مشهد، ایران",
    followHeading: "من را دنبال کنید",
    resumePrompt: "دنبال رزومه من هستید؟",
    downloadResume: "دانلود رزومه",
    form: {
      name: "نام",
      namePlaceholder: "نام شما",
      email: "ایمیل",
      emailPlaceholder: "you@example.com",
      subject: "موضوع",
      subjectPlaceholder: "درباره چه چیزی است؟",
      message: "پیام",
      messagePlaceholder: "از پروژهتان بگویید، یا فقط سلام کنید.",
      submit: "ارسال پیام",
      submitting: "در حال ارسال…",
      successTitle: "پیام ارسال شد",
      successBody: "ممنون که پیام دادید. در اولین فرصت پاسخ میدهم.",
      sendAnother: "ارسال پیام دیگر",
    },
    errors: {
      nameRequired: "لطفاً نام خود را وارد کنید.",
      emailRequired: "لطفاً ایمیل خود را وارد کنید.",
      emailInvalid: "لطفاً یک ایمیل معتبر وارد کنید.",
      subjectRequired: "لطفاً موضوع را وارد کنید.",
      messageRequired: "لطفاً متن پیام را وارد کنید.",
      sendFailed: "ارسال پیام انجام نشد. لطفاً دوباره تلاش کنید.",
    },
  },

  states: {
    loading: "در حال بارگذاری…",
    loadingPortfolio: "در حال بارگذاری نمونهکارها…",
    errorTitle: "مشکلی پیش آمد",
    errorBody:
      "بارگذاری این صفحه ممکن نشد. لطفاً دوباره تلاش کنید؛ اگر مشکل ادامه داشت، کمی بعد سر بزنید.",
    retry: "تلاش دوباره",
    notFoundTitle: "صفحه پیدا نشد",
    notFoundBody: "صفحهای که دنبالش هستید وجود ندارد یا جابهجا شده است.",
    backHome: "بازگشت به صفحه اصلی",
  },

  login: {
    title: "ورود مدیر",
    subtitle: "برای مدیریت محتوای نمونهکار وارد شوید.",
    email: "ایمیل",
    password: "رمز عبور",
    submit: "ورود",
    submitting: "در حال ورود…",
    errors: {
      emailPasswordRequired: "ایمیل و رمز عبور الزامی است.",
      tooManyAttempts: "تلاشهای بیش از حد. لطفاً {seconds} ثانیه دیگر دوباره تلاش کنید.",
      invalidCredentials: "ایمیل یا رمز عبور نادرست است.",
      unavailable: "ورود موقتاً در دسترس نیست.",
    },
  },

  admin: {
    title: "پنل مدیریت",
    logout: "خروج",
    tabs: {
      projects: "پروژهها",
      skills: "مهارتها",
      experiences: "سابقه کاری",
      content: "محتوای سایت",
      messages: "پیامها",
    },
    actions: {
      add: "افزودن",
      edit: "ویرایش",
      delete: "حذف",
      save: "ذخیره",
      saving: "در حال ذخیره…",
      cancel: "انصراف",
      markAsRead: "علامتگذاری بهعنوان خواندهشده",
    },
    errors: {
      loadFailed: "بارگذاری این اطلاعات ممکن نشد.",
      saveFailed: "ذخیره تغییرات ممکن نشد.",
      deleteFailed: "حذف این مورد ممکن نشد.",
      unexpected: "مشکلی پیش آمد. لطفاً دوباره تلاش کنید.",
      unauthorized: "برای انجام این کار باید بهعنوان مدیر وارد شوید.",
      idRequired: "شناسه این مورد لازم است.",
      notFound: "این مورد دیگر وجود ندارد.",
      titleRequired: "عنوان الزامی است.",
      titleTooLong: "عنوان بیش از حد طولانی است.",
      descriptionRequired: "توضیحات الزامی است.",
      descriptionTooLong: "توضیحات بیش از حد طولانی است.",
      technologiesRequired: "حداقل یک تکنولوژی لازم است.",
      projectUrlInvalid: "نشانی پروژه باید یک آدرس معتبر http(s) باشد.",
      githubUrlInvalid: "نشانی گیتهاب باید یک آدرس معتبر http(s) باشد.",
      imageEmpty: "فایل انتخابشده خالی است.",
      imageTooLarge: "حجم تصویر باید کمتر از {megabytes} مگابایت باشد.",
      imageUnsupported: "قالب تصویر پشتیبانی نمیشود. از JPEG، PNG، WebP یا AVIF استفاده کنید.",
      imageUnreadable:
        "این فایل بهعنوان تصویر خوانده نشد. لطفاً یک فایل JPEG، PNG، WebP یا AVIF بارگذاری کنید.",
      nameRequired: "نام مهارت الزامی است.",
      nameTooLong: "نام مهارت بیش از حد طولانی است.",
      nameFaTooLong: "نام فارسی بیش از حد طولانی است.",
      categoryTooLong: "دستهبندی بیش از حد طولانی است.",
      experienceFieldsRequired:
        "عنوان شغلی، شرکت، بازه زمانی، توضیحات و تکنولوژیها همه الزامی هستند.",
      roleCompanyTooLong: "عنوان شغلی یا نام شرکت بیش از حد طولانی است.",
      periodTooLong: "بازه زمانی بیش از حد طولانی است.",
      unknownField: "فیلد محتوای ناشناخته.",
      valueRequired: "مقدار الزامی است.",
      valueTooLong: "این مقدار بیش از حد طولانی است.",
      emailInvalid: "یک ایمیل معتبر وارد کنید.",
      slugInvalid: "نشانی پروژه فقط می‌تواند شامل حروف کوچک لاتین، عدد و خط تیره باشد.",
      yearInvalid: "سال باید چهار رقم باشد؛ مثلاً ۲۰۲۴.",
      galleryTooMany: "حداکثر می‌توانید {max} تصویر برای گالری اضافه کنید.",
    },
    confirm: {
      deleteProject: "این پروژه حذف شود؟ این کار قابل بازگشت نیست.",
      deleteSkill: "این مهارت حذف شود؟ این کار قابل بازگشت نیست.",
      deleteExperience: "این سابقه کاری حذف شود؟ این کار قابل بازگشت نیست.",
      deleteMessage: "این پیام حذف شود؟ این کار قابل بازگشت نیست.",
    },
    projects: {
      heading: "پروژهها",
      addTitle: "افزودن پروژه",
      editTitle: "ویرایش پروژه",
      loading: "در حال بارگذاری پروژهها…",
      saveLabel: "ذخیره پروژه",
      title: "عنوان",
      titleFa: "عنوان (فارسی)",
      slug: "نشانی صفحه (slug)",
      slugHint: "خالی بگذارید تا از روی عنوان ساخته شود. فقط حروف کوچک لاتین، عدد و خط تیره.",
      description: "توضیحات",
      descriptionFa: "توضیحات (فارسی)",
      longDescription: "متن مطالعه موردی",
      longDescriptionFa: "متن مطالعه موردی (فارسی)",
      longDescriptionHint: "هر پاراگراف را با یک خط خالی جدا کنید. در صفحه پروژه نمایش داده می‌شود.",
      role: "نقش من",
      year: "سال",
      client: "کارفرما",
      coverImage: "تصویر کاور",
      image: "تصویر",
      imageHint: "JPEG، PNG، WebP یا AVIF، حداکثر ۸ مگابایت.",
      gallery: "تصاویر گالری",
      galleryHint: "JPEG، PNG، WebP یا AVIF، هر تصویر حداکثر ۸ مگابایت و در مجموع ۸ تصویر.",
      galleryExisting: "گالری فعلی",
      galleryRemove: "حذف",
      galleryEmpty: "هنوز تصویری در گالری نیست.",
      projectUrl: "نشانی نسخه آنلاین",
      githubUrl: "نشانی کد منبع",
      technologies: "تکنولوژیها (با کاما جدا کنید)",
      featured: "پروژه شاخص",
      order: "ترتیب نمایش",
      featuredBadge: "شاخص",
      orderLabel: "ترتیب: {order}",
      empty: "هنوز پروژهای ثبت نشده است. اولین پروژه را اضافه کنید.",
    },
    skills: {
      heading: "مهارتها",
      toolboxHint:
        "همین مهارت‌ها در کارت «جعبه‌ابزار من» صفحه‌ی اصلی نمایش داده می‌شوند. دسته‌بندی، گروه را تعیین می‌کند؛ ترتیب نمایش، جای هر مهارت را؛ و سطح، نوار کوچک زیر آن را.",
      addTitle: "افزودن مهارت",
      editTitle: "ویرایش مهارت",
      loading: "در حال بارگذاری مهارتها…",
      saveLabel: "ذخیره مهارت",
      name: "نام",
      nameFa: "نام (فارسی)",
      category: "دستهبندی",
      level: "سطح",
      levelLabel: "سطح مهارت: {level}٪",
      selectCategory: "انتخاب دستهبندی",
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
      technologies: "تکنولوژیها (با کاما جدا کنید)",
      order: "ترتیب نمایش",
      orderLabel: "ترتیب: {order}",
      empty: "هنوز سابقهای ثبت نشده است.",
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
    messages: {
      heading: "پیامها",
      loading: "در حال بارگذاری پیامها…",
      total: "کل: {count}",
      unread: "خواندهنشده: {count}",
      empty: "هنوز پیامی دریافت نشده است.",
      newBadge: "جدید",
    },
  },
} satisfies Dictionary;

export default fa;
