const fetch = require("node-fetch");
const { LatLonDatabase: FeliDatabase } = require("./database");

class LookupAddressLatLon {
    static async getLatLonBulk(addresses) {}

    static async getAddressesLatLon(addresses) {
        let allLatLon = await FeliDatabase.getAllLatLon();
        allLatLon = allLatLon.map((old) => {
            return {
                address: old["address"],
                lat: old["lat"],
                lon: old["lon"],
            };
        });
        allLatLon = allLatLon.filter((latLon) =>
            addresses.includes(latLon["address"])
        );
        return allLatLon;
    }

    static async getLatLon(address) {
        const cachedLatLon = await FeliDatabase.getAddressLatLon(address);
        if (cachedLatLon) {
            console.log(cachedLatLon);
            return {
                address: cachedLatLon["address"],
                lat: cachedLatLon["lat"],
                lon: cachedLatLon["lon"],
            };
        }
        try {
            const res = await fetch(
                `https://www.als.ogcio.gov.hk/lookup?q=${encodeURIComponent(
                    address
                )}&n=1`,
                {
                    headers: { Accept: "application/json" },
                }
            );

            const resJson = await res.json();
            const geoInfo =
                resJson["SuggestedAddress"][0]["Address"]["PremisesAddress"][
                    "GeospatialInformation"
                ];
            const lat = parseFloat(geoInfo["Latitude"]);
            const lon = parseFloat(geoInfo["Longitude"]);

            if (lat && lon) {
                await FeliDatabase.setAddressLatLon(address, lat, lon);
            }

            return {
                address,
                lat,
                lon,
            };
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    static getLatLonFromLocalDatabase(address) {
        FeliDatabase.getAddressLatLon(address);
    }
}

module.exports = { LookupAddressLatLon };
