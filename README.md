# Architecture for PMs

An interactive course on systems architecture for product managers: front end, middleware and APIs, back end and data, infrastructure, security, classic ML, LLMs and SLMs, agents, reference architectures and a PM playbook.

It is a single static page (`index.html`) with no build step and no server. Progress is saved in the browser (localStorage).

Deploy: connect this repo to Vercel as a static site. Framework preset: Other. No build command.

## Progress storage

Quiz and drill progress (plus last module and theme) syncs through `api/progress.js` into a Vercel Blob store (`BLOB_READ_WRITE_TOKEN` is set by the linked store). The newest save wins across devices. If the API is not reachable the page keeps working and saves in the browser only.
