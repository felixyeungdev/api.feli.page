const fetch = require("node-fetch");

class LookupAddressLatLon {
    static async getLatLon(address) {
        try {
            const res = await fetch(
                "https://www.als.ogcio.gov.hk/lookup?q=$address&n=1",
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

            return {
                address,
                lat,
                lon,
            };
        } catch (error) {
            return null;
        }
    }
}

module.exports = { LookupAddressLatLon };
