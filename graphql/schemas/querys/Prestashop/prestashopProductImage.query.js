const { getImages } = require('../../../../controllers/Prestashop.controller');
const { getToken, validate}  = require('../../../../util/auth.util');
const prestashopProductImageListType  = require('../../types/prestashop/ProductImages/prestashopImageListType');
const ListingInput = require('../../types/pagination/listingInput');

const PrestashopProductImageListQuery = {
  type:  prestashopProductImageListType,
  args: { listing: { type: ListingInput } },
  resolve: (_, { listing }, context) => {
    let token = getToken(context.req);
    let credentials = validate(token);
    
    delete credentials.iat;
    
    if(!credentials){
      throw new Error("Auth token error");
    }
    
    context.req = credentials;
    
    return getImages(credentials, listing);
  }
};
  
module.exports = PrestashopProductImageListQuery;
