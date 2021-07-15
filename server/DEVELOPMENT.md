# Requirements

- Install docker
- Install Insomnia 
- Install Mongo Compass

# Setup 

1. Clone repo `git clone git@github.com:filoxo/mfe-deps-server.git && cd mfe-deps-server`
1. Install dependencies `yarn`
1. Setup the database `docker compose up -d mongodb`
  - TODO: create seed data for local dev
1. Start server app locally `yarn dev`

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