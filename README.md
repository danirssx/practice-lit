# Reactive HTML Practice

Basic task Board.

## Roarr logging practice

This project uses the same browser logging shape as Zigzag: every module creates a
named `Roarr` child logger, while the application composition root installs one
browser writer before stores are constructed. Logs are disabled by default, so they
do not add noise while you work.

1. Open the browser DevTools console.
2. Enable one namespace: `practiceDebug.enable('tasks')`.
3. Create, toggle, edit, or delete a task and inspect the structured context object.
4. Enable all namespaces with `practiceDebug.all()`, or disable them with
   `practiceDebug.none()`.

Available namespaces are `tasks`, `users`, and `shell`. `practiceDebug.level(30)`
shows `info` and more severe logs; use `practiceDebug.status()` to review the saved
flags. The selection is stored in `localStorage`, so it remains after a refresh.

Each practice console line also displays Roarr's packet metadata, for example
`#4 format:2.0.0`. `#4` is the automatically assigned `sequence`, and `format:2.0.0`
is Roarr's packet-format `version`. They are displayed only to make the raw packet
easier to study; application code must not use either field to make task or UI
decisions. Zigzag receives the same fields but deliberately does not display them.

### Quiet build mode

Use the normal commands when you want Roarr diagnostics:

```sh
npm run dev
npm run build
```

Normal commands read the ignored local `.env` file:

```dotenv
ROARR_DISABLED=false
```

Set `ROARR_DISABLED=true` when you want all normal commands to be quiet. Missing,
malformed, and other values keep logging enabled. The exact lowercase string `true`
is the only value that disables Roarr.

The quiet commands always override that file, so they are useful for a one-off quiet
run without editing `.env`:

```sh
npm run dev:quiet
npm run build:quiet
```

Vite reads only this one unprefixed key while its Node-side configuration runs. A
small built-in Node reader handles comments, whitespace, quotes, and later
assignments; it does not load or expose any other `.env` setting. Quiet mode aliases
`roarr` to a compatible stub and does not expose the raw value through
`import.meta.env` or as a browser runtime setting. Disabled mode leaves
`globalThis.ROARR.write` and `window.practiceDebug` undefined. The application state
and UI still behave normally; only Roarr logging is disabled.

## About development

I tried to do it all by hand, I just use AI to ask some things and it suggest me how to apply different patterns and elements of the ReactiveElement build.
