# Compliance Bot
This project is a smart digital assistant in the form of a chatbot, which will assist users in navigating the large amount of compliance rules that software compliance agencies (MHRA, NICE, NHSD) provide.

## How to run

1. Deploy the server online. There are many ways to do this, the easiest using *ngrok* to expose your local server online.
2. If you choose to use *ngrok*, create a .env file in the root of this project. Then, insert your MONGODB_URI into the file like so: `MONGODB_URI = mongo...`. If you choose to deploy to other platforms such as Heroku, ensure that you set up the MONGODB_URI environment variable.
3. Visit your DialogFlow console, then navigate to fulfillment. There, change the URL to your `*your_url*/api/agent

Your chatbot should now be up and running.