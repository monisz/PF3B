const express = require('express');
const { fork } = require('child_process');
const router = express.Router();

//Así estaba en el desafío 28 con fork
/* router.get('/', (req, res) => { */
/*     let cant = parseInt(req.query.cant); */
/*     if (!cant) cant = 1e8; */
/*     const randomFork = fork('src/daos/randomFork.js'); */
/*     randomFork.send(cant);  */
/*     console.log(process.pid) */
/*     randomFork.on('message', (nums) => { */
/*         res.send(nums); */
/*     }); */
/* }); */


// Sin fork
const { generateRandom } = require('../../utils/generateRandom');

router.get('/', (req, res) => {
    let cant = parseInt(req.query.cant);
    if (!cant) cant = 1e8;
    const nums = generateRandom(cant); 
    res.send(nums);
});

module.exports = router;