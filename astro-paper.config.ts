import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://zerogyun.dev/",
    title: "0.gyun's Blog",
    description: "프런트엔드 엔지니어 0.gyun의 블로그입니다.",
    author: "0.gyun",
    profile: "https://www.linkedin.com/in/zerogyun",
    ogImage: "default-og.jpg",
    lang: "ko",
    timezone: "Asia/Seoul",
    dir: "ltr",
  },
  posts: {
    perPage: 4,
    perIndex: 4,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: false,
    },
    search: "pagefind",
  },
  socials: [
    { name: "github", url: "https://github.com/CXZ7720" },
    {
      name: "linkedin",
      url: "https://www.linkedin.com/in/zerogyun",
    },
    { name: "mail", url: "mailto:admin@zerogyun.dev" },
    { name: "cv", url: "https://read.cv/zerogyun" },
  ],
  shareLinks: [
    { name: "x", url: "https://x.com/intent/post?url=" },
    { name: "facebook", url: "https://www.facebook.com/sharer.php?u=" },
    { name: "telegram", url: "https://t.me/share/url?url=" },
    { name: "mail", url: "mailto:?subject=See%20this%20post&body=" },
  ],
});
