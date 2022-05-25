let services;
let logger;

let init = (app, locals) => {
  logger = locals.logger.getLogger("SiesaController");

  services = locals.services || {};
  models = locals.models;
  logger.info("Initialization started.");

  locals.controllers = locals.controllers || {}
  locals.controllers.siesa = {
    getPagination,
    getProducts,
    getVariations
  }

  logger.info("Initialization finished.");
}

let getPagination = (credentials, listing) => {
  return new Promise(async (resolve, reject) => {
    try {
      let totalRecords = await services.Siesa.getPaginate(credentials);
      let count = totalRecords ? Math.ceil(totalRecords / listing.pagination.pageSize) : null;
      let rs = {
        totalRecords: totalRecords,
        pagesCount: count
      }
      return resolve(rs);
    } catch (error) {
      reject(error);
    }
  });
}

let getProducts = (credentials, listing) => {
  return new Promise(async (resolve, reject) => {
    try {
      let products = await services.Siesa.getProducts(credentials, listing);
      let totalRecords = products && products.length > 0 ? parseInt(products[0].Numero_Registros) : null;
      if (products && products.length > 0) {
        products = products.filter((v, i, a) => a.findIndex(v2 => (v2.Referencia === v.Referencia)) === i)
        products = products.filter(product => product.Activo_web == 'SI' && product.Marca);
      }
      let count = totalRecords ? Math.ceil(totalRecords / listing.pagination.pageSize) : null;

      let rs = {
        totalRecords: totalRecords,
        pagesCount: count,
        data: products || []
      }
      return resolve(rs);

    } catch (error) {
      reject(error);
    }
  });
}

let getVariations = (credentials, listing) => {
  return new Promise(async (resolve, reject) => {
    try {
      let result = [];
      let inventory = await services.Siesa.getVariations(credentials, listing);
      let totalRecords = inventory && inventory.length > 0 ? parseInt(inventory[0].Numero_Registros) : null;
      let count = totalRecords ? Math.ceil(totalRecords / listing.pagination.pageSize) : null;
      
      if (inventory && inventory.length > 0) {
        let resultInvetory = inventory.filter((v, i, a) => a.findIndex(v2 => (v2.Referencia === v.Referencia)) === i)
        for (const inv of resultInvetory) {
          let variations = inventory.filter(invent => invent.Referencia === inv.Referencia);
          result.push({Referencia: inv.Referencia, Id_Item: inv.Id_Item, variations});
        }
      }

      let rs = {
        totalRecords: totalRecords,
        pagesCount: count,
        data: result
      }
      return resolve(rs);
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { init, getPagination, getProducts, getVariations};
