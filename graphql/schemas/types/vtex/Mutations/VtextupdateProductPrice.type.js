const {
  GraphQLObjectType,
  GraphQLString
} = require('graphql');

let VtexUpdateProductPriceType = new GraphQLObjectType({
  name: 'VtexUpdateProductPriceType',
  fields: () => ({
    skuId: { type: GraphQLString,  resolve:(obj, args, context, info)=>{
      return obj.skuId
    }}
  }),
});

module.exports = VtexUpdateProductPriceType;
