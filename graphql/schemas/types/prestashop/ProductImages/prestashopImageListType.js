const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLList,
} = require('graphql');

const prestashopProductImg = require('./prestashopProductImg.type');
const PrestashopProductImageListType = new GraphQLObjectType({
  name: 'PrestashopProductImageListType',
  fields: () => ({
    totalRecords: { type: GraphQLInt },
    pagesCount: { type: GraphQLInt },
    data: { type: new GraphQLList(prestashopProductImg) },
  }),
});

module.exports = PrestashopProductImageListType;
