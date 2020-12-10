const fs = require("fs");
const monk = require("monk");
const covidHkDb = monk("mongodb://192.168.1.8:27017/covidhk-feli-page");
const latLonCollection = covidHkDb.get("lookupAddressLatLon");

class LatLonDatabase {
    static async getAllLatLon() {
        return await latLonCollection.find({});
    }

    static async setAddressLatLon(address, lat, lon) {
        const existing = await latLonCollection.find({ address });
        if (existing && existing.length >= 1) return;
        await latLonCollection.insert({ address, lat, lon });
    }

    static async getAddressLatLon(address) {
        const result = await latLonCollection.find({ address });
        if (result && result.length > 0) return result[0];
        else return null;
    }
}

// (async function () {
//     const coords = await latLonCollection.find({});
//     console.log(coords);
// })();

module.exports = { LatLonDatabase: LatLonDatabase };
