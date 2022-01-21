# Redistricting Research

This app lets you to run most of DRA's partisan analytics on election profiles that don't have associated DRA maps.

It is a cloned subset of the analytics on the *Advanced* tab in DRA.

## Partisan Profiles

A partisan profile is a JSON file that contains a statewide two-party Democratic vote share 
along with district-by-district Democratic vote shares.
For example:

``` JSON
{
  "statewide": 0.515036,
  "byDistrict": [
    0.423500,
    0.428588,
    0.433880,
    0.443866,
    0.454505,
    0.456985,
    0.458005,
    0.458134,
    0.463947,
    0.473144,
    0.718314,
    0.736620,
    0.775817
  ]
}
```

## Using This Repository

```npm install``` install all dependencies

```npm run build``` build all bundles

```npm run test``` run the server locally -- open a browser to http://localhost:3000