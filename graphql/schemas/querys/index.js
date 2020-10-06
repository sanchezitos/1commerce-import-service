const WooCommerceProduct = require('./WooCommerce/wooCommerceProduct.query');
const WooCommerceProductVariation = require('./WooCommerce/wooCommerceProductVariation.query');
const WooCommerceProductImage = require('./WooCommerce/wooCommerceProductImage.query');
const ShopifyProducts = require('./Shopify/shopifyProduct.query.js');
const ShopifyProductVariation = require('./Shopify/shopifyProductVariation.query');
const ShopifyProductImage = require('./Shopify/shopifyProductImage.query');
const VtexProducts = require('./Vtex/vtexProduct.query');
const VtexProductVariation = require('./Vtex/vtexProductVariation.query');
const VtexProductImage = require('./Vtex/vtexProductImage.query');

module.exports = {
    public: {
        WooCommerceProduct,
        WooCommerceProductVariation,
        WooCommerceProductImage,
        ShopifyProducts,
        ShopifyProductVariation,
        ShopifyProductImage,
        VtexProducts,
        VtexProductVariation,
        VtexProductImage
    }
}
