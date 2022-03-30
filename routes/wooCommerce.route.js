var express = require('express');
var router = express.Router();
const { pubsub }  = require('../services/pubsub.service');
const { WOOCOMMERCE_PRODUCTS,  WOOCOMMERCE_ORDERS}  = require('../graphql/schemas/subscriptions/events');

router.post('/created_product/woocommerce/:key', async (req, res)=>{
  let key = req.params.key;
  let data = {
    productId: req.body.id,
    key,
    channel: 'woocommerce'
  };

  pubsub.publish(WOOCOMMERCE_PRODUCTS, { WoocommerceProducts: data });
  res.status(200).end();
});

router.post('/created_order/woocommerce/:key', async (req, res)=>{
  let key = req.params.key;

  let data = {
    orderId: req.body.id,
    key,
    channel: 'woocommerce',
  };

  pubsub.publish(WOOCOMMERCE_ORDERS, { WoocommerceOrders: data });

  res.status(200).end();
  
});

router.post('/updated_order/woocommerce/:key', async (req, res)=>{
  let key = req.params.key;

  let data = {
    orderId: req.body.id,
    key,
    channel: 'woocommerce',
  };

  pubsub.publish(WOOCOMMERCE_ORDERS, { WoocommerceOrders: data });

  res.status(200).end();
  
});

module.exports = router;
