# Fixing Next.js Hydration Errors from Browser Extensions

This folder contains a solution for handling hydration errors in Next.js applications that are caused by browser extensions adding attributes to HTML elements (like `__gchrome_remoteframetoken`).

## The Problem

You're seeing errors like this:

```
A tree hydrated but some attributes of the server rendered HTML didn't match the client properties.
This won't be patched up. This can happen if a SSR-ed Client Component used:
...
<html lang="en" __gchrome_remoteframetoken="...">
```

These errors occur because:

- The server renders HTML without certain attributes
- A browser extension (like Chrome Remote Desktop) adds attributes to the DOM before hydration
- React detects a mismatch between server and client HTML

## Solution

### Option 1: Use `suppressHydrationWarning`

The React-recommended way to handle hydration mismatches is to use the `suppressHydrationWarning` prop on elements that might have mismatches:

1. Copy the `layout.js` file to your app and modify as needed
2. Add `suppressHydrationWarning={true}` to the root elements

This approach tells React to ignore hydration mismatches for the specific elements.

### Option 2: Suppress Console Errors

If you can't modify the elements directly, you can use our utility to suppress the console errors:

1. Copy `suppressHydrationWarning.js` to your project
2. Import and use the `useSuppressHydrationWarning` hook in your root component:

```jsx
import { useSuppressHydrationWarning } from "./path/to/suppressHydrationWarning";

function MyApp({ Component, pageProps }) {
  useSuppressHydrationWarning();
  return <Component {...pageProps} />;
}
```

### Option 3: Use Client-Only Rendering for Problematic Components

For components that consistently cause hydration issues, use Next.js's dynamic import with SSR disabled:

```jsx
import dynamic from "next/dynamic";

const ClientOnlyComponent = dynamic(() => import("./Component"), {
  ssr: false,
});
```

## When to Use Each Option

- **Option 1**: Best for when you know exactly which HTML elements are causing issues
- **Option 2**: Good general solution that doesn't require modifying markup
- **Option 3**: Best for components that use browser-specific APIs or always have hydration issues

## Important Note

These solutions should be used as a last resort. The best approach is to make your components fully SSR-compatible by:

1. Using useEffect for browser-specific code
2. Avoiding browser-specific APIs during rendering
3. Using proper conditional rendering patterns for SSR

However, when dealing with browser extensions or other external factors adding attributes to your DOM, these solutions can help prevent errors from impacting your app.
