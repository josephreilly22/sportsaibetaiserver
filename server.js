const express = require('express');
const app = express();

// Enviroment Variables
const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT;

const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const helmet = require('helmet');

// Imports
const { getMLBData, updateMLBData, calculatePick, loadLGDataML, loadLGDataOU, getMLBOdds } = require('./getMLBData.js');
const { getMLBResults, getMLBToday, getUsersEmails, getMLBPastResults } = require('./db.js');
const { getNFLData } = require('./getNFLData.js');

app.use(cors());
app.use(morgan('dev'));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(helmet());


// MLB
app.get('/mlbtoday', getMLBToday);
app.get('/mlb', getMLBResults);
app.get('/getMLBData', getMLBData);
app.get('/updateMLBData', updateMLBData);
app.post('/lgDataML', loadLGDataML);
app.post('/lgDataOU', loadLGDataOU);
app.get('/getMLBPrediction', calculatePick);
app.get('/getMLBOdds', getMLBOdds);
app.get('/results', getMLBPastResults);

// NFL
app.get('/getNFLData', getNFLData);

// Users
app.get('/userEmails', getUsersEmails);

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
});