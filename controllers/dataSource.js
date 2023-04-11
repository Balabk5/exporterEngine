import { model } from 'mongoose'
import aPIkeyandendpoints from '../models/apiData.js'

const dataSource = {
    gettingDataFromAPI: async function(req, res){
        try{

            const apiConfigValues = req.body.values

            console.log(apiConfigValues.apiKey)

            const user = new aPIkeyandendpoints({
                apiKey: apiConfigValues.apiKey,
                Endpoints: apiConfigValues.Endpoints
              });
              
              user.save()
              .then(() => console.log('success'))
              .catch(err => console.error(err));
            res.status(200).send('success')

        }catch(err){
            console.log(err);
        }
        
    },
    
    justtry: async function(req, res){
        res.status(200).send('hi')
    }
}

export default dataSource