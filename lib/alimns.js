/**
 * Dependencies
 */

var assert = require('assert'),
    _ = require('lodash'),
    Q = require('q');
var AliMNS = require("ali-mns");

var utf8 = require('utf8');
/**
 * Export the connector class
 */

module.exports = AlimnsConnector;

/**
 * Configure and create an instance of the connector
 */

function AlimnsConnector(settings) {
    assert(typeof settings === 'object', 'cannot init connector without settings');
    this.account = new AliMNS.Account(settings.apiUser, settings.apiKey, settings.apiKeySecret);
}

AlimnsConnector.initialize = function(dataSource, callback) {

    dataSource.connector = new AlimnsConnector(dataSource.settings);
    if (callback) {
        callback();
    }
};

AlimnsConnector.prototype.DataAccessObject = Mailer;

function Mailer() {

}


/**
 * Send transactional email with options
 *
 * Basic options:
 *
 * {
 *   from: '签名',
 *   to: {"手机号": {"变量名": "value"}},
 *   subject: "主题",
 * }
 *
 * @param {Object} options
 * @param {Function} callback
 */
function unicode16(str) {
    var value = '';
    for (var i = 0; i < str.length; i++)
        value += '\\u' + parseInt(str.charCodeAt(i)).toString(16);
    return value;
}

function encodeUnicode16(s) {
    return escape(s).replace(/%(u[0-9A-F]{4})|(%[0-9A-F]{2})/gm, function($0, $1, $2) {
        return $1 && '\\' + $1.toLowerCase() || unescape($2);
    });
}

function decodeUnicode16(s) {
    return unescape(s.replace(/\\(u[0-9a-fA-F]{4})/gm, '%$1'));
}
Mailer.send = function(options, cb) {
    var dataSource = this.dataSource,
        settings = dataSource && dataSource.settings,
        connector = dataSource.connector,
        deferred = Q.defer();

    if (options.__data) {
        options = _.clone(options.__data);
    } else {
        options = _.clone(options);
    }

    var fn = function(err, result) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(result);
        }
        cb && cb(err, result);
    };

    assert(connector, 'Cannot send sms without a connector!');

    if (connector.account) {
        var Buffer = require('buffer');
        var topic = new AliMNS.Topic(options.subject, connector.account, 'hangzhou');
        var sms = {
            FreeSignName: options.from,
            TemplateCode: options.template,
            Type: 'multiContent',
            SmsParams: JSON.stringify((_.isObject(options.to) ? options.to : {}))
        };
        topic.publishP('smsmessage', false, null, {
                DirectSMS: encodeUnicode16(JSON.stringify(sms))
            })
            .then(function(data) {
                console.log('success', data);
                fn(null, data);
                return data;
            }, function(error) {
                console.log('error', error);
                fn(error, null);
                return error;
            });

    } else {
        console.warn('Warning: no connection with ali-mns');
        process.nextTick(function() {
            fn(null, options);
        });
    }

    return deferred.promise;
};

/**
 * Send an email instance using instance
 */

Mailer.prototype.send = function(fn) {
    return this.constructor.send(this, fn);
};