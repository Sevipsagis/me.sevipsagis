# Static delivery architectures for Cloudflare Pages

**Research date:** 2026-08-08  
**Decision status:** Evidence only; this note does not select the architecture.

## Scope

Phase 1 is one public Professional Profile at `sevipsagis.dev`: a name and role,
summary, social/email links, skills, work history, and one avatar. Cloudflare
Pages static delivery is fixed. There is no analytics, CMS, authentication,
contact form, or server feature. React, TypeScript, and shadcn/ui are preferences,
not requirements.

The three options below mean:

- **Minimal static React:** a Vite-built, client-rendered React page using
  `createRoot`, with no added prerender step.
- **Next.js static export:** Next.js configured with `output: "export"` and
  deployed from its generated `out` directory.
- **Plain static:** one authored semantic HTML document plus CSS and the avatar;
  JavaScript only if a later interaction proves it is needed.

## Evidence-backed comparison

| Criterion | Minimal static React (Vite) | Next.js static export | Plain semantic HTML/CSS |
| --- | --- | --- | --- |
| Crawlable name and role | Weakest default. React says an empty root stays blank until its JavaScript loads and runs; `createRoot` then renders into the browser DOM. Google can render JavaScript, but app-shell content waits in a rendering queue and not all bots run JavaScript. Adding build-time prerendering would fix this, but would no longer be this minimal option. ([React `createRoot`](https://react.dev/reference/react-dom/client/createRoot), [Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)) | Strong default. `next build` emits an HTML file per route, so the profile content can be present in the response before hydration. ([Next.js static exports](https://nextjs.org/docs/pages/guides/static-exports)) | Strong by construction: the authored response is the content. It has no rendering dependency beyond HTML/CSS. Google explicitly distinguishes this response-contained content from JavaScript app shells. ([Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)) |
| Mid-range mobile on 4G | Requires the React/app JavaScript to download, parse, and execute before profile content appears. Vite bundles for static hosting, but it does not itself prerender the React tree. The actual cost is unknown until a production build is measured. ([Vite production build](https://vite.dev/guide/build.html), [React `createRoot`](https://react.dev/reference/react-dom/client/createRoot)) | HTML arrives ready to display; client JavaScript remains for hydration and any Client Components. This removes the content-rendering dependency on JavaScript, but does not prove a smaller transfer than the other options. Measure the built output. ([Next.js SPA guide](https://nextjs.org/docs/app/guides/single-page-applications)) | Eliminates framework JavaScript transfer and execution, so it has the lowest possible framework runtime cost of these options. The avatar may dominate the remaining payload. This is an inference from the absence of a JavaScript runtime, not a measured score. |
| Baseline accessibility | Can emit semantic HTML, and shadcn/ui describes its components as accessible. React does not make authored headings, link text, focus, contrast, or avatar text alternatives correct automatically. ([shadcn/ui introduction](https://ui.shadcn.com/docs), [WCAG 2.2](https://www.w3.org/TR/WCAG22/)) | Same authored-markup responsibility. Static HTML provides useful content before hydration, while interactive components still require keyboard and focus verification. ([WCAG 2.2](https://www.w3.org/TR/WCAG22/)) | Smallest interactive surface and direct use of native headings, sections, and links. It still needs an appropriate avatar `alt`, keyboard-visible focus, sufficient contrast, and a logical heading structure. ([WCAG 2.2](https://www.w3.org/TR/WCAG22/)) |
| Maintenance and occasional updates | Content changes require editing TSX, rebuilding, and maintaining the Node/Vite/React dependency set. Component reuse is available but has little leverage on one page. | Content changes require editing TSX and rebuilding. It carries the broadest framework surface, while its routing and server features are mostly unused in this phase. | Content changes are direct HTML edits. There is no dependency update surface or build configuration, but repeated content would become manual duplication if the site grows beyond one page. |
| shadcn/ui compatibility | Directly supported by the official Vite installation path. Components are copied into the repository and become locally maintained source. ([shadcn/ui Vite](https://ui.shadcn.com/docs/installation/vite), [shadcn/ui introduction](https://ui.shadcn.com/docs)) | Directly supported by the official Next.js installation path, with the same locally owned component-source model. ([shadcn/ui Next.js](https://ui.shadcn.com/docs/installation/next), [shadcn/ui introduction](https://ui.shadcn.com/docs)) | Not directly compatible: shadcn/ui distributes framework component source, not framework-free HTML. Its visual language could be reproduced in CSS, but that would not be shadcn/ui compatibility. |
| Cloudflare Pages fit | Official preset: `npm run build`, output `dist`. Without a top-level `404.html`, Pages applies its SPA fallback and serves `/` for unknown paths. ([Cloudflare React guide](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/), [Serving Pages](https://developers.cloudflare.com/pages/configuration/serving-pages/)) | Official static-export preset: `npx next build`, output `out`. Server-required features and the default `next/image` optimizer are unavailable; the avatar needs a custom loader, disabled optimization, or a pre-optimized native `<img>`. Cloudflare cautions that this guide is for a specific static-export use case; this phase is such a case because server behavior is excluded. ([Cloudflare Next.js static guide](https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/), [Next.js static exports](https://nextjs.org/docs/pages/guides/static-exports)) | Officially supported with no framework. With no build, Cloudflare documents `exit 0` and a custom output directory containing `index.html`. ([Cloudflare static HTML guide](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/)) |

## Facts that do not distinguish the options

- All three can deploy as static files to Cloudflare Pages and receive Pages'
  built-in CDN caching plus Brotli or Gzip when possible. Custom cache rules are
  unnecessary for this phase. ([Serving Pages](https://developers.cloudflare.com/pages/configuration/serving-pages/))
- Accessibility is an output quality, not a framework feature. For this content,
  the minimum implementation still needs semantic landmarks/headings, real
  `<a href>` links, a useful text alternative for an informative avatar, visible
  keyboard focus, and contrast checks. ([WCAG 2.2](https://www.w3.org/TR/WCAG22/))
- Every option should put the name and role in the initial HTML, use a descriptive
  `<title>` and meta description, and return a real `404` for unknown paths.
  Google recommends prerendering and meaningful HTTP status codes; Pages only
  enables its catch-all SPA behavior when no top-level `404.html` exists.
  ([Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics),
  [Serving Pages](https://developers.cloudflare.com/pages/configuration/serving-pages/))
- Cloudflare rebuilds and deploys Git-integrated React and Next.js projects after
  commits. Occasional content changes therefore fit all three; the difference is
  the local edit/build surface, not deployment capability.

## Decision frame (not a recommendation)

1. If **response-contained HTML, minimal 4G work, and minimum maintenance** are
   the hard priorities, plain static is the reference baseline the other options
   must justify exceeding.
2. If **React/TypeScript and direct shadcn/ui use are required** while the profile
   must still be present in initial HTML, Next.js static export satisfies both at
   the cost of the largest framework/build surface.
3. If **the smallest familiar React toolchain** matters more than initial raw HTML,
   Vite React is viable. If raw HTML is non-negotiable, add a measured prerender
   approach or move to an option that already emits it; do not assume crawlers or
   users will always wait for client rendering.

## Unknowns to resolve before the architecture decision

- **Preference strength:** Is direct shadcn/ui use a requirement, or is its visual
  style sufficient? This is the main discriminator against plain HTML.
- **Likely scope growth:** Multiple pages, shared layouts, or real interactivity
  would increase the value of React/Next.js; none are in the current scope.
- **Measured budgets:** No production implementation exists, so transfer size,
  LCP, and JavaScript execution time are unknown. Compare production builds under
  the same mobile throttling profile; inspect the raw HTML with JavaScript off.
- **Avatar inputs:** Source dimensions, crop, and accepted visual quality are not
  known. Those determine the largest likely asset and may matter more than the
  HTML/CSS choice.

## Cloudflare/Next.js caveat

Cloudflare's current Next.js static-site guide says to use the guide only for a
specific static-export case and otherwise recommends Workers. This is not a
deployment blocker here: the fixed scope forbids the server features that would
motivate Workers, and Pages still documents the static-export preset. It does
mean that any later server requirement must reopen the hosting/architecture
decision rather than being treated as a free Next.js upgrade.

All linked sources above are first-party or standards sources and were accessed
on **2026-08-08**.
