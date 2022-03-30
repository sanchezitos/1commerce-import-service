const {
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLFloat
} = require('graphql');

const UpdateVariationInputType = new GraphQLInputObjectType({
  name: 'UpdateVariationInputType',
  fields: {
    quantity :{ type: GraphQLInt },
    price: { type: GraphQLFloat }
  },
});

module.exports = UpdateVariationInputType;