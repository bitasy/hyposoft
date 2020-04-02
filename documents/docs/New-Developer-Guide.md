# Frontend Dev Guide

## Overall Architecture

Simply put, it's a standard **React**, **Redux** single page app utilizing **ant design** for the UI elements.

There are various ways to use redux with react - at the extreme, we could've put every single state into the store.
But to have minimal boilerplate and ease the learning curve for the devs, we have chose to store only the "big" states - `model`, `rack`, `instance`, `user`. Since they're probably the ones that would eventually require some optimizations.

## Codebase

Starting from `src`,

`api/API.js` contains all the methods to interact with the server, so that the rest of the codebase is unaware of the actual implementation.

`components` has the usual React elements. _Hooks_ _Hooks_ _Hooks_

`global` has all the global side effects.

`redux` has the standard action/reducer/store - we don't necessarily colocate them with the components, just because we're storing only the "big" states inside the redux store, which don't really belong to a specific component.

## Dev Tools

Running `npm run format` / using `eslint` extension with VS code will lint-beautify the code automatically.

`npm run dev` will put the webpack into watch mode, which will observe changes on the file system and recompile the code automatically.

`npm run build` produces a heavily optimized production build of the app. The compilation is slow, but it's probably for a good reason.

## Relevant links

- https://reactjs.org/docs/hooks-state.html

- https://reacttraining.com/react-router/web/api/HashRouter

- https://redux.js.org/

- https://react-redux.js.org/introduction/quick-start

- https://ant.design/docs/react/introduce

- https://immerjs.github.io/immer/docs/introduction

# Backend Dev Guide

## Overall Architecture

The backend uses Django Rest Framework to manage routes, views, models, users, auth, and everything else. Bulk formatting is done with Django Import Export.

## Directory Structure

There are 6 Django apps: the default app (hyposoft), equipment, frontend, hypo_auth, system_log, and auth.

equipment: contains various python files for managing the models used throughout the application. The important files are described below

frontend: contains all of the frontend resources / source files.

hypo_auth: contains all the authentication-related files, including the shibboleth REMOTE_USER integration

system_log: contains all the files related to audit logs.

## Tests

There are various tests in `tests.py`. They are automatically run upon pushing code to Gitlab. They test validation logic for the models, such as regex constraints and uniqueness constraints.

## Model Schemas

The model schemas, which describes exactly how data models should be mapped out in a sql databse, are specified in `models.py`.

## API sets

The API sets are defined on `urls.py` on each of the "apps". Alternatively, you can run the server locally and point to `localhost:${PORT}/api/` and it'll list out the available API sets.

## Relevant Links

- https://www.django-rest-framework.org/

- https://docs.djangoproject.com/en/3.0/topics/testing/

- https://django-import-export.readthedocs.io/en/latest/
