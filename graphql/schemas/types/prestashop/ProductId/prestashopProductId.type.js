const {
  GraphQLObjectType
} = require('graphql');

const PrestashopProduct = require('../Product/prestashopProduct.type');
const PrestashopProductVType = require('../ProductVariation/prestashopProductV.type');
const PrestashopProductImg = require('../ProductImages/prestashopProductImg.type');

let PrestashopProductIdType = new GraphQLObjectType({
  name: 'PrestashopProductIdType',
  fields: () => ({
    product: {type: PrestashopProduct, resolve: (obj, args, context, info) => {
      return obj;
    }},
    productVariations: {type: PrestashopProductVType, resolve: (obj, args, context, info) => {
      return obj;
    }},
    productImages: {type: PrestashopProductImg, resolve: (obj, args, context, info) => {
      return obj;
    }},
  }),
});

module.exports = PrestashopProductIdType;
