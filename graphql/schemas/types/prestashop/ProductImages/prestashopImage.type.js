const {
    GraphQLObjectType,
    GraphQLString
} = require('graphql');
const path = require("path");

let PrestashopProductImageType = new GraphQLObjectType({
  name: 'PrestashopProductImageType',
  fields: () => ({
    file : { type: GraphQLString, resolve : (obj, args, context, info)=>{
      return obj.file;
    }},
    src : { type: GraphQLString , resolve : (obj, args, context, info)=>{
      return obj.src
    }},
  })
});

module.exports = PrestashopProductImageType;