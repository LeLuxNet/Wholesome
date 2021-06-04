---
id: getting-started
title: Getting Started
slug: /
---

The first step of using Wholesome is creating a `Reddit` instance.

```ts
const r = new Reddit({
  userAgent: {
    platform: "nodejs",
    identifier: "wholesome.getting-started",
    version: "1.0",
    author: "<your user name>",
  },
});
```

Check out [the user agent docs](/api/interfaces/useragent) for more information which values to use.

You can try it out right here without leaving the docs by opening the console (<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>I</kbd>) and using the `wholesome.Reddit` variable.

:::note

When using Firefox you might get network errors when calling library functions.
Try disabling the tracking protection to not block requests to the [reddit domains](/domains).

:::

## Examples

### Print comment tree

```ts
async function printTree(tree: CommentTree) {
  const comments = await tree.fetchAll();
  for (const comment of comments) {
    const indent = "  ".repeat(tree.depth);
    console.log(
      `${indent}- ${comments.author.name}: ${comment.body.markdown.replace(
        /\n/g,
        "\n  " + indent
      )}`
    );
  }
}

printTree(await r.submission("87").comments());
```
