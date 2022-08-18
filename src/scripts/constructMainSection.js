const fs = require('fs');
const path = require('path');

module.exports = function constructMainSection(section) {

    return fs.readFileSync(path.join(__dirname, '../sections/' + section + '.html'), 'utf-8')

}