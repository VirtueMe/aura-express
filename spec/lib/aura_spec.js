define(['aura/aura'], function(aura) {

  'use strict';
  /*global describe:true, it:true, before: true, sinon: true */

  describe("Aura Apps", function() {
    describe("App Public API", function() {
    
      var env;
      var ext = {
        init: sinon.spy(function(appEnv) {
          env = appEnv;
          env.sandbox.foo = "bar";
        }),
        afterAppStart: sinon.spy()
      };

      var app = aura();
      
      app.use(ext);

      var startOptions = { foo: "bar" };
      var initStatus = app.start(startOptions);

      // Make sure the app is started before...
      before(function(done) {
        initStatus.then(function() { done(); });
      });

      it("Should have loaded its core dependencies", function() {
        env.core.data.deferred.should.be.a('function');
      });

      it("Should have a public API", function() {
        app.use.should.be.a('function');
        app.start.should.be.a('function');
        app.stop.should.be.a('function');
      });
        
      it("Should call init method on extension", function() {
        ext.init.should.have.been.calledWith(env);
      });
            
      it("Should call afterAppStart method on extension", function() {
        ext.afterAppStart.should.have.been.calledWith(env);
      });
      
      it("Should have extended the sandbox", function() {
        env.sandbox.foo.should.equal('bar');
      });

      it("Should complain if I try to use a new extension and the app is already started", function() {
        app.use.should.Throw(Error);
      });
    });

    describe("Defining and loading extensions", function() {

      it("Should be able to use extensions defined as objects", function(done) {
        var ext = { init: sinon.spy() };
        aura().use(ext).start({ widgets: [] }).done(function() {
          ext.init.should.have.been.called;
          done();
        });
      });

      it("Should be able to use extensions defined as functions", function(done) {
        var env;
        var insideExt = sinon.spy();
        var ext = sinon.spy(function(appEnv) {
          env = appEnv;
          insideExt('foo');
        });
        aura().use(ext).start().done(function() {
          ext.should.have.been.calledWith(env);
          insideExt.should.have.been.calledWith('foo');
          done();
        });
      });

      it("Should pass the start options to the extensions...", function(done) {
        var env;
        var startOptions = { foo: 'bar' };
        var insideExt = sinon.spy();
        var ext = sinon.spy(function(appEnv) {
          env = appEnv;
          insideExt(env.options);
        });
        aura().use(ext).start(startOptions).done(function() {
          ext.should.have.been.calledWith(env);
          insideExt.should.have.been.calledWith(startOptions);
          done();
        });
      });

      it("Should be able to use extensions defined as amd modules", function(done) {
        var ext = { init: sinon.spy() };
        define("myExtensionModule", ext);
        aura().use("myExtensionModule").start().done(function() {
          ext.init.should.have.been.called;
          done();
        });
      });
    });
  });
});
