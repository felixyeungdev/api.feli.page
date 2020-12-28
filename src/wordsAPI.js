const fetch = require("node-fetch");
const express = require("express");
const router = express.Router();

const monk = require("monk");

const wordsDb = monk("mongodb://192.168.1.8:27017/words-feli-page");
const definitionsCollection = wordsDb.get("definitions");

class WordsCache {
    static async saveWord(word, content) {
        if (word != "" && content)
            if (!(await this.getWord(word))) {
                definitionsCollection.insert({
                    word,
                    content,
                    createdAt: Date.now(),
                });
            }
    }

    static async getWord(word) {
        try {
            const cached = await definitionsCollection.findOne({ word });
            return cached.content;
        } catch (error) {
            return null;
        }
    }
}

const APIKEY = process.env.WORDSAPIV1_P_RAPIDAPI_COM;

async function fetchWrapper(link) {
    var response = await fetch(link, {
        method: "GET",
        headers: {
            "x-rapidapi-host": "wordsapiv1.p.rapidapi.com",
            "x-rapidapi-key": APIKEY,
        },
    });
    let json = response.json();
    return json;
}

async function getWordsAPIDataByWord(word) {
    return await fetchWrapper(
        `https://wordsapiv1.p.rapidapi.com/words/${word}`
    );
}
async function getWordsAPIDataByRandom() {
    return await fetchWrapper(
        `https://wordsapiv1.p.rapidapi.com/words/?random=true`
    );
}

class WordsAPI {
    static async getWord(word = "example") {
        const cachedContent = await WordsCache.getWord(word);
        if (cachedContent) return cachedContent;
        let json = await getWordsAPIDataByWord(word);
        if (json) {
            await WordsCache.saveWord(word, json);
        }
        return json;
    }

    static async getRandomWord() {
        let json = await getWordsAPIDataByRandom();
        return json;
    }
}

router.get("/random", async (req, res) => {
    var result;
    try {
        result = await WordsAPI.getRandomWord();
        res.send(result);
    } catch (error) {
        res.status(400).send({});
    }
});

router.get("/define", async (req, res) => {
    var word = req.query.word;
    var result;
    try {
        result = await WordsAPI.getWord(word);
        res.send(result);
    } catch (error) {
        console.log(error);
        res.status(400).send({});
    }
});

async function test() {
    // console.log(await WordsAPI.generateReport());
    console.log(await WordsAPI.generateReportRandomWord());
}

// test();

module.exports = { WordsAPI, wordsAPIRouter: router };
