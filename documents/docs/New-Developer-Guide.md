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

* https://reactjs.org/docs/hooks-state.html

* https://reacttraining.com/react-router/web/api/HashRouter

* https://redux.js.org/

* https://react-redux.js.org/introduction/quick-start

* https://ant.design/docs/react/introduce

* https://immerjs.github.io/immer/docs/introduction

# Backend Dev Guide

## Overall Architecture

The backend uses Django Rest Framework to manage routes, views, models, users, auth, and everything else. Bulk formatting is done with Django Import Export.

## Directory Structure

There are three Django apps: the default app (hyposoft), equipment, and frontend. The equipment directory contains various python files for managing the models used throughout the application. The important files are described below

## Tests
There are various tests in `tests.py`. They are automatically run upon pushing code to Gitlab. They test validation logic for the models, such as regex constraints and uniqueness constraints.

## Model Schemas
The model schemas are specified in `models.py`. They are described below:

* ITModel
    * Describes a hardware model for which instances can be deployed in the data center. (Named as to avoid conflicts with Django Model class)
    * Field vendor: string: Name of the vendor who sells this model
    * Field model_number: string: Name of the model provided by the vendor
    * Field height: integer: Number of rack units this model takes up
    * Field display_color: hex_code: Color of the model in rack elevation
    * Field ethernet_ports: integer: Number of ethernet ports on the model
    * Field power_ports: integer: Number of power ports on the model (must be at least one)
    * Field cpu: string: Model number of the cpu in this model
    * Field memory: integer: Number of GB of RAM in this model
    * Field storage: string: Information regarding storage for this model
    * Field comment: string: Optional comments on this model
* Rack
    * Describes a rack that holds equipment in the data center.
    * Field rack: string: Location of the rack with format row letter and number (e.g. B12)
* Instance
    * Describes an instance of a model in the database and its location in the data center.
    * Field itmodel: foreign key: Which model this is an instance of
    * Field hostname: string: RFC 1034 compliant hostname for the instance on the network
    * Field rack: foreign key: Which rack this instance is deployed onto
    * Field rack_position: integer: Which rack unit number the bottom of this equipment is placed on in the rack
    * Field owner: foreign key: Which user owns / manages this equipment (optional) (links to default Django user model)
    * Field comment: string: Optional comments on this rack

## Relevant Links

 * https://www.django-rest-framework.org/

 * https://docs.djangoproject.com/en/3.0/topics/testing/

 * https://django-import-export.readthedocs.io/en/latest/