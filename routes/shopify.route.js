const express = require('express');
const router = express.Router();
const { pubsub }  = require('../services/pubsub.service');
const { SHOPIFY_PRODUCTS, SHOPIFY_ORDERS }  = require('../graphql/schemas/subscriptions/events');

router.post('/shopify/createproduct/:key/:discount', async (req, res)=>{
  const key = req.params.key;
  let data = {
    productId: req.body.id,
    key,
    channel: 'shopify'
  };
  pubsub.publish(SHOPIFY_PRODUCTS, { ShopifyProducts: data });
  res.json(data);
});

router.post('/shopify/createorder/:key', async (req, res)=>{
  const key = req.params.key;
  let data = {
    orderId: req.body.id,
    key,
    channel: 'shopify',
  };
  pubsub.publish(SHOPIFY_ORDERS, { ShopifyOrders: data });
  res.json(data);
});

module.exports = router;
