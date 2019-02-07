import * as bcrypt from 'bcryptjs';
import * as moment from 'moment';
import * as R from 'ramda';
import * as jwt from 'jwt-simple';

import knex from '../db/connection';

export default class AuthHelpers {
  public static comparePass(userPassword, databasePassword) {
    return bcrypt.compareSync(userPassword, databasePassword);
  }

  public static createUser(req) {
    const salt = bcrypt.genSaltSync();
    const hash = bcrypt.hashSync(req.body.password, salt);
    const userFields = ['username', 'email', 'role', 'region_id', 'is_admin'];
    const user = R.pick(userFields, req.body);

    return knex('users')
      .where({ username: req.body.username })
      .first()
      .then(row => {
        if (row) return Promise.reject({ status: 403, message: 'username already exists' });
        else {
          return knex('users').insert(
            {
              ...user,
              organization_id: req.body.organization_id || 1,
              password: hash
            },
            '*'
          );
        }
      });
  }

  public static loginRequired(req, res, next) {
    if (!req.user) return res.status(401).json({ status: 'Please log in' });
    return next();
  }

  public static encodeToken(user) {
    const playload = {
      exp: moment()
        .add(7, 'days')
        .unix(),
      iat: moment().unix(),
      sub: user.id
    };

    return jwt.encode(playload, process.env.TOKEN_SECRET);
  }

  public static decodeToken(token, callback) {
    let payload;
    try {
      payload = jwt.decode(token, process.env.TOKEN_SECRET);
    } catch (err) {
      return callback(err.message);
    }
    return callback(null, payload);
  }

  public static ensureAuthenticated(req, res, next) {
    if (!(req.headers && req.headers.authorization)) {
      return res.status(401).json({
        status: 'Please log in',
        redirect: 'login'
      });
    }
    // decode the token
    var header = req.headers.authorization.split(' ');
    var token = header[1];
    AuthHelpers.decodeToken(token, (err, payload) => {
      if (err) {
        return res.status(401).json({
          status: err,
          redirect: 'login'
        });
      } else {
        return knex('users')
          .where({ id: parseInt(payload.sub) })
          .first()
          .then(user => {
            if (!user) {
              res.status(401).json({
                status: 'User doesn\'t exist',
                redirect: 'login'
              });

              return;
            };

            req.user = user;
            next();
          })
          .catch(err => {
            res.status(500).json({
              status: `error: ${err}`
            });
          });
      }
    });
  }
}
