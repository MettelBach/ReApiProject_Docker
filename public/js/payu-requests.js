'use strict';
var request = require('request'),
  extend = require('extend'),
  PayU;

PayU = function (merchantConfig, hashKey) {
  var isConfigMerchantId = typeof merchantConfig === 'string' || typeof merchantConfig === 'number',
    isConfigObject = typeof merchantConfig === 'object' && !(merchantConfig instanceof Array);

  this.config = {};
  this.requestData = {
    uri: 'https://secure.snd.payu.com/api/v2_1/orders',
    headers: {
      'content-type': 'application/json'
    },
    auth: {}
  };
  if (isConfigMerchantId) this.config.merchantPosId = merchantConfig;
  if (isConfigObject) this.config = merchantConfig;
  if (hashKey) this.config.key = hashKey;
  this.login();
};

PayU.API = {};

PayU.setDefaultMerchant = function (merchantConfig, hashKey) {
  PayU.API = new PayU(merchantConfig, hashKey);
  return PayU.API;
};

PayU.parsePrice = function (floatPrice) {
  var roundedPrice = (floatPrice * 100).toFixed(0);
  return parseInt(roundedPrice).toString();
};

PayU.prototype.login = function (merchantId, hashKey) {
  var id = merchantId || this.config.merchantPosId,
    key = hashKey || this.config.key,
    auth = this.requestData.auth;

  if (id && key) {
    auth.user = id.toString();
    auth.pass = key.toString();
    this.config.merchantPosId = id;
    if (this.config.key) delete this.config.key;
  }
};

function responseCallbackWrap(callback) {
  return function (error, response, body) {
    var res = {
      statusCode: response.statusCode
    };
    if (error) {
      callback(error);
    } else {
      res.body = body.indexOf('{') > -1
        ? JSON.parse(body)
        : body;

      res.statusCode == 302 || res.statusCode == 200
        ? callback(null, res)
        : callback(res);
    }
  }
}

function makeRequest(requestData, callback) {
  var hasAuthData = requestData.auth.user && requestData.auth.pass;
  if (requestData.body) requestData.body = JSON.stringify(requestData.body);
  if (hasAuthData) {
    request(requestData, responseCallbackWrap(callback))
  } else {
    callback({
      statusCode: 401,
      body: 'payu-pl requires merchantPosId and hashKey to make a request.'
    })
  }
}

PayU.prototype.createOrder = function (orderData, callback) {
  var requestData = {
    method: 'POST'
  };
  extend(requestData, this.requestData);
  extend(true, requestData.body = {}, this.config, orderData);
  makeRequest(requestData, callback);

};

PayU.prototype.getOrder = function (orderId, callback) {
  var requestData = {
    method: 'GET'
  };
  extend(requestData, this.requestData);
  requestData.uri += '/' + orderId;
  makeRequest(requestData, callback);
};

PayU.prototype.getTransaction = function (orderId, callback) {
  var requestData = {
    method: 'GET'
  };
  extend(requestData, this.requestData);
  requestData.uri += '/' + orderId + '/transactions';
  makeRequest(requestData, callback);
};

PayU.prototype.cancelOrder = function (orderId, callback) {
  var requestData = {
    method: 'DELETE'
  };
  extend(requestData, this.requestData);
  requestData.uri += '/' + orderId;
  makeRequest(requestData, callback);
};

module.exports = PayU;