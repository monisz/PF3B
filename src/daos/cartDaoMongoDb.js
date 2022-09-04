const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { Container, colProduct, colCart } = require('../../src/containers/containerMongoDb');
const logger = require('../../utils/loggers/winston');
const sendMail = require('../../utils/mailer');
const sendWhatsapp = require('../../utils/whatsapp');

const admin = process.env.ADMIN;

//Para borrar un carrito según su id
router.delete('/:id', (req, res) => {
    const deleteCart = (async () => {
        const id = parseInt(req.params.id);
        const result = await colCart.deleteById(id);
        if (!result) res.status(404).send({error: "carrito no encontrado"});
        else res.send("carrito eliminado");
    }) ();
});

//Para listar todos los productos de un carrito según su id
router.get('/:id/productos', (req, res) => {
    let idCart = 0;
    if (req.params.id) idCart = parseInt(req.params.id);
    else idCart = req.session.cart;
    const getCart = (async () => {
        if (isNaN(idCart)) return res.status(400).send({error: "el parámetro no es un número"});
        const cart = await colCart.getById(idCart);
        if (!cart) res.status(404).send({error: "carrito no encontrado"});
        else {
            logger.info(`cart en get/ ${cart}`);
            const user = req.session.user;
            const productsInCart = cart[0].products;
            res.render('home', {cart, productsInCart, user, admin, idCart});
        }
    }) ();
});


//Para agregar un producto al carrito por id del producto
//el id del carrito es el de la session
router.post('/:id/productos', (req, res) => {
    const idProduct = parseInt(req.params.id);
    const user = req.session.user;
    const addProductToCart = (async () => {
        const idCart = req.session.cart;
        logger.info(`en post idCart ${idCart} y idProduct ${idProduct}`);
        const getProduct = (async () => {
            if (isNaN(idProduct)) return res.status(400).send({error: "el parámetro no es un número"});
            const productToAdd = await colProduct.getById(idProduct);
            if (!productToAdd) res.status(404).send({error: "producto no encontrado"});
            else {
                const getCart = (async () => {
                    const cart = await colCart.getById(idCart);
                    if (!cart) res.send('error: no existe ese carrito');
                    else {
                        cart[0].products.push(productToAdd[0]);
                        const updateCart = (async () => {
                            const cartModified = await colCart.replaceById(idCart, cart[0]);
                            const productsInCart = cartModified[0].products;
                            logger.info(`producto id: ${idProduct} agregado en carrito id: ${idCart}`);
                            res.render('home', {user, admin, cartModified, cart, productsInCart, idCart});
                        }) ();
                    }
                }) ();
            }
        }) ();
    }) ();
});
    
//Elimina del carrito id el producto id_prod
router.delete('/:id/productos/:id_prod', (req, res) => {
    const idCart = parseInt(req.params.id);
    const idProduct = parseInt(req.params.id_prod);
    if ( isNaN(idCart) || isNaN(idProduct) ) return res.status(400).send({error: "algún parámetro no es un número"});
    else {
        const getCart = (async () => {
            const cart = await colCart.getById(idCart)
            if (!cart) res.send('error: no existe ese carrito');
            else {
                const productFind = cart[0].products.find((elem) => elem.id === idProduct);
                if (!productFind) res.send('error: no existe ese producto en el carrito');
                else {
                    cart[0].products = cart[0].products.filter((elem) => elem.id !== idProduct);
                    const updateCart = (async () => {
                        const cartModified = await colCart.replaceById(idCart, cart[0]);
                        logger.info(`carrito modificado ${cartModified[0]}`)
                        res.send(`producto id: ${idProduct} eliminado del carrito id: ${idCart}`);
                    }) ();
                }
            }
        }) ();
    }
});

//Al finalizar la compra 
router.post('/compra', (req, res) => {
    const idCart = req.session.cart;
    const getCart = (async () => {
        const cart = await colCart.getById(idCart);
        if (!cart) res.status(404).send({error: "carrito no encontrado"});
        else {
            const productsInCart = cart[0].products
            const user = req.session.user;
            sendWhatsapp(user);
            const dataToSend = {
                user: user,
                products: productsInCart
            }
            sendMail(dataToSend);
            logger.info(`productos comprados ${cart[0].products}`);
            res.render('home', {cart, productsInCart, user, admin, idCart, dataToSend});
        }
    }) ();
}) 

module.exports = router;

