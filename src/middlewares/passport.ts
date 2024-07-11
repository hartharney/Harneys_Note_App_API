import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import UserModel, { User } from '../firebase/models/User'; 
import { generateToken, hashPassword } from '../utils/utils';

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:8000/auth/google/callback',
},
async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await UserModel.findOne('googleId', profile.id);

    const token = await generateToken(profile.emails[0].value, profile.id);

    const randomPassword = Math.random().toString(36).slice(-8);

    const generatedPassword = await hashPassword(randomPassword);

    if (!user) {
      const userData: User = {
        id: profile.id,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        email: profile.emails[0].value,
        imageUrl: profile.photos[0].value,
        verified: false,
        googleId: profile.id,
        password: generatedPassword
      };
      user = await UserModel.create(userData);
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

// Serialize user into the sessions
passport.serializeUser((user: User, done) => {
  done(null, user.id); 
});

// Deserialize user from the sessions
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
