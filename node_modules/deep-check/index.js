var objectPath = require('object-path')

function getObjectLevelMissing(data, obj, basepath){
  basepath = basepath || []
  return Object.keys(obj || {}).reduce(function(missing, key){
    var value = obj[key]
    var path = basepath.concat([key])
    if(typeof(value) == 'boolean'){
      return objectPath.has(data, path) ?
        missing :
        missing.concat([path])
    }
    else{
      return missing.concat(getObjectLevelMissing(data, value, path))
    }
  }, [])
}

function getObjectMissing(data, schema){
  var ret = getObjectLevelMissing(data, schema)
    return ret.map(function(path){
      return path.join('.')
    })
}

function getArrayMissing(data, schema){
  return schema.filter(function(path){
    return !objectPath.has(data, path)
  })
}

module.exports = function(data, schema){
  return schema.constructor === Array ?
    getArrayMissing(data, schema) :
    getObjectMissing(data, schema)
}