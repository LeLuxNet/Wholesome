# Domains

This document lists all domains Wholesome uses to communicate with Reddit.
They might be useful for configuring firewall rules or `preconnect` / `dns-prefetch`.

## API

Domains Wholesome communicates with to fetch and update data.

| used by                      | domains                               |
| ---------------------------- | ------------------------------------- |
| unauthenticated API requests | www.redddit.com                       |
| authenticated API requests   | www.redddit.com<br/>oauth.redddit.com |

## Media

These domains won't be accessed by Wholesome itself.
They will be communicated with when you try to show or download media.

| used by       | domains                                               |
| ------------- | ----------------------------------------------------- |
| award.native  | i.redd.it<br/>www.redditstatic.com                    |
| award.resized | preview.redd.it<br/>www.redditstatic.com              |
| flair         | emoji.redditmedia.com                                 |
| images        | preview.redd.it<br/>external-preview.redd.it          |
| stylesheet    | a.thumbs.redditmedia.com<br/>b.thumbs.redditmedia.com |
| thumbnail     | a.thumbs.redditmedia.com<br/>b.thumbs.redditmedia.com |
| video         | v.redd.it                                             |
