# React Voice Search Demo

This document shows a quick demo of how to use the React Voice Search component in your project.

## Installation

```bash
npm install react-voice-search
# or
yarn add react-voice-search
```

## Basic Usage

```jsx
import React, { useState } from "react";
import VoiceSearch from "react-voice-search";

function SearchComponent() {
  const [searchText, setSearchText] = useState("");

  const handleSearch = (e) => {
    console.log("Searching for:", e.target.value);
    // Your search logic here
  };

  return (
    <div>
      <VoiceSearch
        searchData={searchText}
        setSearchData={setSearchText}
        handleSearch={handleSearch}
      />
    </div>
  );
}
```

## Dark Mode

```jsx
<VoiceSearch
  searchData={searchText}
  setSearchData={setSearchText}
  darkMode={true}
  placeholder="Search with your voice..."
/>
```

## Custom Styling

```jsx
<VoiceSearch
  searchData={searchText}
  setSearchData={setSearchText}
  width="500px"
  customStyles={{
    input: {
      backgroundColor: "#f0f0f0",
      borderRadius: "8px",
    },
    micButton: {
      backgroundColor: "#e0e0e0",
      borderRadius: "50%",
      padding: "8px",
    },
  }}
/>
```

## Custom CSS Classes

```jsx
<VoiceSearch
  searchData={searchText}
  setSearchData={setSearchText}
  customClasses={{
    container: "my-search-container",
    input: "my-search-input",
    micButton: "my-mic-button",
  }}
/>
```

## Different Language

```jsx
<VoiceSearch
  searchData={searchText}
  setSearchData={setSearchText}
  language="es-ES" // Spanish
/>
```

## Custom Icons

```jsx
import { FaSearch, FaMicrophone } from "react-icons/fa";

<VoiceSearch
  searchData={searchText}
  setSearchData={setSearchText}
  customSearchIcon={FaSearch}
  customMicIcon={FaMicrophone}
/>;
```

## Running the Demo

You can run the example app included in the package:

1. Clone the repository
2. Navigate to the example directory
3. Install dependencies: `npm install`
4. Run the example: `npm start`

## Publishing Process

To publish this package to NPM:

1. Login to NPM:

   ```bash
   npm login
   ```

2. Make sure all the files are built:

   ```bash
   npm run build
   ```

3. Check the contents that will be published:

   ```bash
   npm pack
   ```

   This creates a tarball without actually publishing.

4. Publish the package:

   ```bash
   npm publish
   ```

5. After publishing, your package will be available at:
   https://www.npmjs.com/package/react-voice-search
