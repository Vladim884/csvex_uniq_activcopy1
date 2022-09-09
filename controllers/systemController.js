const User = require("../models/User")


class systemController {
    async getAccessToStart(req, res, next) {
        try {
            const user = await User.findOne({_id: req.user.id})
            if(+user.daysLeft < 1){
                res.render('./cabinet', {
                    user : req.user // get the user out of session and pass to template
                })
            } else
            //   if  (+user.daysLeft === 1 || +user.daysLeft > 1)
                   {
                res.render('./start', {
                    user : req.user // get the user out of session and pass to template
                })
            }
        } catch (err) {
            next(err)
        }
      }
}

module.exports = new systemController()