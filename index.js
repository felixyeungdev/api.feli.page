const express = require("express");
const cors = require("cors");
const app = express();
const port = 8010;

const { LookupAddressLatLon } = require("./src/lookupAddressLatLon");

app.use(cors());
app.use(express.json());

app.get("/v1/lookupAddressLatLon", async (req, res) => {
    try {
        const address = decodeURIComponent(req.query.address);
        const data = await LookupAddressLatLon.getLatLon(address);
        res.send({
            status: 200,
            data: {
                ...data,
            },
        });
    } catch (error) {
        res.send({
            status: 400,
            message: "invalid_address",
        });
    }
});
app.post("/v1/lookupAddressesLatLon", async (req, res) => {
    const addresses = req.body;

    if (!addresses || addresses.length <= 0) {
        res.send({
            status: 400,
            message: "invalid_addresses",
        });
        return;
    }
    const data = await LookupAddressLatLon.getAddressesLatLon(addresses);
    res.send({
        status: 200,
        data: data,
    });
});

app.use((req, res) => {
    const code = 404;
    res.status(code).send({
        status: code,
        error: "not_found",
    });
});

app.listen(port, () => console.log(`App running on port ${port}`));
