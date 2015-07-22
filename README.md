# pizi-backbone-entity
Extend Backbone.Model to deal with relations between other models

## Attributes
### relations [object]

Object defining relations with other Entities. Set a collection or model constructor.

_Exemple:_

	var TransactionCollection = Entity.Collection.extend({
	  model : TransactionModel
	});

	Entity.Model.extend({
	  relations : {
	    transactions : {  // name of the attribute
	      collection: TransactionCollection  // collection's constructor
	    }
	  }
	});

### dates [array]

Array containg the name of Date type attributes. Used to correctly set Date type when loading model from storage.

## Functions

### toJSON()

Return the attributes property of the model, replacing relations with the model(s) id(s).

_Exemple:_

	var TransactionCollection = Entity.Collection.extend({
	  model : TransactionModel
	});

	var UserModel = Entity.Model.extend({
	  relations : {
	    transactions : {
	      collection: TransactionCollection
	    }
	  }
	});

	var user = new UserModel();
	user.set('transactions', [{id: 1, amount: 34, date: "22/10/2014"}, {id: 2, amount: 125, date: "28/11/2014"}]);

	console.log(user.toJSON()); 

	/* Console output
	{
	   transactions : [1, 2]
	}
	*/

### set(attributes, options)

Override the default set function to allow passing, object or array, to instanciate relations entities directly. The relations have to be defined int the relations attribute.

_Exemple:_

	var TransactionCollection = Entity.Collection.extend({
	  model : TransactionModel
	});

	var UserModel = Entity.Model.extend({
	  relations : {
	    transactions : {
	      collection: TransactionCollection
	    }
	  }
	});

	var user = new UserModel();
	user.set('transactions', [{amount: 34, date: "22/10/2014"}, {amount: 125, date: "28/11/2014"}]);

	user.get('transactions') instanceof TransactionCollection;

	/* Console output
	true
	*/

parse(data, options)
validate(attrs, options)
