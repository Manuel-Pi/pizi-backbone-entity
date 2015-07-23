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

### dates [Array]

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

### parse(data, options)

If options.parse is not set to false, parse the attributes specified in the relations attribute. Use id's to fetch each relations using the corresponding constructor.

_Exemple:_

	var UserModel = Entity.Model.extend({
	  relations : {
	    transactions : {
	      collection: TransactionCollection
	    }
	  }
	});


### validate(attrs, options)

Override Backbone.Model.validate .
Check if the all the Date properties of the object declared in the dates Array, are valid dates. Used during the parse function. Return the name of the first date that is not valid else return nothing.

_Exemple:_

	var UserModel = Entity.Model.extend({
	  dates : ['creation', 'lastUpdate']
	  }
	});

	var user = new UserModel(); 
	user.set({date: new Date(), creation: new Date(), lastUpdate: 'notaDate'});

	/*The 'date' attribute will be automaticly checked, no need to add it to the dates Array

	user.validate();

	 /* Console output
	 'lastUpdate'
	 */