// Node
import * as fs from "fs";

// Public libraries
import * as express from "express";
import * as bodyParser from "body-parser";
import * as busboy from "express-busboy";
import * as cookieParser from "cookie-parser";
import * as session from "express-session";
import * as passport from "passport";
import * as passport_local from "passport-local";
import flash = require("connect-flash");

// Shared libraries
import { Util, FSM } from "@dra2020/baseclient";

// App libraries
import * as UM from "./users";

let app = express();

import * as APIManager from './serversession';
let apiManager: APIManager.APIManager = new APIManager.APIManager();
const DebugMode: boolean = apiManager.env.context.xflag('dra_debug');
const port: number = apiManager.env.context.xnumber('port');
 
//app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));  // enough for california blockmap
//app.use(bodyParser.json({limit: '50mb'}));

function import_allow(url: string): boolean
{
  return url === '/api/sessions/import';
}

busboy.extend(app, 
  { upload: true,
    path: './uploads',
    allowedPath: import_allow,
    limits: { fileSize: 10000000 },
  });
app.use(cookieParser());
app.use(flash());
app.use(session(
  {
    secret: 'DRA server',
    saveUninitialized: true,
    resave: false,
    store: apiManager.env.storeManager,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 }
  }
));
app.use(passport.initialize());
app.use(passport.session());

// Setup PORT

// Routes
let router = express.Router();
let forgotRouter = express.Router();
let verifyRouter = express.Router();

// Middleware
router.use(function(req, res, next) {
  next();
});
forgotRouter.use(function(req, res, next) {
  next();
});
verifyRouter.use(function(req, res, next) {
  next();
});

// HTML and JSON routes
app.use('/', express.static('public'));
app.use('/', express.static('data'));
app.use('/', express.static('config'));
app.use('/scripts', express.static('clientdist'));

// Authentication and user management

function markActive(req: any): void
{
  if (req && req.user)
    apiManager.env.userManager.userMarkActive(req.user as UM.IUser);
}

let LocalStrategy = passport_local.Strategy;

passport.serializeUser(function(user: UM.IUser, done: any) {
  done(null, user.id);
  });

passport.deserializeUser(function(id: any, done: any) {
    apiManager.env.userManager.findCB({ id: id }, (user: UM.IUser) => {
        done(null, user);
      });
  });

passport.use(new LocalStrategy(
  function(username: any, password: any, done: any) {
      apiManager.env.userManager.findCB({ email: username }, (user: UM.IUser) => {
          if (user == null)
          {
            apiManager.env.log.event('invalid user');
            return done(null, false, { message: 'No such user.' });
          }
          else if (! apiManager.env.userManager.userValidPassword(user, password))
          {
            apiManager.env.log.event('invalid password');
            return done(null, false, { message: 'Incorrect password.' });
          }

          // Track activity
          apiManager.env.userManager.userMarkActive(user);

          apiManager.env.log.event({ event: 'valid login', userid: user.id });
          return done(null, user);
        });
    }));

function isDraining(req: any, res: any, next: any) {
  if (apiManager.isDraining)
    res.sendStatus(503); // Failure, try again later
  else
    return next();
}

// Middleware to protect API calls with authentication status
function isLoggedIn(req: any, res: any, next: any) {
  if (req.user)
    return next();
  req.session.redirect_to = req.originalUrl;
  res.redirect('/login');
}

function isAnonAPI(req: any, res: any, next: any) {
  if (req.user)
    return next();
  else
  {
    apiManager.env.userManager.findAnon((user: UM.IUser) => {
        if (user)
        {
          apiManager.env.log.event('anonymous visit');
          req.user = user;
          return next();
        }
        else
          res.setStatus(401);
      });
  }
}

function isLoggedInAPI(req: any, res: any, next: any) {
  if (req.user)
    return next();
  res.sendStatus(401); // Unauthorized
}
  
function isAdminAPI(req: any, res: any, next: any) {
  if (req.user && req.user.admin)
    return next();
  res.sendStatus(401); // Unauthorized
}
  
// Authenticated pages
if (DebugMode)
  app.use('/pages', isLoggedIn, express.static('pages_debug'));
else
  app.use('/pages', isLoggedIn, express.static('pages'));

// Unauthenticated
app.use('/unauth', express.static('pages'));

// Authentication routes
app.get('/', function(req: any, res: any, next: any) {
  if (req.user)
  {
    //console.log('In main app.get req.user');
    next();
  }
  else
  {
    //console.log('In main app.get no user');
    next();
  }
});

function loginSuccessful(req: any, res: any)
{
  let responseBody: any = { result: 0, user: apiManager.env.userManager.userToView(req.user) };
  res.json(responseBody);
}

app.get('/auth/local', passport.authenticate('local'), loginSuccessful  );

app.get('/signup', function(req: any, res: any) { res.redirect('/login'); });

app.get('/maps', function (req: any, res: any)
{
  res.sendFile('pages/index.html', {root: './'})
});

app.get('/login',
  function (req: any, res: any)
  {
    if (req.user)
    {
      if (req.session.redirect_to)
      {
        let url: string = req.session.redirect_to;
        delete req.session.redirect_to;
        res.redirect(url);
      }
      else
        res.redirect('/maps');
    }
    else
        res.redirect('/maps');
  });

app.post('/login',
  // first process signup request if necessary
  function(req: any, res: any, next: () => void)
  {
    if (req.body.signup)
    {
      apiManager.env.userManager.findCB({ email: req.body.username }, (user: UM.IUser) => {
          if (user)
          {
            apiManager.env.log.event('new user in use');
            res.json( { result: 1, message: 'That email is already in use.' } );
            return;
          }
          else if (req.body.username.indexOf('@') == -1)
          {
            apiManager.env.log.event('invalid user name');
            res.json( { result: 1, message: 'Please provide a valid email address.' } );
            return;
          }
          {
            let name: string = req.body.username;
            let a: string[] = req.body.username.split('@');
            if (a.length == 2)
              name = a[0];
            let o: any = { email: req.body.username, password: req.body.password, name: name };
            apiManager.env.log.event('createuser');
            let fsm = apiManager.env.userManager.createUser(o);
            new FSM.FsmOnDone(apiManager.env, fsm, (f: FSM.Fsm) => {
                next();
              });
          }
        });
    }
    else
      next();
  },
  // Now authenticate
  passport.authenticate('local'),
  // Now respond with success
  loginSuccessful
  );

app.get('/logout', function(req: any, res: any) {
  apiManager.env.log.event('logout');
  req.logout();
  res.redirect('/');
  });

// Forgot password
forgotRouter.route('/fetch')
  .post(function(req, res) {
    apiManager.resetPassword(req, res, req.body.email);
    });
forgotRouter.route('/reset/:resetGUID')
  .get(function(req, res) {
    apiManager.env.log.event('reset password form');

    // Page uses URL to request reset
    let options: any = { root: './' };
    res.sendFile('pages/index.html', options);
    });
forgotRouter.route('/set')
  .post(function(req, res) {
    apiManager.resetPasswordByGUID(req, res, req.body.password, req.body.resetGUID);
    });
app.use('/forgotpassword', forgotRouter);

// Verify email
verifyRouter.route('/:verifyGUID')
  .get(function(req, res) {
    apiManager.verifyEmail(req, res, req.params.verifyGUID);
    });
app.use('/verify', verifyRouter);

// Admin route
router.route('/admin')
  .post(isAdminAPI, function(req, res) {
    apiManager.admin(req, res);
    });

// API routes
router.route('/sessions')

router.route('/sessions/userview')
  .post(isAnonAPI, function(req, res) {
    markActive(req);
    apiManager.userView(req, res);
    });

router.route('/sessions/profile')
  .post(isLoggedInAPI, function(req, res) {
    markActive(req);
    apiManager.updateProfile(req, res);
    });

router.route('/sessions/presign')
  .post(isLoggedInAPI, function(req: any, res: any) {
    markActive(req);
    apiManager.presign(req, res);
    });

// Api routes
app.use('/api', router);

// Home page
app.get('/*', function (req: any, res: any, next: any)
{
  let options: any = {root: './'};
  //console.log('Home')
  res.sendFile('pages/index.html', options);
});


const server = app.listen(port);
// See https://shuheikagawa.com/blog/2019/04/25/keep-alive-timeout/
server.keepAliveTimeout = 61 * 1000;
server.headersTimeout = 65 * 1000;

console.log('===============================================');
console.log('===============================================');
console.log(`Listening on port ${port}`);
console.log(`Started server at ${Util.Now()}`);
apiManager.env.log.event(`Listening on port ${port}`);  // loganalyzer uses this to detect restarts
apiManager.env.log.event(`Started server at ${Util.Now()}`);
