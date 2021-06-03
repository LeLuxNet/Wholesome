const path = require("path");

/** @type {import("@docusaurus/types").DocusaurusConfig} */
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
          label: "Docs",
          type: "doc",
          docId: "getting-started",
          position: "left",
        },
        {
          label: "npm",
          href: "https://www.npmjs.com/package/wholesome",
          position: "right",
        },
        {
          label: "GitHub",
          href: "https://github.com/LeLuxNet/Wholesome",
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
              label: "npm",
              href: "https://www.npmjs.com/package/wholesome",
            },
            {
              label: "GitHub",
              href: "https://github.com/LeLuxNet/Wholesome",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} LeLuxNet`,
    },
    colorMode: {
      respectPrefersColorScheme: true,
    },
    prism: {
      theme: require("prism-react-renderer/themes/github"),
      darkTheme: require("prism-react-renderer/themes/dracula"),
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
          remarkPlugins: [require("wholesome.md")],
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
        watch: process.env.NODE_ENV !== "production",
      },
    ],
    [path.resolve(__dirname, "try-it-out.js"), { url: "/browser.js" }],
  ],
};
