import * as R from 'ramda';
import * as moment from 'moment';

import knex from '../db/connection';

export default class Helpers {
  public static parseBodyRequiredValues(body: object, keys: Array<string>) {
    keys.forEach(key => {
      if (!body[key] || body[key] == '') {
        throw { message: `missing required value: '${key}'`, status: 400 };
      }
    });
    return body;
  }

  // TODO: refactor this
  public static checkDataType = R.curry((interfaceObj: object, obj: object): object => {
    Object.entries(interfaceObj).forEach(([key, type]) => {
      const prop = type === 'number' ? Helpers.toNumber(obj[key]) : obj[key];
      const actualType = R.type(prop).toLowerCase();

      const isDateValid = type === 'date' && moment(obj[key], 'mm-dd-yyyy').isValid();

      if (actualType !== type && !isDateValid) {
        throw { message: `wrong data type for: '${key}'`, status: 400 };
      }
    });

    return obj;
  });

  // TODO: refactor this
  public static toNumber(num: number): number | string {
    const parsedNumber = +num;

    return Number.isNaN(parsedNumber) ? '' : parsedNumber;
  }

  public static checkFields(keys) {
    const parseRequiredFields = R.flip(Helpers.parseBodyRequiredValues); // reverse the order of 2 first arguments
    const keysNames = Object.keys(keys);

    // picking keys and sending them to parse(read from right to left)
    return R.compose(
      Helpers.checkDataType(keys),
      parseRequiredFields(keysNames),
      R.pickAll(keysNames)
    );
  }

  public static filterBody(body: object, keys: Array<string>) {
    let values = {};
    Object.keys(body).forEach(key => {
      if (keys.indexOf(key) != -1) {
        values[key] = body[key];
      }
    });
    return values;
  }

  public static async checkUserOwnsJob(req, res, next) {
    let job_id = req.params.job_id;
    let user_id = req.user.id;

    try {
      let job = await knex('jobs')
        .where({ id: job_id })
        .first();
      if (job && job.user_id != user_id)
        res.status(401).json(`you do not have permission to view this job: ${job_id}`);
      else next();
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }

  public static parseSort(sort: string): string {
    let sorts = sort.split(',');
    return sort;
  }

  // TODO: refactor
  public static handleError(err, res) {
    console.log(err);
    const status = err.status || 500;
    const message = status !== 500 ? err.message : 'Internal Error';

    return res.status(status).json(message);
  }

  public static hashCode(str) {
    let hash = 5381,
      i = str.length;

    while (i) {
      hash = (hash * 33) ^ str.charCodeAt(--i);
    }
    return hash >>> 0;
  }
}
