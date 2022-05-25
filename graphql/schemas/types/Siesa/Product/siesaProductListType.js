const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLList
} = require('graphql');

const SiesaProductType = require('./siesaProduct.type');
const siesaProductListType = new GraphQLObjectType({
  name: 'siesaProductListType',
  fields: () => ({
    totalRecords: { type: GraphQLInt },
    pagesCount: { type: GraphQLInt },
    data: { type: new GraphQLList(SiesaProductType) },
  }),
});

module.exports = siesaProductListType;
