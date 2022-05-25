const { getProducts } = require('../../../../controllers/Siesa.controller');
const { getToken, validate}  = require('../../../../util/auth.util');
const SiesaProductListType  = require('../../types/Siesa/Product/siesaProductListType');
const ListingInput = require('../../types/pagination/listingInput');

const SiesaProductListQuery = {
  type:  SiesaProductListType,
  args: { listing: { type: ListingInput } },
  resolve: (_, { listing }, context) => {
    let token = getToken(context.req);
    let credentials = validate(token);
    delete credentials.iat;
    if(!credentials){
      throw new Error("Auth token error");
    }
    
    context.req = credentials;
    return getProducts(credentials, listing);
  }
};

module.exports = SiesaProductListQuery;
