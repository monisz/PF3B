const { generateRandom } = require('../../utils/generateRandom');

process.on('message', (cant) => {
        const nums = generateRandom(cant);
        process.send(nums);
});
