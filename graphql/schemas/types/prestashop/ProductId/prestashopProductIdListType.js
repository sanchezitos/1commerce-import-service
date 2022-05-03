const {
  GraphQLObjectType,
  GraphQLList
} = require('graphql');

const PrestashopProductIdType = require('./prestashopProductId.type');
const PrestashopProductIdListType = new GraphQLObjectType({
  name: 'PrestashopProductIdListType',
  fields: () => ({
    data: { type: new GraphQLList(PrestashopProductIdType) },
  }),
});

module.exports = PrestashopProductIdListType;
