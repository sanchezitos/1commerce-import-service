
let services;
let logger;

let init = (app, locals) => {
    logger = locals.logger.getLogger("PrestashopController");

    services = locals.services || {};
    models = locals.models;
    logger.info("Initialization started.");

    locals.controllers = locals.controllers || {}
    locals.controllers.Prestashop = {
        getProducts,
        getOrderId
    }

    logger.info("Initialization finished.");
}

let getProducts = (credentials, listing) => {
    return new Promise(async (resolve, reject) => {
        try {
            let optionColor=[];
            let optionMarca=[];
            let response = await services.Prestashop.getData(credentials,listing);
            let count = await services.Prestashop.getCount(credentials);
            let tax_rules = await services.Prestashop.getIdTaxes(credentials);
            let taxes = await services.Prestashop.getTaxes(credentials);
            let attributes = await services.Prestashop.getAttributes(credentials);
            let optionsCms = await services.Prestashop.getOptions(credentials);

            let resultOptions = optionsCms.filter(option => option.name.toLowerCase().includes('color'))
            let resultOptionsMarca = optionsCms.filter(option => option.name.toLowerCase().includes('marca'))
            
            for (const option of resultOptions) {
                optionColor = [...optionColor, ...option.associations.product_option_values];
            }
            for (const option of resultOptionsMarca) {
                optionMarca = [...optionMarca, ...option.associations.product_option_values];
            }

            let products = response.products.filter(product => product.active == '1')

            if(products){
                products = await productsColor(products, attributes, optionColor, optionMarca);

                taxes.taxes.map((t)=>{
                    products.map((p)=>{
                        let id_tax=tax_rules.find(tr => tr.tax_rules_group = p.id_tax_rules_group).id_tax;
                        if((t.id)==id_tax){
                            p.tax={
                                name:t.name,
                                rate:t.rate
                            }
                        }else{
                            p.tax={
                                name:null,
                                rate:'0'
                            }
                        };
                    });
                });
            }
            let rs = {
                totalRecords : count.products.length,
                pagination : response.pagination  || null,
                pagesCount : Math.ceil((count.products.length / listing.pagination.pageSize)) ,
                data : products || []
            }
            return resolve(rs);

        } catch (error) {
            reject(error);
        }
    });
}

let productsColor = async (products, attributes, colors, marcas) => {
    let resultProducts = [];
    for (let product of products) {
        if (product.associations.product_option_values && product.associations.product_option_values.length > 0) {
            let result = getColors(product.associations.product_option_values, attributes, colors, marcas);

            if (result.resultColors.length > 1) {
                const name = product.name;
                for (let color of result.resultColors) {
                    color = color.replace(/\s/g, '').replace(/[0-9]/g, '').replace(/-/g, '')
                    resultProducts.push({
                        ...product,
                        id: product.id + '-' + color,
                        reference: product.reference.trim() + '-' + color,
                        name: name + ' ' + color,
                        color: color,
                        manufacturer_name: result.marca
                    });
                }
            } else {
                resultProducts.push({
                    ...product,
                    color: result.resultColors[0].replace(/\s/g, '').replace(/[0-9]/g, '').replace(/-/g, ''),
                    manufacturer_name: result.marca
                });
            }
        } else {
            resultProducts.push(product);
        }        
    }
    return resultProducts; 
}

let getColors = (productOptionValues, attributes, colors, marcas) => {
    let resultColors = [];
    let marca = '';
    for (const option of productOptionValues) {
        let optColor = colors.find(a => a.id == option.id);
        
        if (optColor) {
            let attr = attributes.product_option_values.find(a => a.id == optColor.id);
            resultColors.push(attr.name);
        }

        if (marcas && marcas.length > 0) {
            let optMarca = marcas.find(a => a.id == option.id);
            if (optMarca) {
                let attr = attributes.product_option_values.find(a => a.id == optMarca.id);
                marca = attr.name;
            }
        }
    }
    return {resultColors, marca};
}

let getVariations = (credentials, listing) => {
    const moment = require('moment');
    return new Promise(async (resolve, reject) => {
        try {
            let variations=[];
            let optionTallas=[];
            let optionColor=[];
            let combinations;
            let external_id;
            let response = await services.Prestashop.getData(credentials,listing);
            let count = await services.Prestashop.getCount(credentials);
            let optionsCms = await services.Prestashop.getOptions(credentials);
            let quantities = await services.Prestashop.getQuantities(credentials);
            let attributes = await services.Prestashop.getAttributes(credentials);
            let discounts = await services.Prestashop.getDiscounts(credentials);
            let discount_names = await services.Prestashop.getDiscountNames(credentials);

            let resultOptionsColor = optionsCms.filter(option => option.name.toLowerCase().includes('color'))
            let resultOptionsTalla = optionsCms.filter(option => option.name.toLowerCase().includes('talla'))

            for (const option of resultOptionsColor) {
                optionColor = [...optionColor, ...option.associations.product_option_values];
            }

            for (const option of resultOptionsTalla) {
                optionTallas = [...optionTallas, ...option.associations.product_option_values];
            }

            let products = response.products.filter(product => product.active == '1')

            if(products){
                products = await variantsColor(credentials, products, attributes, optionColor);

                for (let index = 0; index < products.length; index++) {
                    let discount=[];
                    let disc=discounts.filter(d => (d.id_product == products[index].id)&&(moment(moment(d.to).valueOf()).isSameOrAfter(moment().valueOf())));
                    if(disc.length>1){
                        disc=disc.sort((a,b) => b.from.localeCompare(a.from));
                        disc.length = 1;
                    }
                    disc=disc[0];
                    if(disc){
                        disc.name=discount_names.find(dn => dn.id == disc.id_specific_price_rule);
                        products[index].discount={
                            name:products[index].name ? products[index].name:'',
                            from: moment(disc.from).format('YYYY/MM/DD HH:mm:ss'),
                            to:moment(disc.to).format('YYYY/MM/DD HH:mm:ss'),
                            type:disc.reduction_type === 'percentage' ? 'P' : 'C',
                            value:disc.reduction*100
                        };

                        discount.push(products[index].discount);
                    }

                    let variations_product = [];
                    external_id = products[index].id;
                    combinations = products[index].variations;
                    
                    if (combinations) {
                        for (let i = 0; i < combinations.length; i++) {
                            if (combinations[i].associations.product_option_values && combinations[i].associations.product_option_values.length > 0) {
                                for (const option of combinations[i].associations.product_option_values) {
                                    let optionTalla = optionTallas.find(a => a.id == option.id);
                                    if (optionTalla) {
                                        let attr = attributes.product_option_values.find(a => a.id == optionTalla.id);
                                        combinations[i].talla = attr.name;
                                    }
                                }
                            }
                            let id_variation = combinations[i].id;
                            let quantity = quantities.find(q => q.id_product_attribute == id_variation).quantity;
                            
                            combinations[i].quantity = quantity;
                            if(combinations[i].price==0){
                                combinations[i].price=products[index].price;
                            }
                            variations_product.push(combinations[i]);
                        }
                    }

                    let obj= {
                        external_id:external_id,
                        discount: discount,
                        reference: products[index].reference,
                        variations: variations_product
                    }
                    variations.push(obj);
                }
            }
            
            let rs = {
                totalRecords : count.products.length,
                pagesCount : Math.ceil((count.products.length / listing.pagination.pageSize)),
                data : variations || []
            }
            return resolve(rs);
            
        } catch (error) {
            reject(error);
        }
    });
}

let variantsColor = async (credentials, products, attributes, colors) => {
    let resultProducts = [];
    try {
        for (let product of products) {
            let result = getColors(product.associations.product_option_values, attributes, colors);
            if (result.resultColors.length > 1) {
                const name = product.name;
                let variationsColor = await services.Prestashop.getCombinations(credentials, product.id);

                for (let color of result.resultColors) {
                    let variat = variationsColor.filter(p => {
                        let colorVariation = getColors(p.associations.product_option_values, attributes, colors);
                        if (colorVariation.resultColors[0] == color) {
                            return p;
                        }
                    })
                    color = color.replace(/\s/g, '').replace(/[0-9]/g, '').replace(/-/g, '');
                    resultProducts.push({
                        ...product,
                        id: product.id + '-' + color,
                        name: name + ' ' + color,
                        variations: variat
                    });
                }
            } else {
                let variations = await services.Prestashop.getCombinations(credentials, product.id);
                resultProducts.push({...product, variations: variations});
            }
        }
    } catch (error) {
        console.log(error);
    }
    return resultProducts;
}

let getImages = (credentials, listing) => {
    return new Promise(async (resolve, reject) => {
        try {
            let optionColor=[];
            let response = await services.Prestashop.getData(credentials,listing);
            let count = await services.Prestashop.getCount(credentials);
            let optionsCms = await services.Prestashop.getOptions(credentials);
            let attributes = await services.Prestashop.getAttributes(credentials);

            let resultOptionsColor = optionsCms.filter(option => option.name.toLowerCase().includes('color'))

            for (const option of resultOptionsColor) {
                optionColor = [...optionColor, ...option.associations.product_option_values];
            }

            let products = response.products.filter(product => product.active == '1')

            if(products){
                products = await imageColor(credentials, products, attributes, optionColor);
            }
            
            let rs = {
                totalRecords : count.products.length,
                pagesCount : Math.ceil((count.products.length / listing.pagination.pageSize)),
                data : products || []
            }
            return resolve(rs);
            
        } catch (error) {
            reject(error);
        }
    });
}

let imageColor = async (credentials, products, attributes, colors) => {
    let resultProducts = [];
    try {
        for (let product of products) {
            let result = getColors(product.associations.product_option_values, attributes, colors);
            if (result.resultColors.length > 1) {
                let variationsColor = await services.Prestashop.getCombinations(credentials, product.id);

                for (let color of result.resultColors) {
                    let variat = variationsColor.filter(p => {
                        let colorVariation = getColors(p.associations.product_option_values, attributes, colors);
                        if (colorVariation.resultColors[0] == color) {
                            return p;
                        }
                    })

                    let images = resultImages(variat[0], credentials)
                    color = color.replace(/\s/g, '').replace(/[0-9]/g, '').replace(/-/g, '')
                    resultProducts.push({
                        ...product,
                        id: product.id + '-' + color,
                        images: images.length > 0 ? images : resultImages(product, credentials)
                    });
                }
            } else {
                let images = resultImages(product, credentials)
                resultProducts.push({...product, images});
            }
        }
    } catch (error) {
        console.log(error);
    }
    return resultProducts;
}

let resultImages = (product, credentials) => {
    let array_id_images = product.associations.images;
    let id_images = [];
    product.images={};
    if(array_id_images && array_id_images.length > 0){
        for (let index = 0; index < array_id_images.length; index++) {
            let id_img = array_id_images[index].id;
            let file = id_img+'.jpg';
            let src = credentials.url+`/${id_img}-home_default/${product.link_rewrite}.jpg`;                      
            let obj = {
                file,
                src
            };
            id_images.push(obj);
        }
    }
    
    return id_images;
}

let getProductId = (credentials, productId) => {
    const moment = require('moment');
    return new Promise(async (resolve, reject) => {
        try {
            let optionColor=[];
            let optionMarca=[];
            let optionTallas=[];
            let resultProducts=[];
            let product = await services.Prestashop.getProductId(credentials,productId);
            let tax_rules = await services.Prestashop.getIdTaxes(credentials);
            let taxes = await services.Prestashop.getTaxes(credentials);
            let discounts = await services.Prestashop.getDiscounts(credentials);
            let optionsCms = await services.Prestashop.getOptions(credentials);
            let discount_names = await services.Prestashop.getDiscountNames(credentials);
            let quantities = await services.Prestashop.getQuantities(credentials);
            let attributes = await services.Prestashop.getAttributes(credentials);
            let combinations;

            let resultOptionsTalla = optionsCms.filter(option => option.name.toLowerCase().includes('talla'))
            let resultOptions = optionsCms.filter(option => option.name.toLowerCase().includes('color'))
            let resultOptionsMarca = optionsCms.filter(option => option.name.toLowerCase().includes('marca'))

            for (const option of resultOptions) {
                optionColor = [...optionColor, ...option.associations.product_option_values];
            }
            for (const option of resultOptionsMarca) {
                optionMarca = [...optionMarca, ...option.associations.product_option_values];
            }
            for (const option of resultOptionsTalla) {
                optionTallas = [...optionTallas, ...option.associations.product_option_values];
            }

            product = product && product.active == '1' ? product : {};

            if(product){
               let products = await productColor(credentials, product, attributes, optionColor, optionMarca);
               taxes.taxes.map((t)=>{
                   products.map((p)=>{
                       let id_tax=tax_rules.find(tr => tr.tax_rules_group = p.id_tax_rules_group).id_tax;
                       if((t.id)==id_tax){
                           p.tax={
                               name:t.name,
                               rate:t.rate
                            }
                        }else{
                            p.tax={
                                name:null,
                                rate:'0'
                            }
                        };
                    });
                });

                for (let index = 0; index < products.length; index++) {
                    let discount=[];
                    let variations_product = [];

                    let disc = discounts.filter(d => (d.id_product == products[index].id)&&(moment(moment(d.to).valueOf()).isSameOrAfter(moment().valueOf())));
                    if(disc.length>1){
                        disc=disc.sort((a,b) => b.from.localeCompare(a.from));
                        disc.length = 1;
                    }
                    disc=disc[0];
                    if(disc){
                        const name = discount_names.find(dn => dn.id == disc.id_specific_price_rule);
                        const resultDiscount = {
                            name: name || products[index].name,
                            from: moment(disc.from).format('YYYY/MM/DD HH:mm:ss'),
                            to: moment(disc.to).format('YYYY/MM/DD HH:mm:ss'),
                            type: disc.reduction_type === 'percentage' ? 'P' : 'C',
                            value: disc.reduction*100
                        };
                        discount.push(resultDiscount);
                    }
                    combinations = products[index].variations;
                    
                    if (combinations) {
                        for (let i = 0; i < combinations.length; i++) {
                            if (combinations[i].associations.product_option_values && combinations[i].associations.product_option_values.length > 0) {
                                for (const option of combinations[i].associations.product_option_values) {
                                    let optionTalla = optionTallas.find(a => a.id == option.id);
                                    if (optionTalla) {
                                        let attr = attributes.product_option_values.find(a => a.id == optionTalla.id);
                                        combinations[i].talla = attr.name;
                                    }
                                }
                            }
                            let id_variation = combinations[i].id;
                            let quantity = quantities.find(q => q.id_product_attribute == id_variation).quantity;
                            
                            combinations[i].quantity = quantity;
                            if(combinations[i].price==0){
                                combinations[i].price=products[index].price;
                            }
                            variations_product.push(combinations[i]);
                        }
                    }

                    let obj = {
                        ...products[index],
                        discount: discount,
                        variations: variations_product
                    }
                    resultProducts.push(obj);
                }
            }

            let rs = {
                data: resultProducts
            }
            return resolve(rs);

        } catch (error) {
            reject(error);
        }
    });
}

let productColor = async (credentials, product, attributes, colors, marcas) => {
    let resultProducts = [];
    try {
        let result = getColors(product.associations.product_option_values, attributes, colors, marcas);
        if (result.resultColors.length > 1) {
            const name = product.name;
            let variationsColor = await services.Prestashop.getCombinations(credentials, product.id);

            for (let color of result.resultColors) {
                let variat = variationsColor.filter(p => {
                    let colorVariation = getColors(p.associations.product_option_values, attributes, colors);
                    if (colorVariation.resultColors[0] == color) {
                        return p;
                    }
                })
                let images = resultImages(variat[0], credentials)
                color = color.replace(/\s/g, '').replace(/[0-9]/g, '').replace(/-/g, '');
                resultProducts.push({
                    ...product,
                    id: product.id + '-' + color,
                    name: name + ' ' + color,
                    color: color,
                    manufacturer_name: result.marca,
                    variations: variat,
                    images: images.length > 0 ? images : resultImages(product, credentials)
                });
            }
        } else {
            let variations = await services.Prestashop.getCombinations(credentials, product.id);
            let images = resultImages(product, credentials)
            resultProducts.push({
                ...product,
                variations: variations,
                images: images,
                color: result.resultColors[0].replace(/\s/g, '').replace(/[0-9]/g, '').replace(/-/g, ''),
                manufacturer_name: result.marca
            });
        }
    } catch (error) {
        console.log(error);
    }
    return resultProducts;
}

let getOrderId = (credentials, orderId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let order = await services.Prestashop.getOrderId(credentials,orderId);
            if (order){
                let customer = await services.Prestashop.getCustomer(credentials,order.id_customer);
                let status = await services.Prestashop.getStatus(credentials,order.current_state);
                let address = await services.Prestashop.getAddress(credentials,order.id_address_delivery);
                let country = await services.Prestashop.getCountry(credentials,address.id_country);
                let state = await services.Prestashop.getState(credentials,address.id_state);
                order.customer = customer;
                order.status = status;
                order.address = address;
                order.address.country = country;
                order.address.state = state;
            }
            return resolve(order);
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = { init, getProducts, getVariations, getProductId, getOrderId, getImages};
