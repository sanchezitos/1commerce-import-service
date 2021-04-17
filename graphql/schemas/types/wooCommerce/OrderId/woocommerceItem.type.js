const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt
} = require('graphql');

const WoocommerceItemType = new GraphQLObjectType({
  name: 'WoocommerceItemType',
  fields: () => ({
    skuId:{ type:GraphQLString, resolve :(obj, args, context, info)=>{
      return obj.sku;
    }},
    quantity:{ type:GraphQLInt, resolve :(obj, args, context, info)=>{
      return obj.quantity;
    }},
    price: {type: GraphQLInt, resolve: (obj, args, context, info) => {
      return Math.ceil(obj.total);
    }},
    discount: {type: GraphQLInt, resolve: (obj, args, context, info) => {
      return Math.ceil(obj.discount_total);
    }}
  }),
});

module.exports = WoocommerceItemType;
