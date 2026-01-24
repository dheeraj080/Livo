import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js'; // Remember the .js extension!

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/notes/google/callback',
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 1. Look for the user
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // 2. Create if they don't exist
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            displayName: profile.displayName,
            avatar: profile.photos[0]?.value, // <--- MAP THIS CORRECTLY
          });
        } else {
          // 3. Optional: Update avatar in case they changed it on Google
          user.avatar = profile.photos[0]?.value;
          await user.save();
        }
        
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);