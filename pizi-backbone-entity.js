/*jshint loopfunc: true */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['backbone'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('backbone'));
    } else {
        // Browser globals (root is window)
        root.Entity = factory(root.Backbone);
    }
}(this, function(Backbone){
	/**
	 * The Model
	 * @type {Backbone.Model}
	 */
	var Model = Backbone.Model.extend({
		dates : [],
		validate : function(attrs, options){
			var dates = _.pick(attrs, this.dates.concat(['date']));
			for(var date in dates){
				if(dates[date] && !(dates[date] instanceof Date)){
					return "date (" + date + ") is not valid!";
				}
			}
		},
		save: function(attrs, options) {
          options = _.extend(options, {parse: false});
          // Proxy the call to the original save function
          Backbone.Model.prototype.save.call(this, attrs, options);
        },
		toJSON : function(){
			var attributes = _.clone(this.attributes);
			for(var attribute in attributes){
				if(attributes.hasOwnProperty(attribute)){
					if(attributes[attribute] instanceof Backbone.Model){
						attributes[attribute] = attributes[attribute].id;
					} else if(attributes[attribute] instanceof Backbone.Collection){
						var ids = [];
						attributes[attribute].forEach(function(attr){
							ids.push(attr.id);
						});
						attributes[attribute] = ids;
					}
				}
			}
			return attributes;
		},
		parse : function(data, options){
			if(options.parse !== false){
				var that = this;
				_.each(this.relations, function(relation, key){
					if(relation.collection && data[key] && data[key] instanceof Array){
						_.each(data[key], function(id){
							var model = new relation.collection.prototype.model({id: id}, _.extend({validate: true}, options));
							model.fetch({
								success: function(){
									that.get(key).add(model, options);
								},
								error: function(){
									console.log('Model not found!');
								}
							});
						});
						delete data[key];
					}
				});
			}
			return data;
		},
		set : function(attributes, options){
			var opts = _.extend({validate: true}, options);
			var relations = _.keys(this.relations);
			_.each(attributes, function(value, key){
				if(_.contains(relations, key)){
					var definition = this.relations[key];
					if(definition.model && value instanceof Object){
						this.set(key, new definition.model(value, opts), opts);
						delete attributes[key];
					} else if(definition.collection && value instanceof Array){
						this.set(key, new definition.collection(value, opts), opts);
						delete attributes[key];
					} else if(definition.model && !(value instanceof definition.model) || definition.collection && !(value instanceof definition.collection)){
						console.log('Bad model definition: ' + this.get('className'));
						delete attributes[key];
					}
				}
			}, this);
			return Backbone.Model.prototype.set.apply(this, arguments);
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
		_.each(modelDefinition.relations, function(definition, key){
			if(definition.collection){
				defaultRelations[key] = new definition.collection();
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
	return {
		Model : Model,
		Collection : Collection
	};
}));