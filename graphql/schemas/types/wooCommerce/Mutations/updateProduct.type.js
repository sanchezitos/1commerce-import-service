const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean
} = require('graphql');

let UpdateProductType = new GraphQLObjectType({
  name: 'UpdateProductType',
  fields: () => ({
    name: { type: GraphQLString},
    externalId: { type: GraphQLString,  resolve:(obj, args, context, info)=>{
      return obj.id.toString();
    }},
    simple: { type: GraphQLBoolean,  resolve:(obj, args, context, info)=>{
      return obj.type == 'simple' ? true : false;
    }},
    reference:{ type:GraphQLString, resolve:(obj, args, context, info)=>{
      return obj.sku
    }},
  }),
});

module.exports = UpdateProductType;
