const request = require('request');
const dotenv = require('dotenv');
dotenv.config();
const { addMLBGames, updateMLBGames, loadLGDatabaseML, loadLGDatabaseOU, getMLBTodayReturn, getMLBResults, updateMLBPicks, loadMLBOdds, getMLBYesterday } = require('./db');
const { getMLBTime } = require('./getMLBTime');

// Getting ML Pick from Jupyter
const loadLGDataML = (req, res) => {
    if (req.headers['apikey'] == process.env.APIKEY) {
        let bulkData = [];
        for (i = 0 ; i < req.body.length; i++) {
            let teamOnePercentage = req.body[i]['percentage'];
            let gameId = req.body[i]['gameId'];
            console.log(gameId, teamOnePercentage)
            bulkData.push({updateOne: {filter: {gameId: gameId}, update: {$set: {teamOnePercentage}}}})
        }
        console.log(bulkData)
        loadLGDatabaseML(bulkData);
        res.status(200).send();
    } else {
        res.status(401).json({"status": "wrong key"});
    }
}

// Getting OU Pick from Jupyter
const loadLGDataOU = (req, res) => {
    if (req.headers['apikey'] == process.env.APIKEY) {
        let bulkData = [];
        for (i = 0 ; i < req.body.length; i++) {
            bulkData.push({updateOne: {filter: {gameId: req.body[i]["gameId"]},
                update: {$set: {totalScore: req.body[i]["totalScore"]}}}
            })
        }
        loadLGDatabaseOU(bulkData);
        res.status(200).send();
    } else {
        res.status(401).json({"status": "wrong key"});
    }
}

// Get Picks
const calculatePick = async (req, res) => {
    if (req.headers['apikey'] == process.env.APIKEY) {
        const gameData = await getMLBTodayReturn();
        let bulkData = [];
        for (i = 0; i < gameData.length; i++) {
            let pick;
            let predictedWinner;
            let overUnder;
            const favoredArray = gameData[i].odds.favored.split(' ');
            const favoredTeam = favoredArray[0];
            const favoredNum = Number(favoredArray[1].replace('-', ''));

            // Money Line
            // if (gameData[i].teamOneAbbreviation == favoredTeam) {
            //     pick = Math.round(favoredNum/(favoredNum+100)*100);
            //     if ((100*(gameData[i].teamOnePercentage)) > (pick)) {
            //         predictedWinner = gameData[i].teamOne;
            //     } else {
            //         predictedWinner = gameData[i].teamTwo;
            //     }
            // } else {
            //     pick = Math.round(100 - (favoredNum/(favoredNum+100)*100));
            //     if ((100*(gameData[i].teamOnePercentage)) > (pick)) {
            //         predictedWinner = gameData[i].teamOne;
            //     } else {
            //         predictedWinner = gameData[i].teamTwo;
            //     }
            // }
            if (gameData[i].teamOnePercentage >= 0.5) {
                predictedWinner = gameData[i].teamOne;
            } else {
                predictedWinner = gameData[i].teamTwo;
            }

            // Over Under
            if (gameData[i].totalScore > gameData[i].odds.overUnder) {
                overUnder = 'Over'
            } else {
                overUnder = 'Under'
            }

            // Finding best ML odds
            let bestBook = [];
            let bestOdd = -10000;
            let payout;
            let books = gameData[i].sportsOdds;
            let bestUnpredictedBook = [];
            let bestUnpredictedOdd = -10000;
            if(Object.hasOwn(gameData[i], 'sportsOdds')) {

            }
            for (j = 0; j < books.length; j++) {
                if (books[j].markets[0].outcomes[0].name === predictedWinner) {
                    if (books[j].markets[0].outcomes[0].price > bestOdd) {
                        bestBook = [];
                        bestBook.push({bookName: books[j].bookName, price: books[j].markets[0].outcomes[0].price, name: books[j].markets[0].outcomes[0].name});
                        bestOdd = books[j].markets[0].outcomes[0].price;
                    } else if (books[j].markets[0].outcomes[0].price == bestOdd) {
                        bestBook.push({bookName: books[j].bookName, price: books[j].markets[0].outcomes[0].price, name: books[j].markets[0].outcomes[0].name});
                        bestOdd = books[j].markets[0].outcomes[0].price;
                    }
                } else {
                    if (books[j].markets[0].outcomes[1].price > bestOdd) {
                        bestBook = [];
                        bestBook.push({bookName: books[j].bookName, price: books[j].markets[0].outcomes[1].price, name: books[j].markets[0].outcomes[1].name});
                        bestOdd = books[j].markets[0].outcomes[1].price;
                    } else if (books[j].markets[0].outcomes[1].price == bestOdd) {
                        bestBook.push({bookName: books[j].bookName, price: books[j].markets[0].outcomes[1].price, name: books[j].markets[0].outcomes[1].name});
                        bestOdd = books[j].markets[0].outcomes[1].price;
                    }
                }

            }
            for (j = 0; j < books.length; j++) {
                if (books[j].markets[0].outcomes[0].name !== predictedWinner) {
                    if (books[j].markets[0].outcomes[0].price > bestUnpredictedOdd) {
                        bestUnpredictedBook = [];
                        bestUnpredictedBook.push({bookName: books[j].bookName, price: books[j].markets[0].outcomes[0].price, name: books[j].markets[0].outcomes[0].name});
                        bestUnpredictedOdd = books[j].markets[0].outcomes[0].price;
                    } else if (books[j].markets[0].outcomes[0].price == bestOdd) {
                        bestUnpredictedBook.push({bookName: books[j].bookName, price: books[j].markets[0].outcomes[0].price, name: books[j].markets[0].outcomes[0].name});
                        bestUnpredictedOdd = books[j].markets[0].outcomes[0].price;
                    }
                } else {
                    if (books[j].markets[0].outcomes[1].price > bestUnpredictedOdd) {
                        bestUnpredictedBook = [];
                        bestUnpredictedBook.push({bookName: books[j].bookName, price: books[j].markets[0].outcomes[1].price, name: books[j].markets[0].outcomes[1].name});
                        bestUnpredictedOdd = books[j].markets[0].outcomes[1].price;
                    } else if (books[j].markets[0].outcomes[1].price == bestOdd) {
                        bestUnpredictedBook.push({bookName: books[j].bookName, price: books[j].markets[0].outcomes[1].price, name: books[j].markets[0].outcomes[1].name});
                        bestUnpredictedOdd = books[j].markets[0].outcomes[1].price;
                    }
                }

            }
            // Check payout
            bestOdd = Number(bestOdd);
            if (bestOdd > 0) {
                payout = Math.round(bestOdd+100);
            } else {
                payout = Math.round(((100/(bestOdd*-1))*100)+100);
            }
             

            // updateMLBPicks(gameData[i].gameId, predictedWinner, overUnder, bestBook, payout, bestUnpredictedBook);
            const teamToBetOn = predictedWinner;
            bulkData.push({updateOne: {filter: {gameId: gameData[i].gameId}, 
                update: {$set: {teamToBetOn: teamToBetOn, overUnder: overUnder, 
                                bestBook: bestBook, payout: payout, 
                                bestUnpredictedBook: bestUnpredictedBook}}}})
        }
        // updateMLBPicks(bulkData);
        console.log(bulkData)
        res.json({'status': 'done'})
    } else {
        res.status(401).json({"status": "wrong key"});
    }
}

const updateMLBData = async (req, res) => {
    if (true) {
        request(process.env.MLBAPI, function (err, response, body) {
            let gamesToBeUpdated = [];
            if (err) {
                res.status(400).json({"status": err});
            } else {
                const data = JSON.parse(body);

                for (let i = 0; i < data["events"].length; i++) {
                    let winner = null;
                    let teamOneScore = null;
                    let teamTwoScore = null;
                    const gameId = data["events"][i]["id"];


                    // Winner 
                    const winnerOne = data["events"][i]["competitions"][0]["competitors"][0]["winner"];
                    const winnerTwo = data["events"][i]["competitions"][0]["competitors"][1]["winner"];
                    if (winnerOne) {
                        winner = 1;
                    } else if (winnerTwo) {
                        winner = 0;
                    } else {
                        winner = null;
                    }

                    teamOneScore = Number(data["events"][i]["competitions"][0]["competitors"][0]["score"]);
                    teamTwoScore = Number(data["events"][i]["competitions"][0]["competitors"][1]["score"]);

                    let teamOneLineScore;
                    let teamTwoLineScore;
                    if (Object.hasOwn(data["events"][i]["competitions"][0]["competitors"][0], 'linescores')) {
                        teamOneLineScore = data["events"][i]["competitions"][0]["competitors"][0]["linescores"];
                    }
                    if (Object.hasOwn(data["events"][i]["competitions"][0]["competitors"][1], 'linescores')) {
                        teamTwoLineScore = data["events"][i]["competitions"][0]["competitors"][1]["linescores"];
                    }
                    
        

                    // Update
                    teamOneWinner = winner;
                    gamesToBeUpdated.push({updateOne: {filter: {gameId: gameId}, 
                        update: {$set: {teamOneWinner: teamOneWinner, 
                        teamOneScore: teamOneScore, teamTwoScore: teamTwoScore, 
                        teamOneLineScore: teamOneLineScore, teamTwoLineScore: teamTwoLineScore}}}});      
                }
                updateMLBGames(gamesToBeUpdated);
                res.json({'status': 'done'});
            }
        })
    } else {
        res.status(401).json({"status": "wrong key"});
    }
}
 
const getMLBOdds = async (req, res) => {
    if (req.headers['apikey'] == process.env.APIKEY) {
        request(process.env.MLB_ODDS_API, function (err, response, body) {
            if (err) {
                res.status(400).send(err);
            } else {
                let bulkData = [];
                const data = JSON.parse(body);

                // Date and Time
                const dateTimeArray = data[0]["commence_time"].split('T');
                const date = dateTimeArray[0];
                
                // Per game
                for (i = 0; i < data.length; i++) {
                    const teamOne = data[i]["home_team"];
                    const bookmakers = data[i]["bookmakers"];

                    let sportsOdds = [];
                    // Per book
                    for (j = 0; j < bookmakers.length; j++) {
                        const bookName = bookmakers[j]["title"];

                        const markets = bookmakers[j]["markets"];
                        // Per type of odd
                        let market = [];
                        for (z = 0; z < markets.length; z++) {
                            const marketName = markets[z]["key"];
                            const outcomes = markets[z]["outcomes"];
                            market.push({name: marketName, outcomes: outcomes});
                        }
                        sportsOdds.push({bookName: bookName, markets: market});
                    }
                    bulkData.push({updateOne: {filter: {dateOfGame: date, teamOne: teamOne}, 
                        update: {$set: {sportsOdds}}}});
                }
                loadMLBOdds(bulkData);
                res.json(bulkData);
            }
        })
    } else {
        res.status(401).send();
    }
}

const getMLBData = async (req, res) => {
    if (req.headers['apikey'] == process.env.APIKEY) {
        request(process.env.MLBAPI, function (err, response, body) {
            if (err) {
                res.status(400).send(err);
            } else {
                let bulkData = [];
                const data = JSON.parse(body);

                const dateOfGame = data["day"]["date"];

                for (let i = 0; i < data["events"].length; i++) {
                    if (Object.hasOwn(data["events"][i]["competitions"][0]["competitors"][0], 'probables') == true 
                    && Object.hasOwn(data["events"][i]["competitions"][0]["competitors"][1], 'probables') == true 
                    && data["events"][i]["competitions"][0]["competitors"][0]["probables"][0]["statistics"].length > 0
                    && data["events"][i]["competitions"][0]["competitors"][1]["probables"][0]["statistics"].length > 0) {
                    
                        
                        if (Object.hasOwn(data["events"][i]["competitions"][0], 'odds')) {    
                            
                            
                            // Odds
                            const spread = data["events"][i]["competitions"][0]["odds"][0]["spread"];
                            const favored = data["events"][i]["competitions"][0]["odds"][0]["details"];
                            const overUnder = data["events"][i]["competitions"][0]["odds"][0]["overUnder"];

                            // Date and Time
                            const gameId = data["events"][i]["id"];
                            const dateAndTime = data["events"][i]["date"].split("T");
                            const timeWrong = dateAndTime[1];
                            const time = getMLBTime(timeWrong);

                            // Place 
                            const stadium = data["events"][i]["competitions"][0]["venue"]["fullName"];

                            // Team One
                            const teamOne = data["events"][i]["competitions"][0]["competitors"][0]["team"]["displayName"];
                            const teamOneAbbreviation = data["events"][i]["competitions"][0]["competitors"][0]["team"]["abbreviation"];
                            const teamOnePitcherWins = Number(data["events"][i]["competitions"][0]["competitors"][0]["probables"][0]["statistics"][2]["displayValue"]);
                            const teamOnePitcherLosses = Number(data["events"][i]["competitions"][0]["competitors"][0]["probables"][0]["statistics"][1]["displayValue"]);
                            const teamOnePitcherERA = parseFloat(data["events"][i]["competitions"][0]["competitors"][0]["probables"][0]["statistics"][3]["displayValue"]);
                            const teamOneBattingAverage = parseFloat(data["events"][i]["competitions"][0]["competitors"][0]["statistics"][2]["displayValue"]);
                            const teamOneHits = Number(data["events"][i]["competitions"][0]["competitors"][0]["statistics"][0]["displayValue"]);
                            const teamOneRuns = Number(data["events"][i]["competitions"][0]["competitors"][0]["statistics"][1]["displayValue"]);
                            const teamOneWins = Number(data["events"][i]["competitions"][0]["competitors"][0]["statistics"][5]["displayValue"]);
                            const teamOneLosses = Number(data["events"][i]["competitions"][0]["competitors"][0]["statistics"][4]["displayValue"]);
                            const teamOneErrors = Number(data["events"][i]["competitions"][0]["competitors"][0]["statistics"][7]["displayValue"]);

                            const teamOneHomeRecord = (data["events"][i]["competitions"][0]["competitors"][0]["records"][1]["summary"]);
                            const teamOneHomeRecordArray = teamOneHomeRecord.split("-");
                            const teamOneHomeWins = Number(teamOneHomeRecordArray[0]);
                            const teamOneHomeLosses = Number(teamOneHomeRecordArray[1]);



                            // Team Two
                            const teamTwo = data["events"][i]["competitions"][0]["competitors"][1]["team"]["displayName"];
                            const teamTwoAbbreviation = data["events"][i]["competitions"][0]["competitors"][1]["team"]["abbreviation"];
                            const teamTwoPitcherWins = Number(data["events"][i]["competitions"][0]["competitors"][1]["probables"][0]["statistics"][2]["displayValue"]);
                            const teamTwoPitcherLosses = Number(data["events"][i]["competitions"][0]["competitors"][1]["probables"][0]["statistics"][1]["displayValue"]);
                            const teamTwoPitcherERA = parseFloat(data["events"][i]["competitions"][0]["competitors"][1]["probables"][0]["statistics"][3]["displayValue"]);
                            const teamTwoBattingAverage = parseFloat(data["events"][i]["competitions"][0]["competitors"][1]["statistics"][2]["displayValue"]);
                            const teamTwoHits = Number(data["events"][i]["competitions"][0]["competitors"][1]["statistics"][0]["displayValue"]);
                            const teamTwoRuns = Number(data["events"][i]["competitions"][0]["competitors"][1]["statistics"][1]["displayValue"]);
                            const teamTwoWins = Number(data["events"][i]["competitions"][0]["competitors"][1]["statistics"][5]["displayValue"]);
                            const teamTwoLosses = Number(data["events"][i]["competitions"][0]["competitors"][1]["statistics"][4]["displayValue"]);
                            const teamTwoErrors = Number(data["events"][i]["competitions"][0]["competitors"][1]["statistics"][7]["displayValue"]);

                            const teamTwoAwayRecord = (data["events"][i]["competitions"][0]["competitors"][1]["records"][2]["summary"]);
                            const teamTwoAwayRecordArray = teamTwoAwayRecord.split("-");
                            const teamTwoAwayWins = Number(teamTwoAwayRecordArray[0]);
                            const teamTwoAwayLosses = Number(teamTwoAwayRecordArray[1]);

                            bulkData.push({insertOne:{
                                "gameId": gameId,
                                "dateOfGame": dateOfGame,
                                "time": time,
                                "stadium": stadium,
                                "teamOneWinner": null,
                                "odds": {
                                    "favored": favored,
                                    "overUnder": overUnder,
                                    "spread": spread
                                },
                                
                                "teamOne": teamOne,
                                "teamOneAbbreviation": teamOneAbbreviation,
                                "teamOneWins" : teamOneWins,
                                "teamOneLosses": teamOneLosses, 
                                "teamOneRuns": teamOneRuns,
                                "teamOneHits": teamOneHits,
                                "teamOneErrors": teamOneErrors,
                                "teamOneBattingAverage": teamOneBattingAverage,
                                "teamOnePitcherERA": teamOnePitcherERA,
                                "teamOnePitcherLosses": teamOnePitcherLosses,
                                "teamOnePitcherWins": teamOnePitcherWins,
                                "teamOneHomeWins": teamOneHomeWins,
                                "teamOneHomeLosses": teamOneHomeLosses,
                                "teamOneScore": null,

                                "teamTwo": teamTwo,
                                "teamTwoAbbreviation": teamTwoAbbreviation,
                                "teamTwoWins" : teamTwoWins,
                                "teamTwoLosses": teamTwoLosses, 
                                "teamTwoRuns": teamTwoRuns,
                                "teamTwoHits": teamTwoHits,
                                "teamTwoErrors": teamTwoErrors,
                                "teamTwoBattingAverage": teamTwoBattingAverage,
                                "teamTwoPitcherERA": teamTwoPitcherERA,
                                "teamTwoPitcherLosses": teamTwoPitcherLosses,
                                "teamTwoPitcherWins": teamTwoPitcherWins,
                                "teamTwoAwayWins": teamTwoAwayWins,
                                "teamTwoAwayLosses": teamTwoAwayLosses, 
                                "teamTwoScore": null,

                                "teamOnePercentage": null
                            }})
                        }
                    }
                }
                addMLBGames(bulkData);
                res.json({"status": "success"});
            }
        })
    } else {
        res.status(401).json({"status": "wrong key"});
    }
}

module.exports = { getMLBData, updateMLBData, loadLGDataML, calculatePick, loadLGDataOU, getMLBOdds };