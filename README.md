# 🎤 React Voice Search Component

[![npm version](https://badge.fury.io/js/react-voice-search.svg)](https://badge.fury.io/js/react-voice-search)
[![Weekly Downloads](https://img.shields.io/npm/dw/react-voice-search.svg)](https://npmjs.org/package/react-voice-search)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/react-voice-search)](https://bundlephobia.com/package/react-voice-search)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

**The most comprehensive React voice search component** with real-time audio visualization, speech recognition, and cross-browser support. Perfect for modern web applications, e-commerce sites, and voice-enabled user interfaces.

## 🚀 Why Choose React Voice Search?

A powerful, production-ready React component that transforms speech into searchable text with stunning visual feedback. Built for modern web applications with Next.js SSR support, TypeScript compatibility, and mobile optimization.

## ✨ Key Features

- 🎙️ **Real-time Voice Recognition** - Powered by Web Speech API with instant feedback
- 📊 **Audio Visualization** - Beautiful waveform animations during voice input
- 🌐 **Cross-Browser Support** - Works on Chrome, Safari, Edge, and mobile browsers
- 📱 **Mobile Optimized** - Android and iOS device detection with custom animations
- 🎨 **Fully Customizable** - Support for custom styles, CSS classes, and icons
- ⚡ **Next.js Ready** - Server-Side Rendering (SSR) compatible out of the box
- 🛡️ **TypeScript Support** - Built with TypeScript for better developer experience
- 🔧 **Error Handling** - Comprehensive error management and user feedback
- ♿ **Accessibility** - ARIA-compliant for screen readers and assistive technologies
- 📦 **Lightweight** - Minimal bundle size with zero external dependencies

## 📦 Installation

Install via npm or yarn:

```bash
# Using npm
npm install react-voice-search

# Using yarn
yarn add react-voice-search

# Using pnpm
pnpm add react-voice-search
```

## 🚀 Quick Start

Get started with React Voice Search in just 3 steps:

```jsx
import React from "react";
import VoiceSearch from "react-voice-search";

function App() {
  const handleSearch = (transcript) => {
    console.log("User said:", transcript);
    // Implement your search logic here
  };

  return (
    <div>
      <h1>Voice-Powered Search</h1>
      <VoiceSearch 
        handleSearch={handleSearch}
        placeholder="Click the mic and start speaking..."
      />
    </div>
  );
}

export default App;
```

> **Live Demo**: [Try it now →](https://alwin-2984.github.io/react-voice-search)

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

## 🌐 Browser Support

This React voice search component leverages the **[Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)** for optimal performance across modern browsers:

| Browser | Support | Notes |
|---------|---------|-------|
| ✅ Chrome | Full Support | Best performance with all features |
| ✅ Edge | Full Support | Microsoft Edge 79+ recommended |
| ✅ Safari | Full Support | Safari 14.1+ for optimal experience |
| ✅ Chrome Mobile | Full Support | Android Chrome with microphone permissions |
| ✅ Safari iOS | Full Support | iOS Safari 14.5+ recommended |
| ❌ Firefox | Limited | Web Speech API not fully supported |
| ❌ Opera | Limited | Limited Web Speech API implementation |

## 🤝 Contributing

We welcome contributions! Here's how you can help improve React Voice Search:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Setup

```bash
# Clone the repository
git clone https://github.com/Alwin-2984/react-voice-search.git

# Install dependencies
cd react-voice-search
npm install

# Build the component
npm run build
```

## 📈 Performance & Bundle Size

- **Minified Size**: ~15KB
- **Gzipped**: ~5KB
- **Dependencies**: 2 peer dependencies (React, React-DOM)
- **Tree Shakeable**: ES modules supported
- **TypeScript**: Full type definitions included

## 🔗 Related Projects

Looking for more React components? Check out these related voice and audio projects:

- [React Speech Kit](https://www.npmjs.com/package/react-speech-kit) - Speech synthesis and recognition
- [Web Speech API Polyfill](https://www.npmjs.com/package/web-speech-polyfill) - Cross-browser compatibility
- [React Audio Visualizer](https://www.npmjs.com/package/react-audio-visualizer) - Audio visualization components

## 🏷️ Keywords

`react voice search`, `speech recognition`, `speech to text`, `voice input`, `microphone component`, `audio visualization`, `web speech api`, `react component`, `nextjs voice search`, `typescript react`, `voice control`, `browser speech recognition`, `real-time voice`, `voice UI`, `accessibility voice`

## 📄 License

MIT © [Alwin KC](https://github.com/Alwin-2984)

---

**Made with ❤️ for the React community**

[![GitHub stars](https://img.shields.io/github/stars/Alwin-2984/react-voice-search?style=social)](https://github.com/Alwin-2984/react-voice-search)
[![npm downloads](https://img.shields.io/npm/dt/react-voice-search.svg)](https://www.npmjs.com/package/react-voice-search)
