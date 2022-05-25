const { getVariations } = require('../../../../controllers/Siesa.controller');
const { getToken, validate}  = require('../../../../util/auth.util');
const siesaProductVariationListType  = require('../../types/Siesa/ProductVariation/siesaProductVariationListType');
const ListingInput = require('../../types/pagination/listingInput');

const SiesaProductVariationListQuery = {
  type:  siesaProductVariationListType,
  args: { listing: { type: ListingInput } },
  resolve: (_, { listing }, context) => {
    let token = getToken(context.req);
    let credentials = validate(token);
    
    delete credentials.iat;
    
    if(!credentials){
      throw new Error("Auth token error");
    }
    
    context.req = credentials;
    
    return getVariations(credentials, listing);
  }
};
  
module.exports = SiesaProductVariationListQuery;
