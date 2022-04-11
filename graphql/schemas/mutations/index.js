const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString
} = require('graphql');

const { addWebhook, updateWebhook, updateVariation } = require('../../../controllers/WooCommerce.controller');
const { addWebhookShopify, deleteWebhookShopify, updateVariationShopify, updateVariationStock } = require('../../../controllers/Shopify.controller');
const { addWebhookVtex, deleteWebhookVtex, updateVariationStockVtex, updateVariationPriceVtex } = require('../../../controllers/Vtex.controller');
const { getToken, validate}  = require('../../../util/auth.util');

const WoocommerceWebHookType = require('../types/wooCommerce/WebHook/WebHook.type');
const ShopifyWebHookType = require('../types/shopify/Webhook/WebHook.type');
const ShopifyDeleteWebHookType = require('../types/shopify/Webhook/deleteWebHook.type');
const VtexWebHookType = require('../types/vtex/Webhook/WebHook.type');
const WebHookInputType = require('./inputs/webhook.input');
const WebHookShopifyInputType = require('./inputs/webhookShopify.input');
const WebHookVtexInputType = require('./inputs/webhookVtex.input');

// Se agrega funcion type para actualizar inventarios y precios
const UpdateVariationInputType = require('./inputs/updateVariation.input');
const WoocommerceUpdateVariationType = require('../types/wooCommerce/Mutations/WoocommerceUpdateProduct.type');
const ShopifyUpdateVariationType = require('../types/shopify/Mutations/ShopifyupdateProduct.type');
const ShopifyUpdateProductStockType = require('../types/shopify/Mutations/ShopifyupdateProductStock.type');
const VtexUpdateProductStockType = require('../types/vtex/Mutations/VtexupdateProductStock.type');
const VtexUpdateProductPriceType = require('../types/vtex/Mutations/VtextupdateProductPrice.type');

const mutations = new GraphQLObjectType({
  name: 'RootMutations',
  description: 'RootMutations',
  fields: {
    createWoocommerceWebHook: {
        description: "create a woocommerce webhook entry",
        type: WoocommerceWebHookType,
        args: {
            input: {type: WebHookInputType}
        },
        resolve: async (root, args, context) => {
          let token = getToken(context.req);
          
          if(!token){
            throw new Error("Auth error token no provided");
          }

          let credentials = validate(token);

          if(!credentials){
            throw new Error("Invalid credential data");
          }

          delete credentials.iat;
          context.req = credentials;
          
          let webhook = await addWebhook(credentials, args.input);
            
          return webhook;
        }
    },
    updateWoocommerceWebHook: {
        description: "update a woocommerce webhook entry",
        type: WoocommerceWebHookType,
        args: {
            webhookId: {type: GraphQLID},
            input: {type: WebHookInputType}
        },
        resolve: async (root, args, context) => {
          let token = getToken(context.req);
          
          if(!token){
            throw new Error("Auth error token no provided");
          }

          let credentials = validate(token);

          if(!credentials){
            throw new Error("Invalid credential data");
          }

          delete credentials.iat;
          context.req = credentials;
          
          let webhook = await updateWebhook(credentials, args.webhookId, args.input);
            
          return webhook;
        }
    },
    deleteWoocommerceWebHook: {
        description: "Delete a woocommerce webhook entry",
        type: WoocommerceWebHookType,
        args: {
            webhookId: {type: GraphQLID}
        },
        resolve: async (root, args, context) => {
            return {};
        }
    },
    createShopifyWebHook: {
      description: "create a shopify webhook entry",
      type: ShopifyWebHookType,
      args: {
        input: {type: WebHookShopifyInputType}
      },
      resolve: async (root, args, context) => {
        let token = getToken(context.req);
        if(!token){
          throw new Error("Auth error token no provided");
        }
        let credentials = validate(token);
        if(!credentials){
          throw new Error("Invalid credential data");
        }
        delete credentials.iat;
        context.req = credentials;
        let webhook = await addWebhookShopify(credentials, args.input);
        return webhook;
      }
    },
    deleteShopifyWebHook: {
      description: "delete a shopify webhook",
      type: ShopifyDeleteWebHookType,
      args: { webhookId: {type: GraphQLString}},
      resolve: async (root, args, context) => {
        let token = getToken(context.req);
        if(!token){
          throw new Error("Auth error token no provided");
        }
        let credentials = validate(token);
        if(!credentials){
          throw new Error("Invalid credential data");
        }
        delete credentials.iat;
        context.req = credentials;
        let webhook = await deleteWebhookShopify(credentials, args.webhookId);
        return webhook;
      }
    },
    createVtexWebHook: {
      description: "create a vtex webhook entry",
      type: VtexWebHookType,
      args: {
        input: {type: WebHookVtexInputType}
      },
      resolve: async (root, args, context) => {
        let token = getToken(context.req);
        if(!token){
          throw new Error("Auth error token no provided");
        }
        let credentials = validate(token);
        if(!credentials){
          throw new Error("Invalid credential data");
        }
        delete credentials.iat;
        context.req = credentials;
        let webhook = await addWebhookVtex(credentials, args.input);
        return webhook;
      }
    },
    deleteVtexWebHook: {
      description: "delete a vtex webhook",
      type: VtexWebHookType,
      args: { webhookId: {type: GraphQLString}},
      resolve: async (root, args, context) => {
        let token = getToken(context.req);
        if(!token){
          throw new Error("Auth error token no provided");
        }
        let credentials = validate(token);
        if(!credentials){
          throw new Error("Invalid credential data");
        }
        delete credentials.iat;
        context.req = credentials;
        let webhook = await deleteWebhookVtex(credentials, args.webhookId);
        return webhook;
      }
    },
    updateVariationWoocommerce: {
      description: "update variations woocommerce",
      type: WoocommerceUpdateVariationType,
      args: {
        productId: {type: GraphQLID},
        variationId: {type: GraphQLID},
        input: {type: UpdateVariationInputType}
      },
      resolve: async (root, args, context) => {
        let token = getToken(context.req);
        if(!token){
          throw new Error("Auth error token no provided");
        }
        let credentials = validate(token);
        if(!credentials){
          throw new Error("Invalid credential data");
        }

        delete credentials.iat;
        context.req = credentials;
        
        let variation = await updateVariation(credentials, args.productId, args.variationId, args.input);
          
        return variation;
      }
    },
    updateVariationShopify: {
      description: "update variations shopify",
      type: ShopifyUpdateVariationType,
      args: {
        productId: {type: GraphQLID},
        variationId: {type: GraphQLID},
        input: {type: UpdateVariationInputType}
      },
      resolve: async (root, args, context) => {
        let token = getToken(context.req);
        if(!token){
          throw new Error("Auth error token no provided");
        }
        let credentials = validate(token);
        if(!credentials){
          throw new Error("Invalid credential data");
        }

        delete credentials.iat;
        context.req = credentials;
        
        let variation = await updateVariationShopify(credentials, args.productId, args.variationId, args.input);
          
        return variation;
      }
    },
    updateVariationShopifyStock: {
      description: "update variations shopify stock",
      type: ShopifyUpdateProductStockType,
      args: {
        productId: {type: GraphQLID},
        variationId: {type: GraphQLID},
        input: {type: UpdateVariationInputType}
      },
      resolve: async (root, args, context) => {
        let token = getToken(context.req);
        if(!token){
          throw new Error("Auth error token no provided");
        }
        let credentials = validate(token);
        if(!credentials){
          throw new Error("Invalid credential data");
        }

        delete credentials.iat;
        context.req = credentials;
        
        let variation = await updateVariationStock(credentials, args.productId, args.variationId, args.input);
          
        return variation;
      }
    },
    updateVariationVtexStock: {
      description: "update variations vtex stock",
      type: VtexUpdateProductStockType,
      args: {
        productId: {type: GraphQLID},
        variationId: {type: GraphQLID},
        input: {type: UpdateVariationInputType}
      },
      resolve: async (root, args, context) => {
        let token = getToken(context.req);
        if(!token){
          throw new Error("Auth error token no provided");
        }
        let credentials = validate(token);
        if(!credentials){
          throw new Error("Invalid credential data");
        }

        delete credentials.iat;
        context.req = credentials;
        
        let variation = await updateVariationStockVtex(credentials, args.productId, args.variationId, args.input);
          
        return variation;
      }
    },
    updateVariationPriceVtex: {
      description: "update variations vtex price",
      type: VtexUpdateProductPriceType,
      args: {
        productId: {type: GraphQLID},
        variationId: {type: GraphQLID},
        input: {type: UpdateVariationInputType}
      },
      resolve: async (root, args, context) => {
        let token = getToken(context.req);
        if(!token){
          throw new Error("Auth error token no provided");
        }
        let credentials = validate(token);
        if(!credentials){
          throw new Error("Invalid credential data");
        }

        delete credentials.iat;
        context.req = credentials;
        
        let variation = await updateVariationPriceVtex(credentials, args.productId, args.variationId, args.input);
          
        return variation;
      }
    },
  }
});

module.exports = { mutations };

        