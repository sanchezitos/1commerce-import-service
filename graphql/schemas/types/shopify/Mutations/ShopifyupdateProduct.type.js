const {
  GraphQLObjectType,
  GraphQLString
} = require('graphql');

let ShopifyUpdateProductType = new GraphQLObjectType({
  name: 'ShopifyUpdateProductType',
  fields: () => ({
    name: {
      type: GraphQLString, resolve: (obj, args, context, info) => {
        return obj.title
      }
    },
    externalId: { type: GraphQLString,  resolve:(obj, args, context, info)=>{
      return obj.id
    }},
    reference: {
      type: GraphQLString, resolve: (obj, args, context, info) => {
        return obj.handle || obj.id
      }
    }
  }),
});

module.exports = ShopifyUpdateProductType;
