'use strict'

const BookModel = require("./books")

function seedBooks() {
  const tobinSpitritGuide = new BookModel({
    title: "Tobin's Spirit Guide",
    description: "Ghostbuster Reference Manual for all paranormal entities",
    status: "In Circulation",
    email: "jp.jones@codefellows.com"
  });
  const spatesCatalog = new BookModel({
    title: "Spates Catalog",
    description: "Ghostbuster Reference Manual for all occult information",
    status: "Not in circulation",
    email: "ryan.galloway@codefellows.com"
  });
  const newRecruit = new BookModel({
    title: "New Recruit Ghostbusting Handbook",
    description: "Doctrine for Ghostbusting Employees",
    status: "LIMDIS",
    email: "jp.jones@codefellows.com"
  });

  tobinSpitritGuide.save();
  spatesCatalog.save();
  newRecruit.save();
}

module.exports = seedBooks;