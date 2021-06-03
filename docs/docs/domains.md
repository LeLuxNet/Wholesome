---
id: domains
title: Domains
---

# Domains

This document lists all domains Wholesome uses to communicate with Reddit.
They might be useful for configuring firewall rules or `preconnect` / `dns-prefetch`.

## API

Domains Wholesome communicates with to fetch and update data.

| used by                      | domains                                                                                   |
| ---------------------------- | ----------------------------------------------------------------------------------------- |
| unauthenticated API requests | [www.reddit.com](https://www.reddit.com)                                                  |
| authenticated API requests   | [www.reddit.com](https://www.reddit.com)<br/>[oauth.reddit.com](https://oauth.reddit.com) |

## Media

These domains won't be accessed by Wholesome itself.
They will be communicated with when you try to show or download media.

| used by       | domains                                                                                                                       |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| award.native  | [i.redd.it](https://i.redd.it)<br/>[www.redditstatic.com](https://www.redditstatic.com)                                       |
| award.resized | [preview.redd.it](https://preview.redd.it)<br/>[www.redditstatic.com](https://www.redditstatic.com)                           |
| flair         | [emoji.redditmedia.com](https://emoji.redditmedia.com)                                                                        |
| images        | [preview.redd.it](https://preview.redd.it)<br/>[external-preview.redd.it](https://external-preview.redd.it)                   |
| stylesheet    | [a.thumbs.redditmedia.com](https://a.thumbs.redditmedia.com)<br/>[b.thumbs.redditmedia.com](https://a.thumbs.redditmedia.com) |
| thumbnail     | [a.thumbs.redditmedia.com](https://a.thumbs.redditmedia.com)<br/>[b.thumbs.redditmedia.com](https://a.thumbs.redditmedia.com) |
| video         | [v.redd.it](https://v.redd.it)                                                                                                |
