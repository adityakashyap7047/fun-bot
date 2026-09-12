const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Setting = require('../models/Setting');

module.exports = function (passport) {
  // Local Strategy
  passport.use(
    new LocalStrategy({ usernameField: 'username' }, async (username, password, done) => {
      try {
        // Check admin settings first
        const settings = await Setting.findOne();
        if (settings && username === settings.username) {
          const isMatch = await settings.comparePassword(password);
          if (isMatch) {
            return done(null, { _id: 'admin', username: settings.username, name: 'Administrator', role: 'admin' });
          }
        }

        // Check user collection
        const user = await User.findOne({ username: username.toLowerCase() });
        if (!user) return done(null, false, { message: 'Invalid username or password' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return done(null, false, { message: 'Invalid username or password' });

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  // Google Strategy (only configure if credentials exist)
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id_here') {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: '/api/auth/google/callback'
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            let user = await User.findOne({ googleId: profile.id });
            if (user) return done(null, user);

            // Create new user from Google profile
            user = await User.create({
              googleId: profile.id,
              username: profile.emails[0].value.split('@')[0],
              name: profile.displayName,
              shop: profile.displayName + "'s Shop",
              category: 'other',
              phone: '',
              password: require('crypto').randomBytes(16).toString('hex'),
              role: 'owner'
            });
            return done(null, user);
          } catch (err) {
            return done(err);
          }
        }
      )
    );
  }

  // Serialize user
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  // Deserialize user
  passport.deserializeUser(async (id, done) => {
    try {
      if (id === 'admin') {
        const settings = await Setting.findOne();
        return done(null, { _id: 'admin', username: settings.username, name: 'Administrator', role: 'admin' });
      }
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
