import * as passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy } from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';
import knex from '../db/connection';
import authHelpers from './_helpers';

let opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('JWT'),
  secretOrKey: process.env.TOKEN_SECRET
};

passport.use(
  new JwtStrategy(opts, (jwt_payload, done) => {
    knex('users')
      .where({ username: jwt_payload.username })
      .first()
      .then(user => {
        if (!user) return done(null, false, 'username does not exist');
        if (!authHelpers.comparePass(jwt_payload.password, user.password)) {
          return done(null, false, 'incorrect password');
        } else {
          return done(null, user);
        }
      })
      .catch(err => {
        return done(err);
      });
  })
);

passport.use(
  new LocalStrategy(opts, (username, password, done) => {
    knex('users')
      .where({ username })
      .first()
      .then(user => {
        if (!user) return done(null, false, 'username does not exist');
        if (!authHelpers.comparePass(password, user.password)) {
          return done(null, false, 'incorrect password');
        } else {
          user.token = authHelpers.encodeToken(user);
          return done(null, user);
        }
      })
      .catch(err => {
        return done(err);
      });
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  knex('users')
    .where({ id })
    .first()
    .then(user => {
      done(null, user);
    })
    .catch(err => {
      done(err, null);
    });
});

module.exports = passport;
