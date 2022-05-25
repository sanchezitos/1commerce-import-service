const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLFloat
} = require('graphql');
const stripHtml = require("string-strip-html");

let SiesaProductType = new GraphQLObjectType({
  name: 'SiesaProductType',
  fields: () => ({
    name: {type: GraphQLString, resolve: (obj, args, context, info) => {
      let linea = obj.Linea || '';
      let genero = obj.Genero ? `PARA ${obj.Genero}` : '';
      let color = obj.Web_color || '';
      let resultName = `${obj.Desc_Abreviada} ${linea} ${genero} ${color}`;
      return resultName.trim();
    }},
    externalId: { type: GraphQLString,  resolve:(obj, args, context, info)=>{
      return obj.Id_Item
    }},
    reference: {type: GraphQLString, resolve: (obj, args, context, info) => {
      return obj.Referencia;
    }},
    description: {type: GraphQLString, resolve: (obj, args, context, info) => {
      let categoria = obj.Categoria ? ` ${obj.Categoria}` : ''
      return obj.Descripcion_comercial ? stripHtml(obj.Descripcion_comercial + categoria) : ''
    }},
    descriptionShort: {type: GraphQLString, resolve: (obj, args, context, info) => {
      return obj.Descripcion ? stripHtml(obj.Descripcion) : ''
    }},
    active: {type: GraphQLBoolean, resolve: (obj, args, context, info) => {
      return obj.Activo_web && obj.Activo_web === 'SI' ? true : false
    }},
    manufacturer: {type: GraphQLString, resolve: (obj, args, context, info) => {
      return obj.Marca || '';
    }},
    color: {type: GraphQLString, resolve: (obj, args, context, info) => {
      return obj.Web_color || '';
    }},
    width: {type: GraphQLInt, resolve: (obj, args, context, info) => {
      return 0;
    }},
    height: {type: GraphQLInt, resolve: (obj, args, context, info) => {
      return 0;
    }},
    length: {type: GraphQLInt, resolve: (obj, args, context, info) => {
      return 0;
    }},
    weight: {type: GraphQLFloat, resolve: (obj, args, context, info) => {
      return obj.Web_peso ? parseInt(obj.Web_peso / 1000) : 0;
    }}
  }),
});

module.exports = SiesaProductType;