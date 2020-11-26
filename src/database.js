const fs = require("fs");

class FeliDatabase {
    static setKeyValue(file, key, value) {
        const filePath = `database/${file}`;
        const dataJson = JSON.parse(fs.readFileSync(filePath, "utf8"));
        dataJson[encodeURIComponent(key)] = value;
        fs.writeFileSync(filePath, JSON.stringify(dataJson));
    }

    static getKeyValue(file, key) {
        const filePath = `database/${file}`;
        const dataJson = JSON.parse(fs.readFileSync(filePath, "utf8"));
        return dataJson[encodeURIComponent(key)];
    }
}

module.exports = { FeliDatabase };
