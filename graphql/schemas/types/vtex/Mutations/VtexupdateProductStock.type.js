const {
  GraphQLObjectType,
  GraphQLString
} = require('graphql');

let VtexUpdateProductStockType = new GraphQLObjectType({
  name: 'VtexUpdateProductStockType',
  fields: () => ({
    warehouseName: { type: GraphQLString,  resolve:(obj, args, context, info)=>{
      return obj.warehouseName
    }}
  }),
});

module.exports = VtexUpdateProductStockType;
