const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt
} = require('graphql');

let SiesaProductVariationType = new GraphQLObjectType({
  name: 'SiesaProductVariationType',
  fields: () => ({
    price:{ type:GraphQLInt, resolve:(obj, args, context, info)=>{
      return obj.Precio ? parseInt(obj.Precio) : 0
    }},
    talla:{ type:GraphQLString, resolve:(obj, args, context, info)=>{
      return obj.Talla || 'único';
    }},
    quantity:{ type:GraphQLInt, resolve: (obj, args, context, info)=>{
      return obj.Existencia ? parseInt(obj.Existencia) : 0
    }},
    reference:{ type:GraphQLString, resolve:(obj, args, context, info)=>{
      return ''
    }},
    ean13:{ type:GraphQLString, resolve:(obj, args, context, info)=>{
      return '0'
    }}
  }),
});

module.exports = SiesaProductVariationType;
