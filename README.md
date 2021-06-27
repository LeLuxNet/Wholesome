# Wholesome

A Reddit API wrapper

## Examples

```ts
import Reddit from "wholesome";
// or
const { Reddit } = require("wholesome");

const r = new Reddit({ userAgent: "Wholesome Example" });

const page = await r.subreddit("askreddit").hot();
page.items.forEach((p) => console.log(p.title));
```
