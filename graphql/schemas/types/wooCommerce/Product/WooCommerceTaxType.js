const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
} = require('graphql');

let WooCommerceTaxType = new GraphQLObjectType({
    name: 'WooCommerceTaxType',
    fields: () => ({
      name:{ type:GraphQLString, resolve :(obj, args, context, info)=>{
        return obj.name || '';
      }},
      rate:{type:GraphQLInt, resolve :(obj, args, context, info)=>{
        return obj.rate ? parseInt(obj.rate) : 0;
      }}
    }),
});

module.exports = WooCommerceTaxType;