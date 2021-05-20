const lines = [
  [
    "Try out Wholesome right here in the console using the '%cwholesome%c' variable!",
    "#d2c057",
    "",
  ],
  [
    '%cUsage: %cconst %cr %c= %cnew %cwholesome({ %cuserAgent%c: %c"..."%c });',
    "#747474",
    "#9a7fd5",
    "#5db0d7",
    "#d2c057",
    "#9a7fd5",
    "",
    "#d2c057",
    "",
    "#f28b54",
    "",
  ],
];

module.exports = (_, { url }) => ({
  name: "try-it-out",
  injectHtmlTags: () => ({
    headTags: [
      {
        tagName: "script",
        innerHTML: lines
          .map(
            (l) =>
              `console.log(${JSON.stringify(l[0])},${l
                .slice(1)
                .map((v) => `"color:${v || "unset"}"`)
                .join(",")});`
          )
          .join(""),
      },
      {
        tagName: "script",
        attributes: { src: url },
      },
    ],
  }),
});
