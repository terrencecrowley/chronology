#!/bin/bash
#
# Update node/npm dependencies
#
# - Use "node-check-updates" (or ncu) to see which dependencies are out of date. 
#   It will show you the latest version (x.y.z).
#
# - If z is out of date, just "npm install [lib] will install the update.
# - If y is out of date, "npm install [lib]@latest" will install the update.
# - If x is out of date, "npm install [lib]@<new x>"" will install the update.
#
# For example:
#
# ./npm-updates.sh
#

# I bumped the version number to 1.1.0.

# Initial ncu check:

#  @dra2020/baseclient               ^1.0.67  →          ^1.0.89     
#  @dra2020/baseserver               ^1.0.33  →          ^1.0.43     
#  @dra2020/dra-analytics             ^3.3.3  →           ^4.1.0     
#  @material-ui/core                 ^4.11.2  →          ^4.12.4     
#  @material-ui/icons                ^4.11.2  →          ^4.11.3     
#  @material-ui/lab          ^4.0.0-alpha.57  →  ^4.0.0-alpha.61     
#  acorn                              ^8.6.0  →           ^8.8.1     
#  aws-sdk                         ^2.1046.0  →        ^2.1255.0     
#  body-parser                       ^1.19.0  →          ^1.20.1     
#  classnames                         ^2.3.1  →           ^2.3.2     
#  express                           ^4.17.1  →          ^4.18.2     
#  express-busboy                     ^8.0.0  →           ^9.0.0     
#  express-session                   ^1.17.2  →          ^1.17.3     
#  mapbox-gl                          ^2.6.1  →          ^2.11.0     
#  object-hash                        ^2.2.0  →           ^3.0.0     
#  papaparse                          ^5.3.1  →           ^5.3.2     
#  passport                           ^0.5.0  →           ^0.6.0     
#  prop-types                        ^15.7.2  →          ^15.8.1     
#  react                             ^16.8.6  →          ^18.2.0     
#  react-dom                         ^16.8.6  →          ^18.2.0     
#  react-swipeable-views             ^0.13.9  →          ^0.14.0     
#  react-virtualized                 ^9.21.1  →          ^9.22.3     
#  shpjs                              ^4.0.2  →           ^4.0.4     
#  @types/connect-flash               0.0.36  →           0.0.37     
#  @types/cookie-parser               ^1.4.2  →           ^1.4.3     
#  @types/express                   ^4.17.13  →         ^4.17.14     
#  @types/express-session            ^1.17.4  →          ^1.17.5     
#  @types/file-saver                  ^2.0.4  →           ^2.0.5     
#  @types/geojson                  ^7946.0.8  →       ^7946.0.10     
#  @types/jquery                     ^3.5.10  →          ^3.5.14     
#  @types/mapbox-gl                   ^2.6.0  →           ^2.7.8     
#  @types/material-ui                ^0.21.8  →         ^0.21.12     
#  @types/node                           ^12  →              ^18     
#  @types/papaparse                   ^5.3.1  →           ^5.3.5     
#  @types/passport                    ^1.0.7  →          ^1.0.11     
#  @types/react                     ^16.8.23  →         ^18.0.25     
#  @types/react-dom                  ^16.8.4  →          ^18.0.9     
#  @types/react-virtualized          ^9.21.2  →         ^9.21.21     
#  @types/shpjs                       ^3.4.1  →           ^3.4.2     
#  css-loader                         ^6.5.1  →           ^6.7.2     
#  sass-loader                       ^12.4.0  →          ^13.2.0     
#  source-map-loader                  ^3.0.0  →           ^4.0.1     
#  ts-loader                          ^9.2.6  →           ^9.4.1     
#  typescript                         ^4.5.3  →           ^4.9.3     
#  webpack                           ^5.65.0  →          ^5.75.0     
#  webpack-cli                        ^4.9.1  →          ^4.10.0  

### Initial updates -- modeled on dra-client package.json

## dependencies

# server
npm install @dra2020/baseclient
npm install @dra2020/baseserver
npm install aws-sdk@latest
npm install body-parser@latest
npm install express@latest
# npm install express-busboy@9
npm install express-session
# npm install object-hash@3
npm install passport@latest

# other client
npm install @dra2020/dra-analytics@4
npm install @material-ui/core@latest
npm install @material-ui/icons
npm install @material-ui/lab
npm install @types/shpjs
npm install classnames
npm install mapbox-gl@latest
npm install prop-types@latest
# npm install react@18
# npm install react-dom@18
npm react-swipeable-views@latest
npm install react-virtualized@latest
npm install shpjs

# other
npm install acorn@latest
npm install papaparse

## devDependencies

# server
npm install @types/connect-flash --save-dev
npm install @types/cookie-parser --save-dev
npm install @types/express --save-dev
npm install @types/express-session --save-dev
npm install @types/passport --save-dev
# npm install source-map-loader@4
npm install ts-loader@latest --save-dev
npm install typescript@latest --save-dev
npm install webpack@latest --save-dev
npm install webpack-cli@latest --save-dev

# other client
npm install @types/file-saver --save-dev
npm install @types/geojson --save-dev
npm install @types/jquery --save-dev
npm install @types/mapbox-gl@latest
npm install @types/material-ui --save-dev
# npm install @types/react@18 --save-dev
# npm install @types/react-dom@18 --save-dev
npm install @types/react-virtualized --save-dev
npm install css-loader@latest --save-dev
# npm install sass-loader@13

# other
npm install @types/papaparse --save-dev


# This yielded:

#  @material-ui/lab       ^4.0.0-alpha.57  →  ^4.0.0-alpha.61     
#  express-busboy                  ^8.0.0  →           ^9.0.0     
#  object-hash                     ^2.2.0  →           ^3.0.0     
#  react                          ^16.8.6  →          ^18.2.0     
#  react-dom                      ^16.8.6  →          ^18.2.0     
#  react-swipeable-views          ^0.13.9  →          ^0.14.0     
#  @types/connect-flash           ^0.0.36  →          ^0.0.37     
#  @types/node                        ^12  →              ^18     
#  @types/react                  ^16.8.23  →         ^18.0.25     
#  @types/react-dom               ^16.8.4  →          ^18.0.9     
#  sass-loader                    ^12.4.0  →          ^13.2.0     
#  source-map-loader               ^3.0.0  →           ^4.0.1  

# with status:
# - build failed
# - I added "esModuleInterop": true, to tsconfig.json

# 