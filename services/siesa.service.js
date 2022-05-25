let logger;
const axios = require('axios');
let soap = require('strong-soap').soap;

let init = async (app, locals) => {
  logger = locals.logger.getLogger("siesaService");

  return new Promise(async (resolve, reject) => {
    logger.info(`Loading siesa service`);
    try {
      locals.services = locals.services || {};
      locals.services.Siesa = {
        getPaginate,
        getProducts,
        getVariations
      };
      logger.info(`siesa service done.`);
      return resolve();
    } catch (e) {
      logger.error(`Error loading  siesa Service`);
      reject(new Error(`[ERROR]:loading  siesa Service`));
    }
  });
}

let getPaginate = (credentials, params) => {
  return new Promise(async (resolve, reject) => {
    let url = `${credentials.url}?wsdl`;
    let requestArgs={
      numeroPagina: 1,
      cantidadRegistros: 5,
    };

    let options = { endpoint: credentials.url};
    soap.createClient(url, options, (err, client) =>{
      let method = client['OUT_ListadoMaestroItems'];
      if(err){resolve(null);}
      method(requestArgs, async (err, result)=>{
        if(err){resolve(null);}
        if(result && result.OUT_ListadoMaestroItemsResult && result.OUT_ListadoMaestroItemsResult.OUT_ModeloMaestroItems.length > 0){
          return resolve(parseInt(result.OUT_ListadoMaestroItemsResult.OUT_ModeloMaestroItems[0].Numero_Registros));
        } else {
          resolve(null);
        }
      });
    });
  });
}

let getProducts = (credentials, params) => {
  return new Promise(async (resolve, reject) => {
    let url = `${credentials.url}?wsdl`;
    let requestArgs = {
      numeroPagina: params.pagination.page,
      cantidadRegistros: params.pagination.pageSize,
    };

    let options = { endpoint: credentials.url};
    soap.createClient(url, options, (err, client) =>{
      let method = client['OUT_ListadoMaestroItems'];
      if(err){resolve(null);}
      method(requestArgs, async (err, result)=>{
        if(err){resolve(null);}
        
        if(result && result.OUT_ListadoMaestroItemsResult && result.OUT_ListadoMaestroItemsResult.OUT_ModeloMaestroItems.length > 0){
          return resolve(result.OUT_ListadoMaestroItemsResult.OUT_ModeloMaestroItems);
        } else {
          resolve(null);
        }
      });
    });
  });
}

let getVariations = (credentials, params) => {
  return new Promise(async (resolve, reject) => {
    let url = `${credentials.url}?wsdl`;
    let requestArgs = {
      numeroPagina: params.pagination.page,
      cantidadRegistros: params.pagination.pageSize,
    };

    let options = { endpoint: credentials.url};
    soap.createClient(url, options, (err, client) =>{
      let method = client['OUT_ListadoInventarioItems'];
      if(err){resolve(null);}
      method(requestArgs, async (err, result)=>{
        if(err){resolve(null);}
        if(result && result.OUT_ListadoInventarioItemsResult && result.OUT_ListadoInventarioItemsResult.OUT_ModeloItemsIventario.length > 0){
          return resolve(result.OUT_ListadoInventarioItemsResult.OUT_ModeloItemsIventario);
        } else {
          resolve(null);
        }
      });
    });
  });
}

module.exports = { init };
