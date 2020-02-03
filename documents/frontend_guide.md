# Frontend Dev Guide

## Overall Architecture

Simply put, it's a standard **React**, **Redux** single page app utilizing **ant design** for the UI elements.

There are various ways to use redux with react - at the extreme, we could've put every single state into the store.
But to have minimal boilerplate and ease the learning curve for the devs, we have chose to store only the "big" states - `model`, `rack`, `instance`, `user`. Since they're probably the ones that would eventually require some optimizations. 

## Codebase

Starting from `src`, 

`api/API.js` contains all the methods to interact with the server, so that the rest of the codebase is unaware of the actual implementation.

`components` has the usual React elements. *Hooks* *Hooks* *Hooks*

`global` has all the global side effects.

`redux` has the standard action/reducer/store - we don't necessarily colocate them with the components, just because we're storing only the "big" states inside the redux store, which don't really belong to a specific component.

## Tests

There aren't any as of today.

## Dev Tools

Running `npm run format` / using `eslint` extension with VS code will lint-beautify the code automatically. 

`npm run dev` will put the webpack into watch mode, which will observe changes on the file system and recompile the code automatically. 

`npm run build` produces a heavily optimized production build of the app. The compilation is slow, but it's probably for a good reason.

## Relevant links

https://reactjs.org/docs/hooks-state.html

https://reacttraining.com/react-router/web/api/HashRouter

https://redux.js.org/

https://react-redux.js.org/introduction/quick-start

https://ant.design/docs/react/introduce

https://immerjs.github.io/immer/docs/introduction