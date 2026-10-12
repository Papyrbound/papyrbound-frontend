# Papyrbound

Papyrbound is a desktop e-book and comic reader for EPUB and CBZ files.

The application combines a Next.js frontend with Tauri to provide a native desktop reading experience. It is designed for reading digital books and comics locally, with an interface tailored to desktop windows rather than a traditional browser-only layout.

## Technology

- [Next.js](https://nextjs.org/) for the application frontend
- [Tauri](https://tauri.app/) for the native desktop shell
- [shadcn/ui](https://ui.shadcn.com/) for reusable interface components. Preset (--preset bK05dzrGc)
- [Tailwind CSS](https://tailwindcss.com/) for styling

## Supported Formats

- EPUB e-books
- CBZ comic book archives

## Architecture

The frontend uses a feature-oriented structure with one-way dependencies:

```text
src/app          routes and layouts only
src/app-shell    persistent desktop navigation and chrome
src/features     domain-owned models, logic, and UI
src/shared       domain-neutral utilities and shadcn primitives
```

Route files stay thin and compose feature views. Features may depend on
`shared`, while `shared` never imports from a feature. Tauri IPC commands are
kept thin in `src-tauri/src/commands` and delegate filesystem or business work
to `src-tauri/src/services`; Rust data contracts live in
`src-tauri/src/types`.
