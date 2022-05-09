const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt
} = require('graphql');

let WoocommerceProductVariationType = new GraphQLObjectType({
  name: 'WoocommerceProductVariationType',
  fields: () => ({
    price:{ type:GraphQLInt, resolve:(obj, args, context, info)=>{
      return obj.regular_price ? parseInt(obj.regular_price == "" ? 0 : obj.regular_price) : obj.price ? parseInt(obj.price) : 0
    }},
    talla:{ type:GraphQLString, resolve:(obj, args, context, info)=>{
      if(obj.attributes &&  obj.attributes.length > 0){
        let attrs = obj.attributes;
        let size = attrs.filter(o=> (
          o.name.toLowerCase() === 'tamano' ||
          o.name.toLowerCase() === 'talla' || 
          o.name.toLowerCase() === 'tamaño' || 
          o.name.toLowerCase() === 'size' ||
          o.name.toLowerCase() == "peso_producto"
        ));
        return size.length > 0 ? size[0].option : 'única';
      } else {
        return obj.talla || 'única';
      }
    }},
    quantity:{ type:GraphQLInt, resolve:(obj, args, context, info)=>{
      return obj.stock_quantity || 0
    }},
    reference:{ type:GraphQLString, resolve:(obj, args, context, info)=>{
      return obj.sku
    }},
    ean13:{ type:GraphQLString, resolve:(obj, args, context, info)=>{
      return obj.ean13 || '0'
    }},
    skuId: { type:GraphQLString, resolve: async(obj, args, context, info)=>{
      return obj.id;
    }}
  }),
});

module.exports = WoocommerceProductVariationType;
