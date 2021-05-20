const path = require("path");

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: "Wholesome",
  tagline: "A Reddit API wrapper",
  url: "https://wholesome.lelux.net",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "favicon.ico",
  organizationName: "LeLuxNet",
  projectName: "Wholesome",
  themeConfig: {
    navbar: {
      title: "Wholesome",
      items: [
        {
          type: "doc",
          docId: "getting-started",
          position: "left",
          label: "Docs",
        },
        {
          href: "https://github.com/LeLuxNet/Wholesome",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      links: [
        {
          title: "More",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/LeLuxNet/Wholesome",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} LeLuxNet`,
    },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl: "https://github.com/LeLuxNet/Wholesome/edit/master/docs/",
          // remarkPlugins: [require("wholesome.md")],
        },
      },
    ],
  ],
  plugins: [
    [
      "docusaurus-plugin-typedoc",
      {
        entryPoints: ["../src/index.ts"],
        tsconfig: "../tsconfig.json",
        sidebar: {
          sidebarFile: null,
        },
      },
    ],
    [
      path.resolve(__dirname, "try-it-out.js"),
      {
        url: "https://unpkg.com/wholesome/dist/browser.js",
      },
    ],
  ],
};
