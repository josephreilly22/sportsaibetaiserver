const request = require('request');
const dotenv = require('dotenv');
const { addNFLGames } = require('./db');
dotenv.config();

// https://www.kaggle.com/datasets/ruendymendozachavez/nfl-2023-season-dataset (2023 NFL stats for linear regression)

const getNFLData = async (req, res) => {
    if (req.headers['apikey'] == process.env.APIKEY) {
        request(process.env.NFLAPI, function (err, response, body) {
            if (err) {
                    res.json({"status": "NFL API Error"});
            } else {
                const data = JSON.parse(body);

                for (i = 0; i < data["events"].length; i++) {

                    const week = data["week"]["number"];
                    const gameId = data["events"][i]["id"];

                    // Date and Time
                    const dateAndTime = data["events"][i]["competitions"][0]["status"]["type"]["shortDetail"];
                    const dateAndTimeArray = dateAndTime.split("-")
                    const date = dateAndTimeArray[0];
                    const time = dateAndTimeArray[1];

                    // Place
                    const stadium = data["events"][i]["competitions"][0]["venue"]["fullName"];

                    // Odds
                    const favored = data["events"][i]["competitions"][0]["odds"][0]["details"];
                    const overUnder = data["events"][i]["competitions"][0]["odds"][0]["overUnder"];

                    // Team One 
                    const teamOne = data["events"][i]["competitions"][0]["competitors"][0]["team"]["displayName"];
                    const teamTwo = data["events"][i]["competitions"][0]["competitors"][1]["team"]["displayName"];
                    
                    addNFLGames({
                        "gameId": gameId,
                        "week": week,
                        "stadium": stadium,
                        "date": date,
                        "time": time,

                        "odds": {
                            "favored": favored,
                            "overUnder": overUnder
                        },

                        "teamOne": teamOne,
                        "teamTwo": teamTwo
                    })
                
                }
                res.json({"status": "success"});
            }
        })
    } else {
        res.json({"status": "wrong key"});
    }
}

module.exports = { getNFLData };