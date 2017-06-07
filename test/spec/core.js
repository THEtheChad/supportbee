'use strict';

const assert = require('assert');
const Bee = require('../../lib/core');
const config = require('../config');

describe('Bee', function() {
  describe('Bee#constructor', function() {
    it('should throw an error if required params are not present', function() {
      assert.throws(function() {
        new Bee();
      });

      assert.throws(function() {
        new Bee({
          company: 'test'
        });
      });

      assert.throws(function() {
        new Bee({
          auth_token: 'test'
        });
      });
    });
  });

  describe('Bee#get', function() {
    it('should throw an error if required params are not present', async function() {
      let bee = new Bee(config);

      let tickets = await bee.get('/tickets');

      console.log(tickets);

      assert.ok(true);
    });
  });
});
