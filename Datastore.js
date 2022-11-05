const fs = require('fs');
const path = require("path");
module.exports = class Datastore{
  constructor(filename){
    if(!fs.existsSync(filename)) console.log("__HI__");
    this.filename = filename;
    // console.log(fs.readFileSync(filename).toString());
    this.content = fs.readFileSync(this.filename).toString().split("\n").filter(line=>!(line == "")).map(line=>JSON.parse(line));
  }
  findSync(obj){
    if(Object.keys(obj).length == 0){
      return this.content;
    }
    let entries = [];
    for(let i = 0; i < this.content; i++)
      for(let key of Object.keys(obj))
        if(this.content[i].hasOwnProperty() && this.content[i][key] == obj[key])
          entries.push(this.content[i]);
    return entries;
  }
  async find(obj,callback=null){
    if(callback == null){
      throw new Error("No callback provided");
      return;
    }
    let error = null;
    if(Object.keys(obj).length == 0){
      callback(error,this.content);
      return;
    }
    let entries = [];
    for(let i = 0; i < this.content.length; i++){
      for(let key of Object.keys(obj)){
        if(this.content[i].hasOwnProperty(key) && this.content[i][key] == obj[key]){
          entries.push(this.content[i]);
        }
      }
    }
    callback(error,entries);
  }
  writeToFile(callback=null){
    fs.writeFile(this.filename,this.content.map(obj=>JSON.stringify(obj)).join("\n"), {encoding:'utf8',flag:'w'}, (err)=>{
      if(typeof callback !== "function"){
        if(err) throw err;
      } else {
        if(err) return callback(err, false);
        return callback(null, true);
      }
    });
  }
  async update(query,change,callback=null){
    this.find(query,(err,databaseArray)=>{
      if(Object.keys(change).includes("$set")){
        for(let key of Object.keys(change["$set"])){
          for(let elem of databaseArray){
            elem[key] = change["$set"][key];
          }
        }
      }
      this.writeToFile(callback);
    });
  }
  insert(obj, callback=null){
    // fs.appendFile(this.filename, `\n${JSON.stringify(obj)}\n`, err=>{if (err) throw err;});
    this.content.push(JSON.parse(JSON.stringify(obj)));
    this.writeToFile(callback);
  }
  async delete(obj, callback=null){
    this.find(obj, (err, databaseArray)=>{
      if(err) return callback(err, false);
      databaseArray.forEach(entry=>{
        this.content.splice(this.content.indexOf(entry),1);
      });
      this.writeToFile(callback);
    });
  }
  clear(callback=null){
    this.content = [];
    this.writeToFile(callback);
  }
}