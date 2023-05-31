//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const e = require("express");
const date = require(__dirname + "/date.js");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
let items = [];

//mongosee , if any errir catching it
main().catch(err => console.log(err));
async function main() {

  // await mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");
  await mongoose.connect("mongodb+srv://admin-praful:fightclub@cluster0.cjm98b0.mongodb.net/todolistDB");

  //creating the shcema
  const itemsSchema = new mongoose.Schema({
    name: {
      type: String,
      // required: [true, "New task can't be blank"]
    }
  })

  //list schema
  const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
  })

  //creating a collection

  const Item = mongoose.model("Item", itemsSchema);

  //List Collection
  const List = mongoose.model("List", listSchema);

  //creating a sample item object
  const item1 = new Item({
    name: "Play Sports"
  });
  const item2 = new Item({
    name: "Eat Food"
  });
  const item3 = new Item({
    name: "Sleep"
  });
  const defaultItems = [item1, item2, item3];
  (items).forEach(function (item) {
    console.log(item.name);
  })



  app.get("/", async function (req, res) {

    // const day = date.getDate();
    // res.render("list", { listTitle: day, newListItems: items });
    console.log(await Item.count({}));
    if (await Item.count({}) == 0) {
      await Item.insertMany(defaultItems);
    }
    items = (await Item.find({}));
    res.render("list", { listTitle: "Today", newListItems: items });
  });

  app.post("/", async function (req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
      name: itemName
    })
    if (listName == "Today") {
      await item.save();
      res.redirect("/");
    }
    else {
      const foundList = (await List.findOne({ name: listName }));
      foundList.items.push(item);
      await foundList.save();
      res.redirect("/" + listName);
    }
  });

  app.post("/delete", async function (req, res) {
    const id = req.body.checkbox
    const list = req.body.listName
    console.log(list);
    if (list == "Today") {
      await Item.findByIdAndDelete(id);
      res.redirect("/");
    }
    else {
      await List.findOneAndUpdate(
        //Find the list that you want to update
        { name: list },
        //What do you want to update
        {
          $pull: { items: { _id: id } }
        }
      );
      res.redirect("/" + list)
    }
    // await Item.deleteOne({ _id: req.body.checkbox });
    // Item.deleteOne({ name: req.body.name });
  })


  app.get("/:customName", async function (req, res) {
    const customName = _.capitalize(req.params.customName);
    const result = await List.findOne({ name: customName })
    if (!result) {
      //if list doesn't exists create a new
      const list = new List({
        name: customName,
        items: defaultItems
      })
      await list.save()
      console.log(customName + " List Created");
      res.redirect("/" + customName)
    }
    else {
      //if list already exits no need to create one just open the already existing one which will be stored in result
      console.log(result.name + " exits");
      res.render("list", { listTitle: customName, newListItems: result.items });
    }
  });

  app.get("/about", function (req, res) {
    res.render("about");
  });

  app.listen(3000, function () {
    console.log("Server started on port 3000");
  });

}