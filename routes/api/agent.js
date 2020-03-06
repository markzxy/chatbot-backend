"use strict";
const express = require("express");
const router = express.Router();

var mongoUtil = require("helpers/mongoUtil");
var db = mongoUtil.getDbData();
const { WebhookClient } = require("dialogflow-fulfillment");
const info = {};
var currentUsername;
process.env.DEBUG = "dialogflow:debug"; // enables lib debugging statements

const user_db = require('helpers/db');
const User = user_db.User;

var content = "";

function getTimeStr(d) {
    var res = "" + d.getFullYear() + "/" + padZero(d.getMonth() + 1) + 
    "/" + padZero(d.getDate()) + " " + padZero(d.getHours()) + ":" + 
    padZero(d.getMinutes()) + ":" + padZero(d.getSeconds());
    return res;
}
function padZero(num) {
    var result;
    if (num < 10) {
    result = "0" + num;
} else {
    result = "" + num;
}
    return result;
}

router.post("/", async (request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log("Dialogflow Request headers: " + JSON.stringify(request.headers));
  console.log("Dialogflow Request body: " + JSON.stringify(request.body));

  function welcome(agent) {
    const q = `Hi! let's get started. What's your name?`;
    agent.add(q);
    content = content.concat("Q: ", q, "\n");
  }

  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  function handleUserName(agent) {
    const person = agent.parameters.person;

    const username =
      person.name.charAt(0).toUpperCase() + person.name.slice(1).toLowerCase();
    currentUsername = username;

    content = content.concat("A: ", username, "\n\n");

    const q = `Hi ${username}. What is the name of the contact person in your organization?`;
    agent.add(q);

    content = content.concat("Q: ", q, "\n");
  }

  function handleContactName(agent) {
    const person = agent.parameters.person;
    const username =
      person.name.charAt(0).toUpperCase() + person.name.slice(1).toLowerCase();

    info.contactName = username;

    content = content.concat("A: ", username, "\n\n");

    const q = `Great! So the contact person at your company is ${username}.\n   What is their email address?`;
    agent.add(q);

    content = content.concat("Q: ", q, "\n");
  }

  async function handleContactEmail(agent) {
    const email = agent.parameters.email;
    info.contactEmail = email;
    try {
        // response = await db.collection('userInfo').insertOne(info);

        content = content.concat("A: ", email, "\n\n");

        const q = `Great! So their email is ${email}. What is their phone number?`;
        agent.add(q);

        content = content.concat("Q: ", q, "\n");

    } catch (error) {
        console.log(error)
        agent.add("err");

    }
  }

  function handleContactPhone(agent) {
    const phone = agent.parameters["phone-number"];
    info.contactPhone = phone;

    content = content.concat("A: ", phone, "\n\n");

    const q = `Great! So their phone number is ${phone}. What is your organisation's name?`;
    agent.add(q);

    content = content.concat("Q: ", q, "\n");
  }

  function handleOrganisationName(agent) {
    var orgName = agent.parameters["company-name"] //.charAt(0).toUpperCase() + agent.parameters["company-name"].slice(1).toLowerCase();
    orgName = orgName.split(/(\s+)/).filter(e => e.trim().length > 0); // list of trimmed words
    var org = ""
    for (var i = 0; i < orgName.length; i++){
        org = org + (orgName[i].charAt(0).toUpperCase() + orgName[i].slice(1).toLowerCase())
    }

    info.orgName = org;

    content = content.concat("A: ", org, "\n\n");

    const q = `Great! So your organisation is ${org}. What is your organisation's address?`;
    agent.add(q);

    content = content.concat("Q: ", q, "\n");
  }
  

  function handleOrganisationAddress(agent) {
    const orgAddress = agent.parameters.address;
    info.orgAddress = orgAddress;

    content = content.concat("A: ", orgAddress, "\n\n");

    const q = `Great! So your organisation's address is ${orgAddress}. Is your software a Medical Device?`;
    agent.add(q);

    content = content.concat("Q: ", q, "\n");
  }

  async function handleIsMd(agent) {
    const confirmation = agent.parameters.confirmation;
    info.isMd = confirmation;
    
    content = content.concat("A: ", confirmation, "\n\n");

    const q = `Great! Your answer was ${confirmation}.\n   Do you know which class of Medical Device your software belongs to according to MHRA rules?`;
    agent.add(q);

    content = content.concat("Q: ", q, "\n");
  }

  async function handleIsMdYes(agent) {
    // const confirmation = agent.parameters.confirmation;
    // info.isMd = confirmation;

    var a = `Great! You're all set!`;

    content = content.concat("A: ", a, "\n");

    agent.add(a);

    var date = new Date();

    var user = await User.findOne({ username: latest_user_name });
    if(user)
    {
      var date_str = "";
      date_str = getTimeStr(date);

      user.records.push(getTimeStr(date).concat("|", content));
      user.save();

      content = "";
    }
  }

  async function handleIsMdNo(agent) {
    // const confirmation = agent.parameters.confirmation;
    // info.isMd = confirmation;

    var a = `Then let's start figuring it out!`;

    content = content.concat("A: ", a, "\n");

    agent.add(a);

    var date = new Date();

    var user = await User.findOne({ username: latest_user_name });
    if(user)
    {
      user.records.push(getTimeStr(date).concat("|", content));
      user.save();

      content = "";
    }
  }

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set("Default Welcome Intent", welcome);
  intentMap.set("Default Fallback Intent", fallback);
  intentMap.set("User Name", handleUserName);
  intentMap.set("Contact Name", handleContactName);
  intentMap.set("Contact Email", handleContactEmail);
  intentMap.set("Contact Phone Number", handleContactPhone);
  intentMap.set("Organisation Name", handleOrganisationName);
  intentMap.set("Organisation Address", handleOrganisationAddress);
  intentMap.set("Is MD", handleIsMd);
  intentMap.set("Is MD - yes", handleIsMdYes);
  intentMap.set("Is MD - no", handleIsMdNo);

  agent.handleRequest(intentMap);
});

module.exports = router;
