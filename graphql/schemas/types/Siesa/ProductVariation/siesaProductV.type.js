const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList
} = require('graphql');
const SiesaProductVariationType = require('./siesaProductVariation.type');
const SiesaDiscountType = require('./siesaDiscount.type');

let SiesaProductVType = new GraphQLObjectType({
  name: 'SiesaProductVType',
  fields: () => ({
    externalId: { type: GraphQLString, resolve:(obj, args, context, info)=>{
      return obj.Id_Item;
    }},
    reference: { type: GraphQLString, resolve: (obj, args, context, info) => {
      return obj.Referencia;
    }},
    discount: {type: new GraphQLList(SiesaDiscountType),resolve: async (obj, args, context, info)=>{
      let disc = [];
      return disc
    }},
    variations:{ type:new GraphQLList(SiesaProductVariationType), resolve:(obj, args, context, info)=>{      
      if (!obj.variations || obj.variations.length === 0) {
        return [{}]
      }
      return obj.variations
    }},
  }),
});

module.exports = SiesaProductVType;
