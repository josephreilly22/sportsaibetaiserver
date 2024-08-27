const dotenv = require('dotenv');
dotenv.config();

const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.ATLAS_URI);

// async function connectDb () {
//     try {
//         const connectClient = await MongoClient.connect(process.env.ATLAS_URI);
//         _db = client.db("sportsai");
//         return _db;
//     } catch (err) {
//         console.error("Error connecting to database", err)
//     }
// }

async function getMLBResults (req, res) {
    if (req.headers["apikey"] == process.env.APIKEY) {
        try {
            await client.connect();
            const games = await client.db('sportsai').collection('mlb').find().toArray();
            res.json(games);
        } catch (err) {
            console.error("Error connecting to database")
        } finally {
            client.close();
        }
    } else {
        res.status(401).json({error: 'not authorized'});
    }
}

async function getMLBToday (req, res) {
    if (req.headers["apikey"] == process.env.APIKEY) {
        try {
            await client.connect();
            const date = new Date();
            const day = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;
            const games = await client.db('sportsai').collection('mlb').find({dateOfGame: day}).toArray();
            res.json(games);
        } catch (err) {
            console.error("Error connecting to database")
        } finally {
            client.close();
        }
    } else {
        res.status(401).json({error: 'not authorized'});
    }
}

async function getMLBYesterday (req, res) {
    if (req.headers["apikey"] == process.env.APIKEY) {
        try {
            await client.connect();
            const date = new Date();
            const day = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + (date.getDate()-1)).slice(-2)}`;
            const games = await client.db('sportsai').collection('mlb').find({dateOfGame: day}).toArray();
            res.json(games);
        } catch (err) {
            console.error("Error connecting to database")
        } finally {
            client.close();
        }
    } else {
        res.status(401).json({error: 'not authorized'});
    }
}

async function getMLBTodayReturn () {
    try {
        await client.connect();
        const date = new Date();
        const day = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;
        const games = await client.db('sportsai').collection('mlb').find({dateOfGame: day}).toArray();
        return games;
    } catch (err) {
        console.error("Error connecting to database", err)
    } finally {
        client.close();
    }
}

async function addMLBGames (bulk) {
    try {
        await client.connect();
        const games = client.db('sportsai').collection('mlb');
        const result = await games.bulkWrite(bulk);
    } catch (err) {
        console.error("Error connecting to database:", err)
    } finally {
        client.close();
    }
}

async function updateMLBGames (bulk) {
    try {
        await client.connect();
        const games = client.db('sportsai').collection('mlb');
        const result = await games.bulkWrite(bulk);
    } catch (err) {
        console.error("Error connecting to database", err);
    } finally {
        await client.close();
    }
}

async function updateMLBPicks (bulk) {
    try {
        await client.connect();
        const games = client.db('sportsai').collection('mlb');
        const result = await games.bulkWrite(bulk);
        // const result = await games.updateOne({gameId: gameId}, {$set: {teamToBetOn: pick, overUnderPick: overUnder, 
        //     bestMLBook: bestMLBook, payout: payout, 
        //     bestUnpredictedBook: bestUnpredictedBook}});
    } catch (err) {
        console.error("Error connecting to database", err);
    } finally {
        await client.close();
    }
}

// async function updateMLBPicks (gameId, pick, overUnder, bestMLBook, payout, bestUnpredictedBook) {
//     const db = await connectDb();
//     const games = await db.collection('mlb');
//     const result = await games.updateOne({gameId: gameId}, {$set: {teamToBetOn: pick, overUnderPick: overUnder, bestMLBook: bestMLBook, payout: payout, bestUnpredictedBook: bestUnpredictedBook}});
// }

async function loadLGDatabaseML (bulk) {
    try {
        await client.connect();
        const games = client.db('sportsai').collection('mlb');
        const result = await games.bulkWrite(bulk);
    } catch (err) {
        console.error("Error connecting to database", err);
    } finally {
        await client.close();
    }
}

async function loadLGDatabaseOU (bulk) {
    try {
        await client.connect();
        const games = client.db('sportsai').collection('mlb');
        const result = await games.bulkWrite(bulk);
    } catch (err) {
        console.error("Error connecting to database", err);
    } finally {
        await client.close();
    }
}

async function loadMLBOdds (bulk) {
    try {
        await client.connect();
        const games = client.db('sportsai').collection('mlb');
        const result = await games.bulkWrite(bulk);
    } catch (err) {
        console.error("Error connecting to database", err);
    } finally {
        await client.close();
    }
}

// async function loadMLBOdds (teamOne, date, odds) {
//     const db = await connectDb();
//     const games = await db.collection('mlb');
//     const result = await games.updateOne({teamOne: teamOne, dateOfGame: date}, {$set: {sportsOdds: odds}})
//     console.log(result);
// }

async function getMLBPastResults (req, res) {
    try {
        await client.connect();
        const days = client.db('sportsai').collection('mlbresults');
        const response = await days.find().toArray();
        let profit= 0;
        let correct = 0
        let incorrect = 0;
        response.map(day => {
            profit += day.profit;
            correct += day.correct;
            incorrect += day.incorrect;
        })
        res.json({profit, correct, incorrect})
    } catch (err) {
        console.error("Error connecting to database", err);
    } finally {
        await client.close();
    }
}



async function addNFLGames (bulk) {
    try {
        await client.connect();
        const games = client.db('sportsai').collection('nfl');
        const result = await games.bulkWrite(bulk);
    } catch (err) {
        console.error("Error connecting to database", err);
    } finally {
        await client.close();
    }
} 

async function getUsersEmails (req, res) {
    if (req.headers['apikey'] == process.env.APIKEY) {
        try {
            await client.connect();
            const users = client.db('sportsai').collection('users');
            const result = await users.find({dailyEmail: true}).project({_id: 0, email: 1}).toArray();
            let emailList = [];
            for (i = 0; i < result.length; i++) {
                emailList.push(result[i]["email"]);
            }
            res.json(emailList.toString());
        } catch (err) {
            console.error("Error connecting to database", err);
        } finally {
            await client.close();
        }
    } else {
        res.status(401).send();
    }
}




module.exports = { getMLBResults, addMLBGames, updateMLBGames, getMLBToday, getMLBYesterday, loadLGDatabaseML, loadLGDatabaseOU, getMLBTodayReturn, updateMLBPicks, loadMLBOdds, getMLBPastResults,
    addNFLGames,
    getUsersEmails
};