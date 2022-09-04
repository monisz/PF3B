const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { Container, colProduct } = require('../../src/containers/containerMongoDb');
const logger = require('../../utils/loggers/winston');

//Variable para manejo de autorización
const admin = process.env.ADMIN;

const isAdmin = (req, res, next) => {
    if (admin === true ) next();
    else res.status(403).send("método no autorizado");
};

logger.info(`admin en productdato ${admin}`);

//Vista de todos los productos
router.get('/', (req, res) => {
    const getProducts = (async () => {
        const allProducts = await colProduct.getAll();
        const products = productsToShow(allProducts)
        const user = req.session.user;
        const idCart = req.session.cart;
        res.render('home', {products, user, admin, idCart});
    }) ();
});


//Para obtener un producto según su id
router.get('/:id', (req, res) => {
    const user = req.session.user;
    const getProduct = (async () => {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).send({error: "el parámetro no es un número"});
        const productFinded = await colProduct.getById(id);
        if (!productFinded) {
            res.status(404);
            logger.info("prod no encontrado");
            const products = {};
            res.render('home', {products, user});
        }
        else {
            const products = productsToShow(productFinded);
            res.render('home', {products, user});
        }
    }) ();
});

//Para agregar un producto
router.post('/', isAdmin, (req, res) => {
    const newProduct = req.body;
    newProduct.timestamp = Date.now();
    const getProducts = (async () => {
        const newId = await colProduct.save(newProduct);
        res.send('producto agregado');
    }) ();
});

//Recibe y actualiza un producto por id
router.put('/:id', isAdmin, (req, res) => {
    const updateProduct = (async () => {
        const id = parseInt(req.params.id);
        const newProduct = await colProduct.replaceById(id, req.body);
            if (newProduct.length == 0) res.status(404).send({error: "producto no encontrado"});
            else res.send('producto modificado');
        }) ();
});

//Para borrar un producto según el id
router.delete('/:id', isAdmin, (req, res) => {
    const deleteProduct = (async () => {
        const id = parseInt(req.params.id);
        const result = await colProduct.deleteById(id);
        if (result.deletedCount == 0) res.status(404).send({error: "producto no encontrado"});
        else res.send("producto eliminado");
    }) ();
});

const productsToShow = (items) => {
    let products = [];
    items.forEach(element => {
        products.push(
            {
                id: element.id,
                code: element.code,
                title: element.title,
                price: element.price,
                thumbnail: element.thumbnail
        })
    });
        return products;
}

module.exports = router;