'use strict';

const _ = {
  template: require('lodash/template')
};
const HOST = _.template('<%= company %>.supportbee.com');

const url = require('url');
const https = require('https');
const debug = require('debug')('supportbee');
const querystring = require('querystring');

function required(definitions, obj) {
  for (let prop in definitions) {
    if (!obj.hasOwnProperty(prop)) {
      let msg = definitions[prop] === true
        ? `Missing property: ${prop}`
        : definitions[prop];
      throw new Error(msg);
    }
  }
}

class API {
  constructor(opts) {
    required(
      {
        auth_token: true,
        company: true
      },
      opts
    );

    this.host = HOST(opts);
    this.auth_token = opts.auth_token;
  }

  xhr(method, endpoint, data) {
    let query = { auth_token: this.auth_token };
    let parsed = url.parse(endpoint);
    let search = querystring.parse(parsed.search);

    if (data && method === 'GET') {
      Object.assign(query, data);
    }

    parsed.search = querystring.stringify(Object.assign(search, query));

    let request = new Promise((resolve, reject) => {
      let config = {
        protocol: 'https:',
        port: 443,
        host: this.host,
        method: method,
        path: parsed.pathname + '?' + parsed.search,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      };

      let request = https.request(config, response => {
        debug(`${response.statusCode} <= ${config.path}`);

        let err = null;

        switch (response.statusCode) {
          case 200:
          case 201:
            break;
          case 204:
            return resolve(null);
            break;
          case 500:
            err = new Error('Failure');
            break;
          case 403:
            err = new Error('Access Denied');
            break;
          case 400:
            err = new Error('Validation Failure');
            break;
          default:
            err = new Error('Uknown Error: ', response.statusCode);
            break;
        }

        if (err) return reject(err);

        const body = [];

        response.on('data', chunk => body.push(chunk));

        response.on('end', () => {
          let json = JSON.parse(body.join(''));

          resolve(json);
        });
      });

      request.on('error', err => reject(err));

      if (data) request.write(JSON.stringify(data));

      debug(`${config.method} => ${config.path}`);
      request.end();
    });

    return request;
  }

  put(endpoint, data) {
    return this.xhr('PUT', endpoint, data);
  }

  get(endpoint, data) {
    return this.xhr('GET', endpoint, data);
  }

  post(endpoint, data) {
    return this.xhr('POST', endpoint, data);
  }

  del(endpoint, data) {
    return this.xhr('DELETE', endpoint, data);
  }
}

module.exports = API;
