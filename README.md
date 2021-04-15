# Wholesome

A Reddit API wrapper

## Examples

```js
const r = new Reddit({ userAgent: "Wholesome Example" });

const page = await r.subreddit("askreddit").feed("hot").get();
page.items.forEach((p) => console.log(p.title));
```
