(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(["exports", "module", "backbone"], factory);
	} else if (typeof exports !== "undefined" && typeof module !== "undefined") {
		factory(exports, module, require("backbone"));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, mod, global.Backbone);
		global.piziBackboneEntity = mod.exports;
	}
})(this, function (exports, module, _backbone) {
	/*jshint loopfunc: true */

	"use strict";

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _Backbone = _interopRequireDefault(_backbone);

	var Model = _Backbone["default"].Model.extend({
		dates: [],
		validate: function validate(attrs, options) {
			var dates = _.pick(attrs, this.dates.concat(['date']));
			for (var date in dates) {
				if (dates[date] && !(dates[date] instanceof Date)) {
					return date;
				}
			}
		},
		save: function save(attrs) {
			var _this = this;

			var options = arguments.length <= 1 || arguments[1] === undefined ? { parse: false } : arguments[1];

			if (options.all) {
				var success = options.success;
				options.success = function (model, resp, opts) {
					_.each(_this.relations, function (relation, key) {
						if (relation.collection && model.get(key) instanceof relation.collection) {
							_.each(model.get(key).models, function (model) {
								model.save(null, { all: options.all });
							});
						}
					});
					if (success) success.call(_this, model, resp, options);
				};
			}
			// Proxy the call to the original save function
			_Backbone["default"].Model.prototype.save.call(this, attrs, options);
		},
		fetch: function fetch() {
			var _this2 = this;

			var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			if (options.all) {
				var success = options.success;
				options.success = function (model, resp, opts) {
					_.each(_this2.relations, function (relation, key) {
						if (relation.collection && model.get(key) instanceof relation.collection) {
							_.each(model.get(key).models, function (model) {
								model.fetch({ all: options.all });
							});
						}
					});
					if (success) success.call(_this2, model, resp, options);
				};
			}
			_Backbone["default"].Model.prototype.fetch.call(this, options);
		},
		toJSON: function toJSON() {
			var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			var attributes = _.clone(this.attributes);
			for (var attribute in attributes) {
				if (attributes.hasOwnProperty(attribute)) {
					if (attributes[attribute] instanceof _Backbone["default"].Model) {
						attributes[attribute] = options.all ? _.pick(attributes[attribute], "id") : attributes[attribute].toJSON(options);
					} else if (attributes[attribute] instanceof _Backbone["default"].Collection) {
						var converted = [];
						attributes[attribute].forEach(function (attr) {
							return converted.push(options.all ? _.pick(attr, 'id') : attr.toJSON(options));
						});
						attributes[attribute] = converted;
					}
				}
			}
			return attributes;
		},
		set: function set(key, val, options) {
			var _this3 = this;

			if (key === null) return this;
			var attributes;
			if (typeof key === 'object') {
				attributes = key;
				options = val;
			} else {
				(attributes = {})[key] = val;
			}
			var opts = _.extend({ validate: true }, options);
			var relations = _.keys(this.relations);
			_.each(attributes, function (value, key) {
				if (_.contains(relations, key)) {
					var definition = _this3.relations[key];
					if (definition.model && value instanceof Object) {
						_this3.set(key, new definition.model(value, opts), opts);
						delete attributes[key];
					} else if (definition.collection && value instanceof Array) {
						// Check if array is a real array (key = number), if it is it must be id's array
						_this3.get(key).set(new definition.collection(value, opts));
						delete attributes[key];
					} else if (definition.model && !(value instanceof definition.model) || definition.collection && !(value instanceof definition.collection)) {
						console.log('Bad model definition: ' + _this3.get('className'));
						delete attributes[key];
					}
				}
			}, this);
			return _Backbone["default"].Model.prototype.set.apply(this, [attributes, options]);
		}
	});

	/**
 	* Extend the Backbone.Model.extend method, to add some treatement on instance creation
 	* @param  {Object} modelDefinition
 	* @return {function} the model constructor
 	*/
	Model.extend = function (modelDefinition) {
		// Set defaults collections for relations
		var defaultRelations = {};
		_.each(modelDefinition.relations, function (definition, key) {
			if (definition.collection && modelDefinition.defaults[key] instanceof Array) {
				defaultRelations[key] = new definition.collection(modelDefinition.defaults[key]);
			}
		});
		_.extend(modelDefinition.defaults, defaultRelations);
		return _Backbone["default"].Model.extend.call(this, modelDefinition);
	};

	/**
 	* The Collection
 	* @type {Backbone.Collection}
 	*/
	var Collection = _Backbone["default"].Collection.extend({
		/* Used to instanciate a new Model from Json (need to override if subtypes)*/
		model: Model
	});

	/**
 	* Exporting the Model and the Collection
 	*/
	module.exports = {
		Model: Model,
		Collection: Collection
	};
});
