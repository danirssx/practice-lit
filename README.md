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

Use the quiet commands to build or run the same application with every Roarr logger
replaced by a no-op stub:

```sh
npm run dev:quiet
npm run build:quiet
```

Quiet mode is selected before Vite bundles the application. It aliases the `roarr`
package to a compatible stub, so log calls do not create packets or console output.
It also leaves `globalThis.ROARR.write` undefined and does not install
`window.practiceDebug`. The application state and UI still behave normally; only
logging is disabled.

## About development

I tried to do it all by hand, I just use AI to ask some things and it suggest me how to apply different patterns and elements of the ReactiveElement build.
