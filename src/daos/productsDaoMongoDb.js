const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { Container, colProduct } = require('../../src/containers/containerMongoDb');


//Variable para manejo de autorización (configurar en true para administrador
// o false para usuario)
const admin = true;

const isAdmin = (req, res, next) => {
    if (admin === true ) next();
    else res.status(403).send("método no autorizado");
};

//Vista de todos los productos
router.get('/', (req, res) => {
    const entry = JSON.stringify(req.params);
    const getProducts = (async () => {
        const products = await colProduct.getAll();
        const user = req.session.user;
        res.render('home', {products, user});
    }) ();
});


//Para obtener un producto según su id
router.get('/:id', (req, res) => {
    const getProduct = (async () => {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).send({error: "el parámetro no es un número"});
        const productFinded = await colProduct.getById(id);
        if (!productFinded) {
            res.status(404).send({error: "producto no encontrado"});
            console.log("prod no encontrado")
        }
        else {
            const products = productFinded;
            const user = req.session.user;
            console.log("en getbyid user.username", user.username)
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

module.exports = router;