const mongoose = require('mongoose');
/* const { mongoDb } = require('../../config'); */

mongoose.connect(process.env.MONGO_DB);
console.log("conectados a mongo");

class Container {
    constructor (collection) {
        this.collection = collection;
        this.id = 1;
    }    

    async save(element) {
        try {
            const allItems = await this.collection.find(); 
            element['id'] = allItems.length + 1;
            try {
                const elementToSave = new this.collection(element)
                await elementToSave.save();
                console.log("agregado exitoso", element.id);
            }
            catch (error) {
                console.log("el error al guardar fue: ", error);
            }
            return element.id;
        }
        catch (error) {
            console.log("error en Save): ", error);
        }
    }
    

    //Agregué este método para complementar el put por id
    async replaceById(idSearch, data) {
        try {
            await this.collection.findOneAndUpdate({id: idSearch}, {$set: data})
            return result = await this.collection.find({id: idSearch})
        }
        catch (error) {
            console.log("error al reemplazar datos: ", error);
        }
    }

    async getById(idSearch) {
        try {
            const objectFinded = await this.collection.find({id: idSearch});
            if (objectFinded.length > 0) {
                const product = productsToShow(objectFinded);
                return product;
            }
            else return null;
        }
        catch (error) {
            console.log("error al buscar por id: ", error);
        }
    }

    async getAll() {
        try {
            const allItems = await this.collection.find();
            const products = productsToShow(allItems);
            return products;
        }
        catch (error) {
            console.log("error en getAll): ", error)
            return [];
        }
    }

    async deleteById(idSearch) {
        try {
            return result = await this.collection.deleteOne({id: idSearch});
        }
        catch (error) {
            console.log("error en deleteById): ", error);
        }
    }
}

const productsSchema = new mongoose.Schema({
    title: {type: String, require: true},
    description: {type: String, require: true},
    code: {type: String, require: true},
    thumbnail: {type: String, require: true},
    price: {type: Number, require: true},
    stock: {type: Number, require: true},
    timestamp: {type: Date, require: true},
    id: {type: Number, require: true}
});

const productsToShow = (items) => {
    let products = [];
    items.forEach(element => {
        products.push(
            {
                code: element.code,
                title: element.title,
                price: element.price,
                thumbnail: element.thumbnail
        })
    });
        return products;
}

const Product = mongoose.model("product", productsSchema);
class Products extends Container {
    constructor() {
        super(Product);
    }
};
const colProduct = new Products();

module.exports = { Container, colProduct };

