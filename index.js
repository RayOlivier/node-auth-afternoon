require("dotenv").config()

const express = require("express")
const session = require("express-session")
const passport = require("passport")
const auth0Strategy = require("passport-auth0")

const students = require("./students.json")

const app = express()

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
)
app.use(passport.initialize())
app.use(passport.session())
passport.use(
  new auth0Strategy( //done in a separate file in the mini
    {
      domain: process.env.DOMAIN,
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "/login",
      scope: "openid email profile"
    },
    (accessToken, refreshToken, extraParams, profile, done) => {
      return done(null, profile)
    }
  )
)

passport.serializeUser((user, done) => {
  done(null, {
    clientID: user.id,
    email: user._json.email,
    name: user._json.name
  }) //this is choosing what to save in the session
})

passport.deserializeUser((obj, done) => {
  done(null, obj)
})

app.get(
  "/login",
  passport.authenticate("auth0", {
    successRedirect: "/students",
    failureRedirect: "/login",
    connection: "github" //this forces them to authenticate via github... i think
  })
)

function authenticated(req, res, next) {
  if (!req.user) {
    res.sendStatus(401)
  } else {
    next()
  }
}

app.get("/students", authenticated, (req, res) => {
  res.status(200).json(students)
})

const port = 3001
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
