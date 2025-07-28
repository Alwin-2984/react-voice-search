# React Voice Search

A React component that provides voice search functionality with audio visualization and cross-browser support.

## Features

- Voice recognition with audio level visualization
- Cross-browser support (except Firefox and Opera due to Web Speech API limitations)
- Android device detection and custom animation
- Customizable styling with both inline styles and CSS classes
- Error handling and user feedback
- Custom icons support
- Server-Side Rendering (SSR) compatible

## Installation

```bash
npm install react-voice-search
# or
yarn add react-voice-search
```

## Usage

```jsx
import React from "react";
import VoiceSearch from "react-voice-search";

function App() {
  // Error handler function
  const handleError = (errorMessage) => {
    console.error(errorMessage);
    // You can display this error to the user
  };

  const handleSearch = (transcript) => {
    console.log("Voice search transcript:", transcript);
    // Your search logic here
  };

  return (
    <div className="App">
      <h1>Voice Search Example</h1>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <VoiceSearch
          handleSearch={handleSearch}
          Error={handleError}
          width="100%"
        />
      </div>
    </div>
  );
}

export default App;
```

## Props

| Prop            | Type          | Default    | Description                                                                  |
| --------------- | ------------- | ---------- | ---------------------------------------------------------------------------- |
| `handleSearch`  | Function      | Required   | Function called when speech is recognized (receives transcript as parameter) |
| `width`         | String/Number | `'50px'`   | Width of the search component                                                |
| `darkMode`      | Boolean       | `false`    | Enable dark mode styling                                                     |
| `language`      | String        | `'en-US'`  | Language for speech recognition                                              |
| `customMicIcon` | Component     | -          | Custom component for the microphone icon                                     |
| `customStyles`  | Object        | `{}`       | Custom styles for each element in the component                              |
| `customClasses` | Object        | `{}`       | Custom CSS classes for each element in the component                         |
| `Error`         | Function      | `() => {}` | Function to handle and display errors to the user                            |

### customStyles Object

You can customize the styling of each part of the component:

```jsx
const customStyles = {
  inputContainer: {
    /* styles for the input wrapper */
  },
  micContainer: {
    /* styles for the mic button container */
  },
  pulse: {
    /* styles for the pulse animation */
  },
  micButton: {
    /* styles for the mic button */
  },
};
```

### customClasses Object

You can also apply custom CSS classes:

```jsx
const customClasses = {
  inputContainer: "my-input-wrapper",
  micContainer: "my-mic-container",
  pulse: "my-pulse-animation",
  micButton: "my-mic-button",
  micIcon: "my-mic-icon",
};
```

## Server-Side Rendering (SSR) Compatibility

This component is designed to work with Server-Side Rendering frameworks like Next.js. The component:

1. Checks for browser environment before using browser-specific APIs
2. Renders a minimal placeholder during server-side rendering
3. Initializes all browser-specific functionality only on the client side

### Usage with Next.js

While the component is SSR-safe, for optimal performance in Next.js applications, you may want to use dynamic imports:

```jsx
import dynamic from "next/dynamic";

// Import the component with SSR disabled
const VoiceSearch = dynamic(() => import("react-voice-search"), {
  ssr: false,
});

function SearchPage() {
  const handleSearch = (transcript) => {
    console.log("Voice search:", transcript);
    // Your search logic here
  };

  return (
    <div>
      <h1>Search</h1>
      <VoiceSearch handleSearch={handleSearch} />
    </div>
  );
}

export default SearchPage;
```

This approach prevents any hydration mismatches and ensures the component only loads and initializes on the client side.

### Handling Hydration Errors in Next.js

If you're still experiencing hydration errors related to browser extensions adding attributes to HTML elements (like `__gchrome_remoteframetoken`), you can suppress these errors by adding the following code to your Next.js application:

1. Create a file called `suppressHydrationWarning.js` in your project:

```jsx
// suppressHydrationWarning.js
import { useEffect } from "react";

export function useSuppressHydrationWarning() {
  useEffect(() => {
    // This runs only on the client, after hydration
    if (typeof window !== "undefined") {
      // Original console.error
      const originalConsoleError = console.error;

      // Override console.error to suppress hydration warnings
      console.error = (...args) => {
        if (
          args[0]?.includes("Warning: Text content did not match") ||
          args[0]?.includes("Warning: Prop") ||
          args[0]?.includes("Warning: Attribute") ||
          args[0]?.includes("hydrat")
        ) {
          return;
        }
        originalConsoleError(...args);
      };

      // Clean up on unmount
      return () => {
        console.error = originalConsoleError;
      };
    }
  }, []);
}
```

2. Update your Next.js `_app.js` or `layout.js` file:

```jsx
// For _app.js (Pages Router)
import { useSuppressHydrationWarning } from '../suppressHydrationWarning';

function MyApp({ Component, pageProps }) {
  useSuppressHydrationWarning();

  return <Component {...pageProps} />;
}

export default MyApp;

// OR for App Router layout.js
'use client';
import { useSuppressHydrationWarning } from './suppressHydrationWarning';

export default function RootLayout({ children }) {
  useSuppressHydrationWarning();

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

This approach will suppress hydration warnings caused by elements outside your control, such as browser extensions adding attributes to the HTML.

## Browser Support

This component uses the [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API), which has varying support across browsers:

- ✅ Chrome
- ✅ Edge
- ✅ Safari
- ✅ Chrome for Android
- ✅ Safari on iOS
- ❌ Firefox (not supported)
- ❌ Opera (not supported)

## License

MIT
