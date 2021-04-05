# langfish

Langfish is a specialized Go Fish game for language learning.
It is designed to have as few infrastructural needs as possible for easier deployment,
and can be loaded with custom deck templates for your language.

## Deploying the game

The code as written is optimized for deploying on Heroku,
but it doesn't rely on any Heroku-specific infrastructure,
so you should be able to deploy it on your server
or cloud infrastructure of choice.

### Necessary environment variables

The system expects the following environment variables to be set when it starts:

- `PORT`: The port on which the server should start.
  If not set, this will default to 5000.
- One of the following (see "Deck Template Formats" below):
  - `LANGFISH_DECK_TEMPLATE_CSV_URL`:
    a url pointing to a publicly-accessible CSV file
    containing deck template information.
    (Publicly-accessible means anyone can visit the given URL
    and see the contents of the CSV without having to log in to anything.)
  - `LANGFISH_DECK_TEMPLATES`: a JSON string
    containing serialized deck template information.

If you are deploying on Heroku, there are a few other variables
you may need to update,
[since langfish uses Yarn 2 with Plug'n'Play](https://devcenter.heroku.com/articles/migrating-to-yarn-2#update-heroku-environment-with-plug-n-play):

```bash
$ heroku config:set NODE_MODULES_CACHE=false
$ heroku config:unset NPM_CONFIG_PRODUCTION YARN_PRODUCTION
```

### Startup process

The server follows the typical pattern for starting up Node.js applications:

```bash
$ npm install
$ npm build
$ npm start
```
(If you're deploying on Heroku, Heroku will do this by default
and shouldn't need any help.)

### Deck Template Formats

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

The card's Name will appear in the list when users are selecting
which cards to include in a given game.

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
They can be any formatted supported by web browsers,
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