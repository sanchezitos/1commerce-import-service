const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt
} = require('graphql');

let ShopifyUpdateProductStockType = new GraphQLObjectType({
  name: 'ShopifyUpdateProductStockType',
  fields: () => ({
    inventoryId: {
      type: GraphQLString, resolve: (obj, args, context, info) => {
        return obj.inventory_item_id
      }
    },
    quantity: { type: GraphQLInt,  resolve:(obj, args, context, info)=>{
      return obj.available
    }}
  }),
});

module.exports = ShopifyUpdateProductStockType;