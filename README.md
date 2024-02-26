# react-scroll-end-pinner

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Macil/react-scroll-end-pinner/blob/master/LICENSE.txt)
[![npm version](https://badge.fury.io/js/react-scroll-end-pinner.svg)](https://badge.fury.io/js/react-scroll-end-pinner)
[![Node.js CI](https://github.com/Macil/react-scroll-end-pinner/actions/workflows/node.js.yml/badge.svg)](https://github.com/Macil/react-scroll-end-pinner/actions/workflows/node.js.yml)

ScrollEndPinner is a React component for creating a scrollable area that stays scrolled to the end if the user has scrolled to the end when new content is added (or the content or the page is resized). This is useful for chat windows and logs.

TODO:

- write readme with usage example
- create example page (use storybook?)

## Similar Techniques

This component gives a similar result as using the relatively new `overflow-anchor: auto` CSS rule as described in https://css-tricks.com/books/greatest-css-tricks/pin-scrolling-to-bottom/, but this component currently works in more browsers and doesn't require the element to be scrollable and scrolled first to take effect.

Assuming that the use of `overflow-anchor: auto` is as dependable as this component currently is, this component may be updated in the future to feature-detect `overflow-anchor` and use it when possible.

## Types

[TypeScript](https://www.typescriptlang.org/) type definitions for this module are included!
