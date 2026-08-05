const axios = require("axios");

async function geocode(location, country) {
    const query = `${location}, ${country}`;

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query
    )}&format=json&limit=1`;

    const response = await axios.get(url, {
        headers: {
            "User-Agent": "WanderLust-App",
        },
    });

    if (response.data.length === 0) {
        return null;
    }

    return {
        lat: parseFloat(response.data[0].lat),
        lon: parseFloat(response.data[0].lon),
    };
}

module.exports = geocode;