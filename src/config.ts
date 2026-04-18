export const SITE = {
  website: "https://julius383.github.io", // replace this with your deployed domain
  author: "Julius Kibunjia",
  profile: "https://julius383.github.io",
  desc: "Personal blog of Programmer Julius Kibunjia",
  title: "Julius Kibunjia's Blog",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: false,
  postPerIndex: 4,
  postPerPage: 4,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true, // show back button in post detail
  editPost: { enabled: false },
  dynamicOgImage: false,
  dir: "ltr", // "rtl" | "auto"
  lang: "en", // html lang code. Set this empty and default will be "en"
  timezone: "Africa/Nairobi", // Default global timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
} as const;
