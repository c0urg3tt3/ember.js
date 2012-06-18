module("router.urlForEvent");

var namespace = {
  "Component": {
    toString: function() { return "Component"; },
    find: function() { return { id: 1 }; }
  }
};

var location = {
  formatURL: function(url) {
    return '#!#' + url;
  },

  setURL: function(url) {
    this.url = url;
  }
};

var getPath = Ember.getPath;

test("router.urlForEvent looks in the current state's eventTransitions hash", function() {
  var router = Ember.Router.create({
    location: location,
    namespace: namespace,
    root: Ember.Route.create({
      index: Ember.Route.create({
        route: '/',

        showDashboard: function(router) {
          router.transitionTo('dashboard');
        },

        eventTransitions: {
          showDashboard: 'dashboard'
        }
      }),

      dashboard: Ember.Route.create({
        route: '/dashboard'
      })
    })
  });

  Ember.run(function() {
    router.route('/');
  });

  equal(router.getPath('currentState.path'), "root.index", "precond - the router is in root.index");

  var url = router.urlForEvent('showDashboard');
  equal(url, "#!#/dashboard");
});

test("router.urlForEvent looks in the eventTransitions hashes of the current state's ancestors", function() {
  var router = Ember.Router.create({
    location: location,
    namespace: namespace,
    root: Ember.Route.create({
      eventTransitions: {
        showDashboard: 'dashboard'
      },

      index: Ember.Route.create({
        route: '/'
      }),

      dashboard: Ember.Route.create({
        route: '/dashboard'
      })
    })
  });

  Ember.run(function() {
    router.route('/');
  });

  equal(router.getPath('currentState.path'), "root.index", "precond - the router is in root.index");

  var url = router.urlForEvent('showDashboard');
  equal(url, "#!#/dashboard");
});

test("router.urlForEvent works with a context", function() {
  var router = Ember.Router.create({
    location: location,
    namespace: namespace,
    root: Ember.Route.create({
      index: Ember.Route.create({
        route: '/',

        showDashboard: function(router) {
          router.transitionTo('dashboard');
        },

        eventTransitions: {
          showDashboard: 'dashboard'
        }
      }),

      dashboard: Ember.Route.create({
        route: '/dashboard/:component_id'
      })
    })
  });

  Ember.run(function() {
    router.route('/');
  });

  equal(router.getPath('currentState.path'), "root.index", "precond - the router is in root.index");

  var url = router.urlForEvent('showDashboard', { id: 1 });
  equal(url, "#!#/dashboard/1");
});

test("router.urlForEvent works with changing context in the current state", function() {
  var router = Ember.Router.create({
    location: location,
    namespace: namespace,
    root: Ember.Route.create({
      index: Ember.Route.create({
        route: '/'
      }),

      showDashboard: function(router) {
        router.transitionTo('dashboard');
      },

      eventTransitions: {
        showDashboard: 'dashboard'
      },

      dashboard: Ember.Route.create({
        route: '/dashboard/:component_id'
      })
    })
  });

  Ember.run(function() {
    router.route('/dashboard/1');
  });

  equal(router.getPath('currentState.path'), "root.dashboard", "precond - the router is in root.dashboard");

  var url = router.urlForEvent('showDashboard', { id: 2 });
  equal(url, "#!#/dashboard/2");
});


test("router.urlForEvent works with Ember.State.transitionTo", function() {
  var router = Ember.Router.create({
    location: location,
    namespace: namespace,
    root: Ember.Route.create({
      index: Ember.Route.create({
        route: '/',

        showDashboard: Ember.Route.transitionTo('dashboard')
      }),

      dashboard: Ember.Route.create({
        route: '/dashboard/:component_id'
      })
    })
  });

  Ember.run(function() {
    router.route('/');
  });

  equal(router.getPath('currentState.path'), "root.index", "precond - the router is in root.index");

  var url = router.urlForEvent('showDashboard', { id: 1 });
  equal(url, "#!#/dashboard/1");
});

test("rerouting doesn't exit all the way out", function() {
  var exited = 0;

  var router = Ember.Router.create({
    location: location,
    namespace: namespace,
    root: Ember.Route.create({
      index: Ember.Route.create({
        route: '/',
        showDashboard: Ember.Route.transitionTo('dashboard.index')
      }),

      dashboard: Ember.Route.create({
        route: '/dashboard',

        exit: function() {
          exited++;
        },

        index: Ember.Route.create({
          route: '/',
          showComponent: Ember.Route.transitionTo('component')
        }),

        component: Ember.Route.create({
          route: '/:component_id',
          showIndex: Ember.Route.transitionTo('index')
        })
      })
    })
  });

  Ember.run(function() {
    router.route('/');
  });

  equal(router.getPath('currentState.path'), "root.index", "precond - the router is in root.index");

  Ember.run(function() {
    router.send('showDashboard');
  });

  equal(router.getPath('currentState.path'), "root.dashboard.index", "precond - the router is in root.dashboard.index");
  equal(exited, 0, "the dashboard hasn't been exited yet");

  Ember.run(function() {
    router.send('showComponent', { id: 1 });
  });

  equal(router.getPath('currentState.path'), "root.dashboard.component", "precond - the router is in root.index");
  equal(exited, 0, "moving around shouldn't gratuitously exit states");

  Ember.run(function() {
    router.route('/dashboard');
  });

  equal(router.getPath('currentState.path'), "root.dashboard.index", "the router is in root.dashboard.index");
  equal(exited, 0, "moving around shouldn't gratuitously exit states");

  Ember.run(function() {
    router.route('/');
  });

  equal(router.getPath('currentState.path'), "root.index", "the router is in root.dashboard.index");
  equal(exited, 1, "now, the exit was called");

  Ember.run(function() {
    router.route('/dashboard/1');
  });

  exited = 0;
  equal(router.getPath('currentState.path'), "root.dashboard.component", "the router is in root.dashboard.index");
  equal(exited, 0, "exit wasn't called now");
});

test("should be able to unroute out of a state with context", function() {
  var router = Ember.Router.create({
    location: location,
    namespace: namespace,
    root: Ember.Route.create({
      components: Ember.Route.create({
        route: '/components',

        show: Ember.Route.create({
          route: '/:component_id',

          index: Ember.Route.create({
            route: '/'
          }),

          edit: Ember.Route.create({
            route: '/edit'
          })
        })
      })
    })
  });

  router.route('/components/1/edit');
  equal(getPath(router, 'currentState.path'), 'root.components.show.edit', "should go to the correct state");

  router.route('/components/1');
  equal(getPath(router, 'currentState.path'), 'root.components.show.index', "should go to the correct state");
});

test("should update route for redirections", function() {
  var router = Ember.Router.create({
    location: location,
    namespace: namespace,
    root: Ember.Route.create({
      index: Ember.Route.create({
        route: '/',
        redirectsTo: 'login'
      }),

      login: Ember.Route.create({
        route: '/login'
      })
    })
  });

  router.route('/');

  equal(location.url, '/login');
});
