# Publishing to NPM

This document explains how to publish this package to NPM.

## Prerequisites

1. You need an NPM account. If you don't have one, create it at [npmjs.com](https://www.npmjs.com/signup).
2. You need to be logged in to NPM in your terminal:

```bash
npm login
```

## Publishing Steps

1. Make sure your code is ready for publishing:

   - All features are working
   - Tests pass (if applicable)
   - Documentation is up to date
   - Version in package.json is correct

2. Build the package:

```bash
npm run build
```

3. Test the build:

   - Make sure the dist/ folder contains the built files
   - Check that the package works correctly when imported

4. Publish to NPM:

```bash
npm publish
```

If this is the first time publishing this package, you might need to check if the package name is available:

```bash
npm search react-voice-search
```

## Updating the Package

1. Update your code as needed.

2. Update the version in package.json following semantic versioning:

   - MAJOR version for incompatible API changes
   - MINOR version for adding functionality in a backwards compatible manner
   - PATCH version for backwards compatible bug fixes

3. Build and publish:

```bash
npm run build
npm publish
```

## Testing Your Published Package

You can test your published package by installing it in another project:

```bash
npm install react-voice-search
```

## NPM Package Visibility

By default, your package will be public. If you want to make it private:

```bash
npm publish --access restricted
```

Note: Private packages require a paid NPM account.

## Unpublishing

NPM has strict policies about unpublishing. In general, you shouldn't unpublish packages that others might be using. However, if you need to unpublish:

```bash
# For versions
npm unpublish react-voice-search@1.0.0

# For the entire package (only within 72 hours of publishing)
npm unpublish react-voice-search --force
```
