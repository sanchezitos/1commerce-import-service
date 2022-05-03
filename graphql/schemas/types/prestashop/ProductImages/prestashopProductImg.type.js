const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList
} = require('graphql');

const PrestashopImageType = require('./prestashopImage.type');
let PrestashopProductImgType = new GraphQLObjectType({
  name: 'PrestashopProductImgType',
  fields: () => ({
    externalId: { type: GraphQLString, resolve:(obj, args, context, info)=>{
      return obj.id;
    }},
    images:{ type: new GraphQLList(PrestashopImageType), resolve:(obj, args, context, info)=>{      
      return obj.images
    }},
  }),
});

module.exports = PrestashopProductImgType;
