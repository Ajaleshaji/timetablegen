var tape = require('tape')
var deepCheck = require('./index')

var data = {
  fruit:{
    citrus:{
      lemons:10,
      oranges:12
    }
  },
  orders:{
    settings:{
      id:12
    }
  }
}

var objectSchema = {
  fruit:{
    citrus:{
      lemons:true,
      weight:true
    }
  },
  orders:{
    settings:true,
    history:true
  }
}

var arraySchema = [
  'fruit.citrus.lemons',
  'fruit.apples',
  'orders.settings',
  'orders.history'
]

tape('test object schema', function(t){
  t.deepEquals(deepCheck(data, objectSchema), [
    'fruit.citrus.weight',
    'orders.history'
  ], 'the missing object fields are correct')
  t.end()
})

tape('test array schema', function(t){
  t.deepEquals(deepCheck(data, arraySchema), [
    'fruit.apples',
    'orders.history'
  ], 'the missing array fields are correct')
  t.end()
})