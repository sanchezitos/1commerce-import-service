var express = require('express');
var router = express.Router();
const { pubsub }  = require('../services/pubsub.service');
const { WOOCOMMERCE_PRODUCTS }  = require('../graphql/schemas/subscriptions/events');

router.post('/created_product/woocommerce/:key', async (req, res)=>{
    let key = req.params.key;
    let data = {
      productId: req.body.id,
      key,
      channel: 'woocommerce'
    };
    pubsub.publish(WOOCOMMERCE_PRODUCTS, { WoocommerceProducts: data });
    res.json(data);
});

module.exports = router;
