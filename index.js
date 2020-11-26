const express = require("express");
const cors = require("cors");
const app = express();
const port = 8010;

const { LookupAddressLatLon } = require("./src/lookupAddressLatLon");

app.use(cors());

app.get("/v1/lookupAddressLatLon", async (req, res) => {
    const address = decodeURIComponent(req.query.address);
    const data = await LookupAddressLatLon.getLatLon(address);
    res.send({
        status: 200,
        data: {
            ...data,
        },
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
