import { useSuppressHydrationWarning } from "./suppressHydrationWarning";

/**
 * Custom App component for Next.js Pages Router
 * This applies hydration warning suppression to the entire app
 */
function MyApp({ Component, pageProps }) {
  // Use the hook to suppress hydration warnings from browser extensions
  useSuppressHydrationWarning();

  return <Component {...pageProps} />;
}

export default MyApp;
