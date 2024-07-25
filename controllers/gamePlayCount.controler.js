const Response = require("../middleware/Response");
const Validator = require("../middleware/Validations");
const BaseSchema = require("../models/gamePlayCount.model.js");

const create = async (req, res) => {
  try {
    const userId = req.user._id;
    const { gameId } =req.params;
    const { score } =req.body;

    let reqField = { gameId, score };
    if (!Validator.validateReqField(reqField, res)) return null;

    let existingData = await BaseSchema.findOne({ game: gameId, playedBy: userId });

    if (existingData) {
      existingData.session.push({
        createdAt: new Date(),
        score
      });
      await existingData.save();
      Response.success(res, "Data updated", existingData);
    } else {
      const newData = await BaseSchema.create({
        game: gameId,
        playedBy: userId,
        session: {
          createdAt: new Date(),
          score
        }
      });
      Response.success(res, "Data saved", newData);
    }
  } catch (error) {
    console.log(error);
    Response.error(res, "Error", error);
  }
};


const getCount = async (req, res) => {
  try {
    const {userId} =req.params;
    const { date, year, month } =req.body;

    const allExistingData = await BaseSchema.find({ playedBy: userId }).populate('game', 'name');

    if (!allExistingData) {
      return Response.error(res, "Data not found", null, 404);
    }
    
    let data = []

    allExistingData.map(existingData=>{
      let filteredSessions=[];

      if(date){
        //for particular date
        const desiredDate = new Date(date);
        filteredSessions = existingData.session.filter(d => d.createdAt.toISOString().slice(0, 10) === desiredDate.toISOString().slice(0, 10));
        if(filteredSessions.length>0){
          data.push({
            gameName: existingData.game.name,
            count : filteredSessions.length,
            sessions: filteredSessions
          })
        }
      }else if(year && month){
        //for a particular month
        const desiredMonth = new Date(year, month - 1);
        const nextMonth = new Date(year, month);
        const filteredSessions = existingData.session.filter(d => {
          const date = new Date(d.createdAt);
          return date >= desiredMonth && date < nextMonth;
        });
        if(filteredSessions.length>0){
          data.push({
            gameName: existingData.game.name,
            count : filteredSessions.length,
            sessions: filteredSessions
          })
        }
      }else{
        // for all data
        data.push({
          gameName: existingData.game.name,
          count : existingData.session.length,
          sessions: existingData.session
        })
      }
    })
    Response.success(res, "Data fetched", data);
   
  } catch (error) {
    console.log(error);
    Response.error(res, "Error", error);
  }
};


module.exports = {
  create,
  getCount
};
