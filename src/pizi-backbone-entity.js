/*jshint loopfunc: true */

import Backbone from "backbone";

var Model = Backbone.Model.extend({
	dates : [],
	validate(attrs, options){
		var dates = _.pick(attrs, this.dates.concat(['date']));
		for(var date in dates){
			if(dates[date] && !(dates[date] instanceof Date)){
				return date;
			}
		}
	},
	save(attrs, options = {parse: false}) {
		if(options.all){
			var success = options.success;
			options.success = (model, resp, opts) => {
				_.each(this.relations, (relation, key) => {
					if(relation.collection && model.get(key) instanceof relation.collection){
						_.each(model.get(key).models, (model) => {
							model.save(null, {all: options.all});
						});
					}
				});
				if (success) success.call(this, model, resp, options);
			};
		}
		// Proxy the call to the original save function
		Backbone.Model.prototype.save.call(this, attrs, options);
	},
	fetch(options = {}){
		if(options.all){
			var success = options.success;
			options.success = (model, resp, opts) => {
				_.each(this.relations, (relation, key) => {
					if(relation.collection && model.get(key) instanceof relation.collection){
						_.each(model.get(key).models, (model) => {
							model.fetch({all: options.all});
						});
					}
				});
				if (success) success.call(this, model, resp, options);
			};	
		}
		Backbone.Model.prototype.fetch.call(this, options);
	},
	toJSON(options = {}){
		var attributes = _.clone(this.attributes);
		for(var attribute in attributes){
			if(attributes.hasOwnProperty(attribute)){
				if(attributes[attribute] instanceof Backbone.Model){
					attributes[attribute] = options.all ? _.pick(attributes[attribute], "id") : attributes[attribute].toJSON(options);
				} else if(attributes[attribute] instanceof Backbone.Collection){
					var converted = [];
					attributes[attribute].forEach(attr => converted.push(options.all ? _.pick(attr, 'id') : attr.toJSON(options)));
					attributes[attribute] = converted;
				}
			}
		}
		return attributes;
	},
	set : function(key, val, options){
		if (key === null) return this;
		var attributes;
		if (typeof key === 'object') {
			attributes = key;
			options = val;
		} else {
			(attributes = {})[key] = val;
		}
		var opts = _.extend({validate: true}, options);
		var relations = _.keys(this.relations);
		_.each(attributes, (value, key) => {
			if(_.contains(relations, key)){
				var definition = this.relations[key];
				if(definition.model && value instanceof Object){
					this.set(key, new definition.model(value, opts), opts);
					delete attributes[key];
				} else if(definition.collection && value instanceof Array){
					// Check if array is a real array (key = number), if it is it must be id's array
					this.get(key).set(new definition.collection(value, opts));
					delete attributes[key];
				} else if(definition.model && !(value instanceof definition.model) || definition.collection && !(value instanceof definition.collection)){
					console.log('Bad model definition: ' + this.get('className'));
					delete attributes[key];
				}
			}
		}, this);
		return Backbone.Model.prototype.set.apply(this, [attributes, options]);
	}
});

/**
	* Extend the Backbone.Model.extend method, to add some treatement on instance creation
	* @param  {Object} modelDefinition
	* @return {function} the model constructor
	*/
Model.extend = function(modelDefinition){
	// Set defaults collections for relations
	var defaultRelations = {};
	_.each(modelDefinition.relations, (definition, key) => {
		if(definition.collection && modelDefinition.defaults[key] instanceof Array){
			defaultRelations[key] = new definition.collection(modelDefinition.defaults[key]);
		} else if(definition.collection && !(modelDefinition.defaults[key] instanceof Array)){
			console.log("Bad default value for " + key);
		}
	});
	_.extend(modelDefinition.defaults, defaultRelations);
	return Backbone.Model.extend.call(this, modelDefinition);
};

/**
	* The Collection
	* @type {Backbone.Collection}
	*/
var Collection = Backbone.Collection.extend({
	/* Used to instanciate a new Model from Json (need to override if subtypes)*/
	model : Model
});

/**
	* Exporting the Model and the Collection
	*/
export default{
	Model : Model,
	Collection : Collection
};