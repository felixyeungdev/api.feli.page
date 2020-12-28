const fetch = require("node-fetch");
const { LatLonDatabase: FeliDatabase } = require("./database");
const sleep = require("./sleep");

const bulkAddressLookupStack = [];
const bulkAddressLookupMax = 5;
var bulkAddressLookupSeed;

function removeItemOnce(arr, value) {
	var index = arr.indexOf(value);
	if (index > -1) {
		arr.splice(index, 1);
	}
	return arr;
}

class LookupAddressLatLon {
	static async getLatLonBulk(addresses = []) {
		const sessionSeed = `${Math.random()}`;
		bulkAddressLookupSeed = sessionSeed;
		for (var address of addresses) {
			if (!bulkAddressLookupStack.includes(address))
				bulkAddressLookupStack.push(address);
		}
		for (let i = 0; i < addresses.length; i += bulkAddressLookupMax) {
			if (sessionSeed != bulkAddressLookupSeed) break;
			for (let j = i; j < i + bulkAddressLookupMax; j++) {
				const promises = [];
				if (j < addresses.length) {
					promises.push(this.getLatLon(addresses[j]));
					removeItemOnce(bulkAddressLookupStack, addresses[j]);
					// console.log(
					//     `Seed ${sessionSeed} == ${bulkAddressLookupSeed} ${addresses[j]}`
					// );
				}
				await Promise.all(promises);
			}
			// console.log(`Loaded ${bulkAddressLookupMax}`);
		}
	}

	static async getAddressesLatLon(addresses) {
		let allLatLon = await FeliDatabase.getAllLatLon();
		allLatLon = allLatLon.map((old) => {
			return {
				address: old["address"],
				lat: old["lat"],
				lon: old["lon"],
			};
		});
		let oldAddresses = [];
		allLatLon = allLatLon.filter((latLon) => {
			oldAddresses.push(latLon["address"]);
			return addresses.includes(latLon["address"]);
		});

		let noResults = addresses.filter(
			(address) => !oldAddresses.includes(address)
		);

		this.getLatLonBulk(noResults);

		return allLatLon;
	}

	static async getLatLon(address) {
		// console.log("Getting " + address);
		const cachedLatLon = await FeliDatabase.getAddressLatLon(address);
		if (cachedLatLon) {
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
			// console.log(error);
			return null;
		}
	}

	static getLatLonFromLocalDatabase(address) {
		FeliDatabase.getAddressLatLon(address);
	}
}

module.exports = { LookupAddressLatLon };
