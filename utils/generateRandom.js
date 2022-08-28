const generateRandom = (cant) => {
    let nums = {};
    for ( let i = 0; i < cant; i++) {
        let num = (Math.floor(Math.random()*1000)) + 1;
        if (nums[num]) nums[num]++;
        else nums[num] = 1;
    };
    return nums;
}

module.exports = { generateRandom };