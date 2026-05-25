import type { APIRoute } from "astro";

const getRobotsTxt = (sitemapURL: URL) => `
User-agent: *
Allow: /
Disallow: /presentation/

User-agent: GPTBot
Disallow: /presentation/

User-agent: ChatGPT-User
Disallow: /presentation/

User-agent: ClaudeBot
Disallow: /presentation/

User-agent: anthropic-ai
Disallow: /presentation/

User-agent: Google-Extended
Disallow: /presentation/

User-agent: CCBot
Disallow: /presentation/

User-agent: Bytespider
Disallow: /presentation/

User-agent: PerplexityBot
Disallow: /presentation/

User-agent: cohere-ai
Disallow: /presentation/

User-agent: FacebookBot
Disallow: /presentation/

Sitemap: ${sitemapURL.href}
`;

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL("sitemap-index.xml", site);
  return new Response(getRobotsTxt(sitemapURL));
};
