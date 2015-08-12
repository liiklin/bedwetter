// Load modules
var Lab = require('lab');
var Hoek = require('hoek');
var Path = require('path');
var Hapi = require('hapi')
var Memory = require('sails-memory');
var Async = require('async')
var ServerSetup = require('../server.setup.js');

// Test shortcuts
var lab = exports.lab = Lab.script();
var expect = Lab.expect;
var before = lab.before;
var after = lab.after;
var experiment = lab.experiment;
var test = lab.test;


experiment('Find bedwetter', function () {
    
    // This will be a Hapi server for each test.
    var server = new Hapi.Server();
    var errors = [];
    server.connection();

    // Setup Hapi server to register the plugin
    before(function(done){
        
        ServerSetup(server, {}, function(err) {
            
            if (err) done(err);
            
            server.route([
            { // find
                method: 'GET',
                path: '/treat',
                handler: {
                    bedwetter: {}
                }
            },
            { // find / jsonp
                method: 'GET',
                path: '/failures',
                handler: {
                    bedwetter: {}
                }
            }]);
            
            server.on('request-error', function (request, error) {
                errors.push({
                    request: request,
                    error: error
                });
            });

            done();
        });
    });
    
    test('finds.', function (done) {
        
        server.inject({
            method: 'GET',
            url: '/treat?sort=id ASC&skip=1&limit=3&where={"id":[1,2]}'
        }, function(res) {
            
            expect(res.statusCode).to.equal(200);
            expect(res.result).to.be.an.array;
            
            // Make sure the bedwetter sets request state
            var RequestState = res.request.plugins.bedwetter;
            expect(RequestState).to.be.an.object;
            expect(RequestState).to.have.keys(['action', 'options']);
            expect(RequestState.action).to.equal('find');
            expect(RequestState.options).to.be.an.object;
            //console.log(res.statusCode, res.result);
            
            done();
        })
        
    });

    test('wraps Waterline errors.', function (done) {

        server.inject({
            method: 'GET',
            url: '/failures'
        }, function(res) {

            expect(res.statusCode).to.equal(500);
            expect(res.result.message).to.equal('An internal server error occurred');

            expect(errors).to.have.length(1);
            expect(errors[0].request).to.equal(res.request);
            expect(errors[0].error.message).to.contain('Adapter find error.');

            done();
        })
        
    });

    after(function(done) {
        Memory.teardown(done);
    });
    
});


