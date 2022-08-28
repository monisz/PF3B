const express = require('express');

const routerProducts = require('../daos/productsDao_mysql');
const routerMessages = require('../daos/messagesDao_firebase');
const routerRandom = require('../daos/numbersRandom');

const router = express.Router();

router.use('/api/productos', routerProducts);
router.use('/api/mensajes', routerMessages);
router.use('/api/randoms', routerRandom);

module.exports = router;