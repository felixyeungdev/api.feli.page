const fetch = require("node-fetch");
const { FeliDatabase } = require("./database");

class LookupAddressLatLon {
    static async getLatLon(address) {
        const cachedLatLon = FeliDatabase.getKeyValue(
            "lookupAddressLatLon.json",
            address
        );
        if (cachedLatLon) {
            return {
                address,
                lat: cachedLatLon[0],
                lon: cachedLatLon[1],
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
                FeliDatabase.setKeyValue("lookupAddressLatLon.json", address, [
                    lat,
                    lon,
                ]);
            }

            return {
                address,
                lat,
                lon,
            };
        } catch (error) {
            return null;
        }
    }

    static getLatLonFromLocalDatabase(address) {
        FeliDatabase.getKeyValue("lookupAddressLatLon.json", address);
    }
}

module.exports = { LookupAddressLatLon };
