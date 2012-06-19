var appendView = function(view) {
  Ember.run(function() { view.appendTo('#qunit-fixture'); });
};

var compile = function(template) {
  return Ember.Handlebars.compile(template);
};

var view;

module("Handlebars {{outlet}} helpers", {
  teardown: function() {
    Ember.run(function () {
      if (view) {
        view.destroy();
      }
    });
  }
});

test("outlet should allow controllers to fill in slots", function() {
  var controller = Ember.Object.create();

  var template = "<h1>HI</h1>{{outlet}}";
  view = Ember.View.create({
    controller: controller,
    template: Ember.Handlebars.compile(template)
  });

  appendView(view);

  equal(view.$().text(), 'HI');

  Ember.run(function() {
    controller.set('view', Ember.View.create({
      template: compile("<p>BYE</p>")
    }));
  });

  equal(view.$().text(), 'HIBYE');
});


test("outlet should support an optional name", function() {
  var controller = Ember.Object.create();

  var template = "<h1>HI</h1>{{outlet mainView}}";
  view = Ember.View.create({
    controller: controller,
    template: Ember.Handlebars.compile(template)
  });

  appendView(view);

  equal(view.$().text(), 'HI');

  Ember.run(function() {
    controller.set('mainView', Ember.View.create({
      template: compile("<p>BYE</p>")
    }));
  });

  equal(view.$().text(), 'HIBYE');
});


test('outlet should support an optional custom ContainerView. settings{ elementid: "custom-id", tagName: "section" }', function() {
  Ember.MyCustomContainerView = Ember.ContainerView.extend({
    elementid: "custom-id",
    tagName: "section"
  });
  
  var controller = Ember.Object.create();

  var template = "<h1>HI</h1>{{outlet mainView Ember.MyCustomContainerView}}";
  view = Ember.View.create({
    controller: controller,
    template: Ember.Handlebars.compile(template)
  });

  appendView(view);

  equal(view.$().text(), 'HI');

  Ember.run(function() {
    controller.set('mainView', Ember.View.create({
      template: compile("<p>BYE</p>")
    }));
  });

  equal(view.$().text(), 'HIBYE');
  
  equal(view.$("section#custom-id").text(), 'BYE', 'outlet with an elementId "custom-id" and tagName "section" has been successfully founded !');
});
