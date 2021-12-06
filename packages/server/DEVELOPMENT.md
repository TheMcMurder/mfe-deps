# Requirements

- Install docker
- Install [Insomnia](https://insomnia.rest/download) 
- Install [Mongo Compass](https://www.mongodb.com/try/download/compass)

# Setup 

1. Setup the database `docker compose up -d mongodb`
  - TODO: create seed data for local dev
1. Start server app locally `yarn dev`

## View DB

1. Open Mongo compass
1. Enter connection: mongodb://user:password@localhost:27017/?authSource=dependencies

## Example POST

```sh
curl --request POST \
  --url http://127.0.0.1:3000/report \
  --header 'Content-Type: application/json' \
  --data '{
  "name": "@example/home",
	"meta": {
		"owner": "Red squad"
	},
  "dependencies": [
    {
      "type": "ES6",
      "import": [
        {
          "type": "default",
          "name": "react"
        }
      ],
      "module": "react",
      "source":
        "src/example-login.tsx",
      "external": true
    },
    {
      "type": "ES6",
      "import": [
        {
          "type": "default",
          "name": "ReactDOM"
        }
      ],
      "module": "react-dom",
      "source":
        "src/example-login.tsx",
      "external": true
    },
    {
      "type": "ES6",
      "import": [
        {
          "type": "default",
          "name": "singleSpaReact"
        }
      ],
      "module": "single-spa-react",
      "source":
        "src/example-login.tsx",
      "external": false
    },
    {
      "type": "ES6",
      "import": [
        {
          "type": "default",
          "name": "React"
        }
      ],
      "module": "react",
      "source":
        "src/root.component.tsx",
      "external": true
    },
    {
      "type": "ES6",
      "import": [
        {
          "type": "specifier",
          "name": "setPublicPath"
        }
      ],
      "module": "systemjs-webpack-interop",
      "source":
        "src/set-public-path.tsx",
      "external": false
    }
  ]
}'
```

// TODO: share requests collection for Insomnia, preferably within this repo as well