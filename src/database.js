const fs = require("fs");

class FeliDatabase {
    static setKeyValue(file, key, value) {
        const filePath = `database/${file}`;
        const dataJson = JSON.parse(fs.readFileSync(filePath, "utf8"));
        dataJson[key] = value;
        fs.writeFileSync(filePath, JSON.stringify(dataJson));
    }

    static getKeyValue(file, key) {
        const filePath = `database/${file}`;
        const dataJson = JSON.parse(fs.readFileSync(filePath, "utf8"));
        return dataJson[key];
    }
}

module.exports = { FeliDatabase };
