# langfish

Langfish is a specialized Go Fish game for language learning.
It is designed to have as few infrastructural needs as possible for easier deployment,
and can be loaded with custom deck templates for your language.

## Deploying the game

The code as written is optimized for deploying on Heroku,
but it doesn't rely on any Heroku-specific infrastructure,
so you should be able to deploy it on your server
or cloud infrastructure of choice.

### Deploying on Heroku

The easiest way to deploy langfish is on Heroku.
Langfish does not require any add-ons or special infrastructure,
so the game should run fine on a free dyno,
without needing to pay for extra resources.

[Because langfish uses Yarn 2 with Plug'n'Play](https://devcenter.heroku.com/articles/migrating-to-yarn-2#update-heroku-environment-with-plug-n-play),
Heroku needs a few settings to be a set a particular way to run the app.
The full process to deploy onto Heroku is:

1. Clone this repository onto your machine.
2. Ensure you [have a Heroku account](https://signup.heroku.com/),
   [have the Heroku CLI installed](https://devcenter.heroku.com/articles/heroku-cli) on your machine,
   and have run `heroku login` on the command line.
3. Create a new app in Heroku by running the following,
   replacing `your-app-name` with the name you want
   for your instance of langfish.
   
   ```bash
   $ heroku apps:create your-app-name
   ```
4. Point langfish at your newly created Heroku app by running
   the following in the project directory you
   created in Step 1,
   replacing `your-app-name` with the name you chose in Step 3.
   
   ```bash
   $ heroku git:remote -a your-app-name
   ```
5. Run the following to set the necessary settings so that
   Heroku will know how to properly build the app.
   This step must be done **before** you push the app.
   If you push the app first and try to fix these settings later,
   it won't work; you'll need to delete the app in Heroku
   and start over from Step 2.
   
   ```bash
   $ heroku config:set NODE_MODULES_CACHE=false
   $ heroku config:unset NPM_CONFIG_PRODUCTION YARN_PRODUCTION
   ```
6. Use the `heroku config:set` command to provide the game with your deck templates.
   See "Deck Template Formats" below for details on how to do this and what your options are.
7. Finally, deploy the app to Heroku by running the following in the project directory!
   
   ```bash
   $ git push heroku main
   ```

### Deploying on other infrastructure

Langfish doesn't depend on any Heroku-specific features,
so you can also deploy it onto your own infrastructure
or a cloud provider of your choice. You will need to:

1. Set a `PORT` environment variable with the port where you want the app to listen.
2. Set an appropriate environment variable with your deck template information.
   See "Deck Template Formats" below for details on how to do this and what your options are.
3. Ensure that [yarn](https://yarnpkg.com/) is installed on the server where you are running the app.
4. Start up the app as follows:
   
   ```bash
   $ yarn install
   $ yarn build
   $ yarn start
   ```

### Deck Template Formats

You have two options for how you provide langfish with your deck templates.
Both ways involve setting an appropriate environment variable on the server
where the app is running. You can:

- Describe your deck templates in a CSV file.
  This file must be publicly accessible on the Internet
  (in an Amazon S3 bucket, for instance).
  Publicly-accessible means anyone can visit the given URL
  and see the contents of the CSV without having to log in to anything.
  
  Set the env variable `LANGFISH_DECK_TEMPLATE_CSV_URL`
  with the CSV file's url.

- Or, set the env variable `LANGFISH_DECK_TEMPLATES` with
  a JSON string containing serialized deck template information.

#### CSV

If you use a CSV file to store your deck template information,
it should look like this:

```csv
Deck Name,Card Name,Image Url
Some Deck Name,first card name,https://url-to-first-card-image.png
Some Deck Name,second card name,https://url-to-second-card-image.png
Some Other Deck Name,first card name,https://url-to-first-card-image.png
Some Other Deck Name,second card name,https://url-to-second-card-image.png
```

The header line **is required**.

Cards will be grouped into decks based on the value of the "Deck Name" column,
so all the cards you want to be in the same deck must have
**exactly** the same value for "Deck Name".
(If you want a card to appear in multiple decks,
you'll need to list it multiple times,
once for each deck.)

The card's Name needs to be unique within a deck.
For example, you can have a card in Deck A named APPLE,
and a card in Deck B named APPLE,
but you should not have two cards in Deck A both named APPLE.

The Image Url must point to a publicly-accessible image.
See "Card Images" below.  

NOTE: To minimize external dependencies, the CSV parser is not fully-featured.
Deck names, card names, and image urls
MUST NOT contain any commas. The parser does not recognize
escape characters.

#### Serialized JSON

You can provide deck template information as a JSON string
with this structure:

```json
[
  {
    "name": "Some Deck",
    "template": [
      {
        "value": "first card name",
        "image": "https://url-to-first-card-image.png"
      },
      {
        "value": "second card name",
        "image": "https://url-to-second-card-image.png"
      }
    ]
  },
  {
    "name": "Some Other Deck",
    "template": [
      {
        "value": "first card name",
        "image": "https://url-to-first-card-image.png"
      },
      {
        "value": "second card name",
        "image": "https://url-to-second-card-image.png"
      }
    ]
  }
]
```

#### Card Images

Card images should ideally be around 150x200 pixels for fastest load times.
They can be any format supported by web browsers,
so your best bet is one of:

- PNG
- GIF
- JPG 

## Notes for developers

### Tech stack

Langfish is written in [Typescript](https://www.typescriptlang.org/).

The backend uses the [Hapi.js](https://hapi.dev/) framework.

The frontend uses [React](https://reactjs.org/) with [Create React App](https://create-react-app.dev/).

The build tool is [Yarn 2](https://yarnpkg.com/) with [Plug'n'Play](https://yarnpkg.com/features/pnp/#gatsby-focus-wrapper).

### Organization

Langfish uses [Yarn workspaces](https://yarnpkg.com/features/workspaces/#gatsby-focus-wrapper)
to modularize the codebase.
Each workspace tackles a specific sub-problem in the system,
so rather than trying to hold the whole system in your head at once,
you can focus on the specific task of the workspace you're in.

- `go-fish-engine` contains the rules of Go Fish.
  It defines a game model that can track things like
  who the players are, who has which cards,
  and what happens when one player gives a card to someone.

- `go-fish-ui` defines the user interface
  that players use to play the game. (It's a React app.)

- `go-fish-gameplay-server-plugin` defines a Hapi server plugin
  with web-socket and API endpoints that can control
  a game of Go Fish. 

- `go-fish-gameplay-client` defines a Javascript object
  you can use in the browser to make calls to the
  `go-fish-gameplay-server-plugin`'s endpoints.

- `go-fish-csv-plugin` defines a Javascript object
  that knows how to fetch a remotely-hosted CSV file
  containing deck template data and process it into
  a list of deck templates the rest of the system
  knows how to use.

- `go-fish-server` collects the various backend components
  and plugs them together into a Hapi server
  that you can deploy and run.

### Local Development

1. Clone the repository to your machine:
   ```bash
   $ git clone https://github.com/cedards/langfish.git
   ```
1. Make sure you [have Yarn installed](https://yarnpkg.com/getting-started/install/#gatsby-focus-wrapper).

1. In the project folder, run:
   ```bash
   $ yarn
   ```
   This will make sure all dependencies are resolved.

1. Next, compile the typescript source and build the React app with:
   ```bash
   $ yarn build
   ```

1. Run the tests!
   ```bash
   $ yarn test
   ```

1. Before you start the app locally,
   you'll need to set an environment variable
   to provide deck template data
   (see "Necessary Environment Variables" above).
   If you don't have your own deck template data yet,
   use this:
   ```bash
   LANGFISH_DECK_TEMPLATE_CSV_URL=https://cloud-cube-us2.s3.amazonaws.com/langfish/public/deck-templates.csv
   ``` 

1. Start the app with:
   ```bash
   yarn start
   ```
   Assuming you don't have a `PORT` environment variable set on your machine,
   this will start the server on port 5000.

1. Optionally, you can also start the Create React App dev server
   in a separate shell with:
   ```bash
   yarn dev-server
   ```
   (Note that the dev server assumes you have the backend running on port 5000.)

#### Notes on workflow

When one workspace depends on another workspace,
it doesn't use its source directly—it uses its compiled build output.
This means that as you work, when you move from one workspace to another,
you need to run `yarn build` to make sure all the workspaces
have access to your changes.

`yarn build` will build *everything*, which can take time
(especially the React app).
If you want to *just* build the workspace you just changed,
you can do that like so
(replacing `whatever-workspace-you-changed` with
the appropriate workspace name):

```bash
yarn workspace @langfish/whatever-workspace-you-changed run build
``` 