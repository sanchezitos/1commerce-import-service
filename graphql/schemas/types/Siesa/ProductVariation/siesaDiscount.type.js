const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat
} = require('graphql');

let SiesaDiscountType = new GraphQLObjectType({
  name: 'SiesaDiscountType',
  fields: () => ({
    name:{ type:GraphQLString, resolve:(obj, args, context, info)=>{
      return obj.name
    }},
    from:{ type:GraphQLString, resolve:(obj, args, context, info)=>{
      return obj.from
    }},
    to:{ type:GraphQLString, resolve:(obj, args, context, info)=>{
      return obj.to
    }},
    type:{ type:GraphQLString, resolve:(obj, args, context, info)=>{
      return obj.type
    }},
    value:{ type:GraphQLFloat, resolve:(obj, args, context, info)=>{
      return obj.value
    }}
  }),
});

module.exports = SiesaDiscountType;