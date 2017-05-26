require('./helpers/init.js');
var juggler = require('loopback-datasource-juggler');

var rewire = require("rewire"),
    Connector = rewire('../lib/alimns'),
    DataSource = juggler.DataSource,
    ModelBuilder = juggler.ModelBuilder,
    SMS, ds;



describe('ali-mns init', function() {
    it('should throw error ', function() {
        expect(function() { new Connector(); }).to.throw();
    });

    it('should have property ali-mns with api key', function() {
        var apiUser = 'userid',
            apiKey = 'keyid',
            apiKeySecret = 'key';
        connector = new Connector({ apiUser: apiUser, apiKey: apiKey, apiKeySecret: apiKeySecret });

        expect(connector).have.a.property('account');
    });
});

describe('ali-mns message send', function() {

    beforeEach(function() {
        ds = new DataSource({
            connector: Connector,
            apiUser: 'userid',
            apiKey: 'keyid',
            apiKeySecret: 'key'
        });

        var modelBuilder = new ModelBuilder();
        SMS = modelBuilder.define('SMS');
        SMS.attachTo(ds);
    });

    it('Should send - SMS.send', function(done) {
        var msg = {
            from: '签名',
            to: { 'mobilephone': {} },
            subject: 'sms.topic-cn-hangzhou',
            template: 'SMS_xxxx'
        };

        SMS.send(msg, function(err, result) {
            expect(err).result.equal(false);
            // expect(result).result.equal(null);
            done();
        });
    });

    it('Should send - SMS.prototype.send', function(done) {
        var msg = {
            from: '签名',
            subject: 'sms.topic-cn-hangzhou',
            template: 'SMS_xxxx',
            to: {
                'mobilephone1': { code: 'xxx' },
                'mobilephone2': { code: 'xxx' }
            }
        };

        var sms = new SMS(msg);

        sms.send(function(err, result) {
            expect(err).equal(null);
            done();
        });
    });



});