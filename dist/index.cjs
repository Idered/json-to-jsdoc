'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function checkIfNeededToAddUndefinedType(obj, objectKey) {
  const temporaryObject = {};
  let maxLenghtOfObject = 0;
  Object.keys(obj).forEach((currentKey) => {
    if (currentKey.includes(objectKey) && currentKey !== objectKey) {
      temporaryObject[currentKey] = obj[currentKey];
    }
  });
  Object.keys(temporaryObject).forEach((key) => {
    const currentKeyLength = temporaryObject[key].length;
    if (currentKeyLength > maxLenghtOfObject)
      maxLenghtOfObject = currentKeyLength;
  });
  Object.keys(temporaryObject).forEach((key) => {
    if (key.split(".").length < 2) {
      if (maxLenghtOfObject > temporaryObject[key].length) {
        this[key].push("undefined");
      }
    }
  });
}
function keepUniqueTypes(obj, jsonObjects) {
  const temporaryObject = obj;
  const remainingObject = {};
  const numberOfJSONDefinitions = jsonObjects.length;
  Object.keys(obj).forEach((objectKey) => {
    if (!objectKey.includes(".")) {
      if (obj[objectKey].length < numberOfJSONDefinitions) {
        temporaryObject[objectKey].push("undefined");
      }
    }
    obj[objectKey].forEach((anyValue) => {
      if (anyValue === "object" || anyValue === "object[]") {
        checkIfNeededToAddUndefinedType.bind(temporaryObject, obj, objectKey)();
      }
    });
  });
  Object.keys(temporaryObject).forEach((key) => {
    remainingObject[key] = getUnique(temporaryObject[key]);
  });
  return remainingObject;
}
function getUnique(array) {
  const u = {};
  const a = [];
  for (let i = 0, l = array.length; i < l; ++i) {
    if (u.hasOwnProperty(array[i]))
      continue;
    a.push(array[i]);
    u[array[i]] = 1;
  }
  return a;
}
function getTypeOfValue(value) {
  let currentType = Object.prototype.toString.call(value).split(" ")[1].slice(0, -1).toLowerCase();
  if (!currentType)
    currentType = "*";
  return currentType;
}
function parseArray(array, objectName) {
  const currentArrayTypes = [];
  const prefix = objectName ? `${objectName}` : "";
  array.forEach((currentValue) => {
    currentArrayTypes.push(`${getTypeOfValue(currentValue)}[]`);
  });
  if (!(objectName in this))
    this[objectName] = [];
  this[objectName].push(getUnique(currentArrayTypes).join("|"));
  array.forEach((currentValue) => {
    const currentValueType = getTypeOfValue(currentValue);
    if (currentValueType === "array") {
      parseArray.bind(this, currentValue, prefix)();
    } else if (currentValueType === "object") {
      parseObject.bind(this, currentValue, prefix, true)();
    }
  });
}
function parseObject(obj, objectName, doNotReinsert = false) {
  const prefix = objectName ? `${objectName}.` : "";
  Object.keys(obj).forEach((propertyName) => {
    const currentValue = obj[propertyName];
    const propertyType = getTypeOfValue(currentValue);
    const currentPrefix = `${prefix}${propertyName}`;
    let result = null;
    if (!doNotReinsert && objectName) {
      if (!(objectName in this))
        this[objectName] = [];
      this[objectName].push("object");
    }
    if (propertyType === "array")
      parseArray.bind(this, currentValue, currentPrefix)();
    else if (propertyType === "object")
      parseObject.bind(this, currentValue, currentPrefix)();
    else {
      result = propertyType;
      if (!(currentPrefix in this))
        this[currentPrefix] = [];
      this[currentPrefix].push(result);
    }
  });
}
function ParseRootDefinition(obj) {
  const jsonType = typeof obj;
  if (jsonType === "array")
    parseArray.bind(this, obj)();
  else if (jsonType === "object")
    parseObject.bind(this, obj)();
}
function printTheTypeDef(obj, jsonObjects) {
  let output = "";
  const jsonDef = "json";
  const jsonTypes = [];
  Object.keys(jsonObjects).forEach((key) => {
    jsonTypes.push(getTypeOfValue(jsonObjects[key]));
  });
  output = `/** @typedef {${getUnique(jsonTypes)}} ${jsonDef} 
`;
  Object.keys(obj).forEach((key) => {
    output += `* @property {${obj[key].join("|")}} ${key} 
`;
  });
  output += "*/";
  return output;
}
function goThroughAndParse(jsonObjects) {
  const theObjectDefinition = {};
  jsonObjects.forEach((obj) => ParseRootDefinition.bind(theObjectDefinition, obj)());
  return printTheTypeDef(keepUniqueTypes(theObjectDefinition, jsonObjects), jsonObjects);
}
function jsonToJSDoc(json) {
  const jsonObjects = [];
  jsonObjects.push(JSON.parse(json));
  return goThroughAndParse(jsonObjects);
}

exports.jsonToJSDoc = jsonToJSDoc;
