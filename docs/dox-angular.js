
angular.module('components', []).
  directive('dox', function() {
    return {
      restrict: 'E',
      transclude: true,
      scope: {path:'@srcPath'},
      controller: function($scope, $element, $attrs){
      	doxControl($scope, $element, $attrs);
      },
      template:
        '<div class="documenation" class="row-fluid">'+
        	'<nav class="affix nav-list span2">'+
				'<ul class="unstyled">'+
					'<fnav ng-repeat="thing in obj.jsDoc.functions"></fnav>'+
					'<dnav ng-repeat="thing in obj.jsDoc.declaration"></dnav>'+
				'</ul>'+
			'</nav>'+
        	'<article class="span10 pull-right">'+
        		'<function ng-repeat="thing in obj.jsDoc.functions"></function>'+
        		'<declaration ng-repeat="thing in obj.jsDoc.declarations"></declaration>'+
        	'</article>'+
        '</div>',
      replace: true
    };
  }).
  directive('function', function(){
  	return{
  		require: '^dox',
  		restrict: 'E',
  		transclude: true,
  		scope: true,
  		template:
	        '<section id="{{thing.ctx.name}}" class="function">'+
				'<header class="name"><span><h3 style="display:inline">{{thing.ctx.name}}</h3> : <code data-language="javascript">{{thing.ctx.string}}</code></span></header>'+
				'<section class="description" ng-bind-html-unsafe="thing.description.full"></section>'+
				'<section class="code">'+
					'<pre><code data-language="javascript" ng-bind-html-unsafe="thing.code"></code></pre>'+
				'</section>'+
				'<method ng-repeat="method in thing.prototypeMethods"></method>'+
				'<property ng-repeat="property in thing.prototypeProperties"></property>'+
				'<method ng-repeat="method in thing.methods"></method>'+
				'<property ng-repeat="property in thing.properties"></property>'+
				
			'</section>',
      	replace: true
  	};
  }).
  directive('fnav', function(){
  	return{
  		require: '^dox',
  		restrict: 'E',
  		transclude: true,
  		scope: true,
  		template:
	        '<li>'+
				'<a href="#{{thing.ctx.name}}">{{thing.ctx.name}}</a>'+
				'<ul>'+
					'<pmnav ng-repeat="method in thing.prototypeMethods"></pmnav>'+
					'<mnav ng-repeat="method in thing.methods"></pmnav>'+
					'<ppnav ng-repeat="method in thing.prototypeProperties"></pmnav>'+
					'<pnav ng-repeat="method in thing.properties"></pmnav>'+
				'</ul>'+
			'</li>',
      	replace: true
  	};
  }).
  directive('pmnav', function(){
  	return{
  		require: '^dox',
  		restrict: 'E',
  		transclude: true,
  		scope: true,
  		template:
	        '<li>'+
				'<a href="#{{method.ctx.name}}">{{method.ctx.name}}</a>'+
			'</li>',
      	replace: true
  	};
  }).
  directive('mnav', function(){
  	return{
  		require: '^dox',
  		restrict: 'E',
  		transclude: true,
  		scope: true,
  		template:
	        '<li>'+
				'<a href="#{{method.ctx.name}}">{{method.ctx.name}}</a>'+
			'</li>',
      	replace: true
  	};
  }).
  directive('ppnav', function(){
  	return{
  		require: '^dox',
  		restrict: 'E',
  		transclude: true,
  		scope: true,
  		template:
	        '<li>'+
				'<a href="#{{property.ctx.name}}">{{property.ctx.name}}</a>'+
			'</li>',
      	replace: true
  	};
  }).
  directive('pnav', function(){
  	return{
  		require: '^dox',
  		restrict: 'E',
  		transclude: true,
  		scope: true,
  		template:
	        '<li>'+
				'<a href="#{{property.ctx.name}}">{{property.ctx.name}}</a>'+
			'</li>',
      	replace: true
  	};
  }).
  directive('declaration', function(){
  	return{
  		require: '^dox',
  		restrict: 'E',
  		transclude: true,
  		scope: true,
  		template:
	        '<section id="{{thing.ctx.name}}" class="declaration">'+
				'<header class="name"><span><h3 style="display:inline">{{thing.ctx.name}}</h3> : <code data-language="javascript">{{thing.ctx.string}}</code></span></header>'+
				'<section class="description" ng-bind-html-unsafe="thing.description.full"></section>'+
				'<section class="code">'+
					'<pre><code data-language="javascript" ng-bind-html-unsafe="thing.code"></code></pre>'+
				'</section>'+
				'<method ng-repeat="method in thing.prototypeMethods"></method>'+
				'<property ng-repeat="property in thing.prototypeProperties"></property>'+
				'<method ng-repeat="method in thing.methods"></method>'+
				'<property ng-repeat="property in thing.properties"></property>'+
				
			'</section>',
      	replace: true
  	};
  }).
  directive('dnav', function(){
  	return{
  		require: '^dox',
  		restrict: 'E',
  		transclude: true,
  		scope: true,
  		template:
	        '<li>'+
				'<a href="#{{thing.ctx.name}}">{{thing.ctx.name}}</a>'+
				'<ul>'+
					'<pmnav ng-repeat="method in thing.prototypeMethods"></pmnav>'+
					'<mnav ng-repeat="method in thing.methods"></pmnav>'+
					'<ppnav ng-repeat="method in thing.prototypeProperties"></pmnav>'+
					'<pnav ng-repeat="method in thing.properties"></pmnav>'+
				'</ul>'+
			'</li>',
      	replace: true
  	};
  }).
  directive('method', function(){
  	return{
  		require: '^dox',
  		restrict: 'E',
  		transclude: true,
  		scope: true,
  		template:
	        '<section id="{{method.ctx.name}}" class="prototype method" >'+
				'<header class="name"><span><h3 style="display:inline">{{method.ctx.name}}</h3> : <code data-language="javascript">{{method.ctx.string}}</code></span></header>'+
				'<section class="description" ng-bind-html-unsafe="method.description.full"></section>'+
				'<section class="code">'+
					'<pre><code data-language="javascript" ng-bind-html-unsafe="method.code"></code></pre>'+
				'</section>'+
			'</section>',
      	replace: true
  	};
  }).
  directive('property', function(){
  	return{
  		require: '^dox',
  		restrict: 'E',
  		transclude: true,
  		scope: true,
  		template:
	        '<section id="{{property.ctx.name}}" class="prototype property" >'+
				'<header class="name"><span><h3 style="display:inline">{{property.ctx.name}}</h3> : <code data-language="javascript">{{property.ctx.string}}</code></span></header>'+
				'<section class="description" ng-bind-html-unsafe="property.description.full"></section>'+
				'<section class="code">'+
					'<pre><code data-language="javascript" ng-bind-html-unsafe="property.code"></code></pre>'+
				'</section>'+
			'</section>',
      	replace: true
  	};
  }).
  directive('tabs', function() {
    return {
      restrict: 'E',
      transclude: true,
      scope: {},
      controller: function($scope, $element) {
        var panes = $scope.panes = [];
 
        $scope.select = function(pane) {
          angular.forEach(panes, function(pane) {
            pane.selected = false;
          });
          pane.selected = true;
        }
 
        this.addPane = function(pane) {
          if (panes.length == 0) $scope.select(pane);
          panes.push(pane);
        }
      },
      template:
        '<div class="tabbable">' +
          '<ul class="nav nav-tabs">' +
            '<li ng-repeat="pane in panes" ng-class="{active:pane.selected}">'+
              '<a href="" ng-click="select(pane)">{{pane.title}}</a>' +
            '</li>' +
          '</ul>' +
          '<div class="tab-content" ng-transclude></div>' +
        '</div>',
      replace: true
    };
  }).
  directive('pane', function() {
    return {
      require: '^tabs',
      restrict: 'E',
      transclude: true,
      scope: { title: '@' },
      link: function(scope, element, attrs, tabsCtrl) {
        tabsCtrl.addPane(scope);
      },
      template:
        '<div class="tab-pane" ng-class="{active: selected}" ng-transclude>' +
        '</div>',
      replace: true
    };
  })

function doxControl($scope, $element, $attrs){
	//should be able to use $scope.path but whatever
	var xhr = new XMLHttpRequest();
	xhr.open('GET', $attrs.srcPath, true);
	$scope.obj = {}
	xhr.onload = function(e) {
		if (this.status == 200) {
		  var result = dox.parseComments(this.response);
		  console.log(result);
		  var testResult = _.groupBy(result, function(thing){
		  	if(thing.ctx !== undefined) {
		  		return thing.ctx.type;
		  	} else {
		  		return 'code';
		  	}
		  });

		  console.log(testResult);

		  var functions = {};
		  _.each(testResult.function, function(fn){
		  	functions[fn.ctx.name] = fn;
		  });

		  _.each(functions, function(fn){
		  	fn.prototypeMethods = _.filter(testResult.method, function(met){return met.ctx.cons == fn.ctx.name});
		  	fn.prototypeProperty = _.filter(testResult.property, function(met){return met.ctx.cons == fn.ctx.name});
		  	fn.methods = _.filter(testResult.method, function(met){return met.ctx.receiver == fn.ctx.name});
		  	fn.properties = _.filter(testResult.property, function(met){return met.ctx.receiver == fn.ctx.name});
		  });

		  testResult.functions = functions;

		  var declarations = {};
		  _.each(testResult.declaration, function(dec){
		  	declarations[dec.ctx.name] = dec;
		  });

		  _.each(declarations, function(dec){
		  	dec.prototypeMethods = _.filter(testResult.method, function(met){return met.ctx.cons == dec.ctx.name});
		  	dec.prototypeProperty = _.filter(testResult.property, function(met){return met.ctx.cons == dec.ctx.name});
		  	dec.methods = _.filter(testResult.method, function(met){return met.ctx.receiver == dec.ctx.name});
		  	dec.properties = _.filter(testResult.property, function(met){return met.ctx.receiver == dec.ctx.name});
		  });

		  testResult.declarations = declarations;

		  var docs = {raw: result, jsDoc: testResult};

		  console.log(docs.jsDoc.functions);
		  //console.log(JSON.stringify(result, null, 2));
		  $scope.$apply(function(){
	          $scope.obj = docs;

	          setTimeout(function(){Rainbow.color();}, 1000);
	      });


		  //console.log($scope.obj);
		}
	};

    $scope.notReserved = function(item){
        return item.type != 'param' && item.type != 'return';
    }

    $scope.hasParams = function(item){
    	for(var i in item.tags){
    		if(item.tags[i].type == 'param'){
    			return true;
    		}
    	}
    	return false;
    }

    $scope.doesReturn = function(item){
    	for(var i in item.tags){
    		if(item.tags[i].type == 'return'){
    			return true;
    		}
    	}
    	return false;
    }

	xhr.send();
}