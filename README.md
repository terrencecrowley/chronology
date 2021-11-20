# Redistricting Research

This app lets you to run DRA analytics on partisan profiles that don't have associated DRA maps.
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