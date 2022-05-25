const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLList
} = require('graphql');

const SiesaProductVType = require('./siesaProductV.type');
const SiesaProductVariationListType = new GraphQLObjectType({
  name: 'SiesaProductVariationListType',
  fields: () => ({
    totalRecords: { type: GraphQLInt },
    pagesCount: { type: GraphQLInt },
    data: { type: new GraphQLList(SiesaProductVType) },
  }),
});

module.exports = SiesaProductVariationListType;
