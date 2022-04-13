
let services;
let logger;

let init = (app, locals) => {
    logger = locals.logger.getLogger("WooCommerceController");

    services = locals.services || {};
    models = locals.models;
    logger.info("Initialization started.");

    locals.controllers = locals.controllers || {}

    locals.controllers.WooCommerce = {
        getProducts,
        getImages,
        getPagination,
        getProductId,
        addWebhook,
        updateWebhook
    }

    logger.info("Initialization finished.");
}

let getPagination = (credentials, listing) => {
    return new Promise(async (resolve, reject) => {
        try {
            credentials.queryStringAuth = true;
            credentials.verifySsl =  false;
            let WooCommerce = new services.WooCommerceRestApi(credentials);
            let response = await WooCommerce.get(`products`, { per_page: listing.pagination.pageSize, page: listing.pagination.page });
            
            resolve({
                totalRecords : (response.headers['x-wp-total']),
                pagesCount : parseInt(response.headers['x-wp-totalpages'])
            });

        } catch (error) {
            reject(error);
        }
    });
}

let getProducts = (credentials, listing) => {
    return new Promise(async (resolve, reject) => {
        try {
            credentials.queryStringAuth = true;
            credentials.verifySsl =  false;
            let WooCommerce = new services.WooCommerceRestApi(credentials);
            let response = await WooCommerce.get("products", { per_page: listing.pagination.pageSize, page: listing.pagination.page });
            let tax = await WooCommerce.get("taxes");
            
            let findTax = (taxClass, taxes)=>{
                return tax.data.filter((c) => c.name.toLowerCase() === taxClass.toLowerCase());
            }
            let products = response.data.filter(product => product.status == "publish")
            products = await productsColor(credentials, products);
            let results = products.map((p)=>{
                let tx = findTax(p.tax_class, tax);
                if(!tx || tx.length == 0){
                    p.tax = tax.data.filter(t=>t.class === 'standard')[0]
                }

                return p;
            });

            resolve({
                totalRecords : (response.headers['x-wp-total']),
                pagesCount : parseInt(response.headers['x-wp-totalpages']),
                data : results || []
            });

        } catch (error) {
            resolve({});
        }
    });
}

let productsColor = async (credentials, products) => {
    let resultProducts = [];
    for (let product of products) {
        if (product.type == 'simple') {
            resultProducts.push(product);
        } else {
            let existColors = getColors(product);
            if (existColors.length > 1) {
                const name = product.name;
                for (const color of existColors) {
                    resultProducts.push({
                        ...product,
                        id: product.id + '-' + color.replace(/\s/g, ''),
                        sku: product.sku + '-' + color.replace(/\s/g, ''),
                        name: name + ' ' + color.replace(/\s/g, '')
                    });
                }
            } else {
                resultProducts.push(product);
            }
        }
    }
    return resultProducts; 
}

let getColors = (product) => {
    let existColors = []
    if(product.attributes && product.attributes.length > 0){
        let attrs = product.attributes;
        let color = attrs.filter(o=>(o.name.toLowerCase() === 'color' || o.name.toLowerCase() === 'color_primario'))[0];
        existColors = color ? color.options ? color.options : [color.option] : []
    }
    return existColors;
}

let getVariationsProduct = (credentials, pro) => {
    return new Promise(async (resolve, reject) => {
        try {
            credentials.queryStringAuth = true;
            credentials.verifySsl =  false;
            let WooCommerce = new services.WooCommerceRestApi(credentials);
            let products = await WooCommerce.get(`products/${pro.id}/variations`);
            let tax = await WooCommerce.get("taxes");
            let findTax = (taxClass, taxes)=>{
                return tax.data.filter((c) => c.name.toLowerCase() === taxClass.toLowerCase());
            }

            let results = products.data.map((p)=>{
                let tx = findTax(p.tax_class, tax);
                if(!tx || tx.length == 0){
                    p.tax = tax.data.filter(t=>t.class === 'standard')[0]
                }
                return p;
            });
            resolve(results)

        } catch (error) {
            resolve([]);
        }
    });
}

let getProductId = (credentials, id) => {
    return new Promise(async (resolve, reject) => {
        try {
            credentials.queryStringAuth = true;
            credentials.verifySsl =  false;
            let WooCommerce = new services.WooCommerceRestApi(credentials);
            let products = await WooCommerce.get(`products/${id}`);
            let tax = await WooCommerce.get("taxes");
            let findTax = (taxClass, taxes)=>{
                return tax.data.filter((c) => c.name.toLowerCase() === taxClass.toLowerCase());
            }

            let tx = findTax(products.data.tax_class, tax);

            if(!tx || tx.length == 0){
                products.data.tax = tax.data.filter(t=>t.class === 'standard')[0];
            }

            let product = products.data && products.data.status == "publish" ? products.data : {};
            const resultProducts = product.id ? await productColor(credentials, product) : [];

            let rs = {
                data: resultProducts
            }
            return resolve(rs);

        } catch (error) {
            reject(error);
        }
    });
}

let productColor = async (credentials, product) => {
    let resultProducts = [];
    if (product.type == 'simple') {
        let variations = await getVariationsProduct(credentials, product);
        resultProducts.push({...product, variations: variations});
    } else {
        let existColors = getColors(product);
        if (existColors.length > 1) {
            const name = product.name;
            let variationsColor = await getVariationsProduct(credentials, product);
            for (const color of existColors) {
                let variat =variationsColor.filter(p => {
                    let colorVariation = getColors(p);
                    if (colorVariation[0] == color) {
                        return p;
                    }
                })
                let imagesProduct = product.image ? [product.image] : product.images;
                resultProducts.push({
                    ...product,
                    id: product.id + '-' + color.replace(/\s/g, ''),
                    sku: product.sku + '-' + color.replace(/\s/g, ''),
                    name: name + ' ' + color.replace(/\s/g, ''),
                    variations: variat,
                    images: variat.length > 0 && variat[0].image ? [variat[0].image] : variat.length > 0 ? variat[0].images : imagesProduct
                });
            }
        } else {
            let variations = await getVariationsProduct(credentials, product);
            resultProducts.push({...product, variations: variations});
        }
    }
    return resultProducts; 
}

let getVariations = (credentials, listing) => {
    return new Promise(async (resolve, reject) => {
        try {
            credentials.queryStringAuth = true;
            credentials.verifySsl =  false;
            let WooCommerce = new services.WooCommerceRestApi(credentials);
            let response = await WooCommerce.get("products", { per_page: listing.pagination.pageSize, page: listing.pagination.page });  
            let products = response.data.filter(product => product.status == "publish")
            products = await variantsColor(credentials, products);

            let rs = {
                totalRecords: (response.headers['x-wp-total']),
                pagesCount: parseInt(response.headers['x-wp-totalpages']),
                data: products || []
            }
            resolve(rs)
            
        } catch (error) {
            console.log(error);
            resolve({});
        }
    });
}

let variantsColor = async (credentials, products) => {
    let resultProducts = [];
    try {
        for (let product of products) {
            if (product.type == 'simple') {
                let variations = await getVariationsProduct(credentials, product);
                resultProducts.push({...product, variations: variations});
            } else {
                let existColors = getColors(product);
                if (existColors.length > 1) {
                    const name = product.name;
                    let variationsColor = await getVariationsProduct(credentials, product);
                    for (const color of existColors) {
                        let variat =variationsColor.filter(p => {
                            let colorVariation = getColors(p);
                            if (colorVariation[0] == color) {
                                return p;
                            }
                        })
                        resultProducts.push({
                            ...product,
                            id: product.id + '-' + color.replace(/\s/g, ''),
                            sku: product.sku + '-' + color.replace(/\s/g, ''),
                            name: name + ' ' + color.replace(/\s/g, ''),
                            variations: variat
                        });
                    }
                } else {
                    let variations = await getVariationsProduct(credentials, product);
                    resultProducts.push({...product, variations: variations});
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
    return resultProducts;
}

let getImages = async (credentials, listing) => {
    return new Promise(async (resolve, reject) => {
        try {
            credentials.queryStringAuth = true;
            credentials.verifySsl =  false;
            let WooCommerce = new services.WooCommerceRestApi(credentials);
            let response = await WooCommerce.get("products", { per_page: listing.pagination.pageSize, page: listing.pagination.page });  
            let products = response.data.filter(product => product.status == "publish")
            products = await imageColor(credentials, products);

            let rs = {
                totalRecords: (response.headers['x-wp-total']),
                pagesCount: parseInt(response.headers['x-wp-totalpages']),
                data: products || []
            }
            resolve(rs)

        } catch (error) {
            reject(error);
        }
    });
}

let imageColor = async (credentials, products) => {
    let resultProducts = [];
    for (let product of products) {
        if (product.type == 'simple') {
            resultProducts.push(product);
        } else {
            let existColors = getColors(product);
            if (existColors.length > 1) {
                let variationsColor = await getVariationsProduct(credentials, product);
                for (const color of existColors) {  
                    let variat = variationsColor.filter(p => {
                        let colorVariation = getColors(p);
                        if (colorVariation[0] == color) {
                            return p;
                        }
                    })
                    let imagesProduct = product.image ? [product.image] : product.images;
                    resultProducts.push({
                        ...product,
                        id: product.id + '-' + color.replace(/\s/g, ''),
                        images: variat.length > 0 && variat[0].image ? [variat[0].image] : variat.length > 0 ? variat[0].images : imagesProduct
                    });
                }
            } else {
                resultProducts.push(product);
            }
        }
    }
    return resultProducts;
}

let getOrderId = (credentials, orderId) => {
    return new Promise(async (resolve, reject) => {
        try {
            credentials.queryStringAuth = true;
            credentials.verifySsl =  false;
            let WooCommerce = new services.WooCommerceRestApi(credentials);
            let order = await WooCommerce.get(`orders/${orderId}`);
           
            if (order && order.data) {
                return resolve(order.data);
            }

            resolve({ data: [] })

        } catch (error) {
            reject(error);
        }
    });
}

let addWebhook = (credentials, webhook) => {
    return new Promise(async (resolve, reject) => {
        try {
            credentials.queryStringAuth = true;
            credentials.verifySsl =  false;
            let WooCommerce = new services.WooCommerceRestApi(credentials);
              
            let response = await WooCommerce.post("webhooks", webhook);
            if (response && response.data) {
                return resolve(response.data);
            }

            resolve({});

        } catch (error) {
            reject(error);
        }
    });
}

let updateWebhook = (credentials,webhookId, webhook) => {
    return new Promise(async (resolve, reject) => {
        try {
            credentials.queryStringAuth = true;
            credentials.verifySsl =  false;
            let WooCommerce = new services.WooCommerceRestApi(credentials);
              
            let response = await WooCommerce.put(`webhooks/${webhookId}`, { status :  webhook.status });
           
            if (response && response.data) {
                return resolve(response.data);
            }

            resolve({});

        } catch (error) {
            reject(error);
        }
    });
}

let updateVariation = (credentials, productId, variationId, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            credentials.queryStringAuth = true;
            credentials.verifySsl =  false;
            let WooCommerce = new services.WooCommerceRestApi(credentials);
            if (productId === variationId ) {
                let response = await WooCommerce.put(`products/${parseInt(productId)}`, {
                    stock_quantity: data.quantity,
                    regular_price: String(data.price)
                });
                if (response && response.data) {
                    return resolve(response.data);
                }
            } else {
                let response = await WooCommerce.put(`products/${parseInt(productId)}/variations/${parseInt(variationId)}`, {
                    stock_quantity: data.quantity,
                    regular_price: String(data.price)
                });
                if (response && response.data) {
                    return resolve(response.data);
                }
            }

            resolve({});

        } catch (error) {
            reject(error);
        }
    });
}

module.exports = { 
    init,
    getPagination,
    getProducts,
    getVariations,
    getVariationsProduct,
    getImages,
    getProductId,
    getOrderId,
    addWebhook,
    updateWebhook,
    updateVariation
};