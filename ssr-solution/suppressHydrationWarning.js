import { useEffect } from "react";

/**
 * This hook suppresses hydration warnings caused by browser extensions
 * adding attributes to HTML elements like __gchrome_remoteframetoken
 */
export function useSuppressHydrationWarning() {
  useEffect(() => {
    // This runs only on the client, after hydration
    if (typeof window !== "undefined") {
      // Store original console.error
      const originalConsoleError = console.error;

      // Override console.error to filter out hydration warnings
      console.error = (...args) => {
        // Skip hydration mismatch warnings
        if (args[0] && typeof args[0] === "string") {
          const message = args[0];

          // Filter out common hydration warnings
          if (
            message.includes("Warning: Text content did not match") ||
            message.includes("Warning: Prop") ||
            message.includes("Warning: Attribute") ||
            message.includes("hydrat") ||
            message.includes("__gchrome_remoteframetoken")
          ) {
            return;
          }
        }

        // Call original console.error for other errors
        originalConsoleError(...args);
      };

      // Restore original console.error on cleanup
      return () => {
        console.error = originalConsoleError;
      };
    }
  }, []);
}

/**
 * Higher-order component that adds suppressHydrationWarning={true} to the root element
 */
export function withSuppressHydration(Component) {
  function WithSuppressHydration(props) {
    return <Component suppressHydrationWarning={true} {...props} />;
  }

  const displayName = Component.displayName || Component.name || "Component";
  WithSuppressHydration.displayName = `WithSuppressHydration(${displayName})`;

  return WithSuppressHydration;
}
