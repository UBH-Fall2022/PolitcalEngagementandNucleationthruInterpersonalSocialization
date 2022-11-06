const bigml = require('bigml');
const deepnet = new bigml.LocalDeepnet(
     'deepnet/6367247c8be2aa364c004715', new bigml.BigML("owenstuartlee", "7815bbbc18255864b0df322cd83c8723b7a4f68b", {"domain": "bigml.io"}));
module.exports = async function(inputText){
    return new Promise((resolve, reject) => {
        deepnet.predict({"Tweet": inputText}, (err, data)=>{
            if(err){
                return reject(err);
            } score=data["probability"];
            if (data["prediction"]=='Democrat'){
                score*=-1;
            } resolve(score);
        });
    });
}