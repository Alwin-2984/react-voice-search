# React Voice Search

A React component that provides voice search functionality with audio visualization and cross-browser support.

## Features

- Voice recognition with audio level visualization
- Cross-browser support (except Firefox and Opera due to Web Speech API limitations)
- Android device detection and custom animation
- Customizable styling with both inline styles and CSS classes
- Error handling and user feedback
- Custom icons support

## Installation

```bash
npm install react-voice-search
# or
yarn add react-voice-search
```

## Usage

```jsx
import React, { useState } from "react";
import VoiceSearch from "react-voice-search";

function App() {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    console.log("Searching for:", e.target.value);
    // Your search logic here
  };

  return (
    <div className="App">
      <h1>Voice Search Example</h1>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <VoiceSearch
          setSearchData={setSearchTerm}
          searchData={searchTerm}
          handleSearch={handleSearch}
          placeholder="Search for anything..."
        />
      </div>
    </div>
  );
}

export default App;
```

## Props

| Prop               | Type          | Default                                | Description                                                      |
| ------------------ | ------------- | -------------------------------------- | ---------------------------------------------------------------- |
| `setSearchData`    | Function      | Required                               | Function to update the search text state                         |
| `searchData`       | String        | `''`                                   | The current search text value                                    |
| `handleSearch`     | Function      | -                                      | Function called when search text changes or speech is recognized |
| `width`            | String/Number | `'100%'`                               | Width of the search component                                    |
| `darkMode`         | Boolean       | `false`                                | Enable dark mode styling                                         |
| `inputTextStyle`   | Object        | `{}`                                   | Custom styles for the input element                              |
| `placeholder`      | String        | `'Search for billers, services, etc.'` | Placeholder text for the input                                   |
| `language`         | String        | `'en-US'`                              | Language for speech recognition                                  |
| `customSearchIcon` | Component     | -                                      | Custom component for the search icon                             |
| `customMicIcon`    | Component     | -                                      | Custom component for the microphone icon                         |
| `customStyles`     | Object        | `{}`                                   | Custom styles for each element in the component                  |
| `customClasses`    | Object        | `{}`                                   | Custom CSS classes for each element in the component             |

### customStyles Object

You can customize the styling of each part of the component:

```jsx
const customStyles = {
  container: {
    /* styles for the outer container */
  },
  inputContainer: {
    /* styles for the input wrapper */
  },
  iconButton: {
    /* styles for the search icon button */
  },
  input: {
    /* styles for the input element */
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
  error: {
    /* styles for the error message */
  },
};
```

### customClasses Object

You can also apply custom CSS classes:

```jsx
const customClasses = {
  container: "my-container-class",
  inputContainer: "my-input-wrapper",
  input: "my-input-class",
  micContainer: "my-mic-container",
  pulse: "my-pulse-animation",
  micButton: "my-mic-button",
  error: "my-error-message",
  searchIcon: "my-search-icon",
  micIcon: "my-mic-icon",
};
```

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
