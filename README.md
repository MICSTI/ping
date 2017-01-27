# ping
Small node.js application to monitor web apps

# Prerequisites for development
- MongoDB
- gulp
- mocha

# Configuration
- in the /config folder, there are sample configuration files
- there needs to be a server.js file for the server configuration. It includes the port, secret JWT key and credentials for sending e-mails.
- there also needs to be a db.local.js file for local database configuration. It takes a MongoDB connection string.
- same goes for the db.production.js file. Which file will be used is determined by the process.env.NODE_ENV variable (defaults to 'development').

# Start app
- npm install
- npm start
- visit <http://localhost:4242>

# Start app in development mode
- make sure development assets are installed
- npm run start:dev

# Create users
- use a tool to make HTTP requests. I recommend [Postman](https://www.getpostman.com/)
- POST http://localhost:4242/api/user
- request body:
```javascript
{
    "username": "John Doe",
    "email": "john.doe@example.com",
    "password": "a very secret password"
}
```
- if request was succesful, the response should be a 201 Created
- if it was not successful, the error message in the body should tell you what went wrong.

# Create sites
- to create a site to be ping'ed, you can either use the user interface or, again, an HTTP tool.
- POST http://localhost:4242/api/sites
- request body:
```javascript
{
	"name": "Westworld API",
	"description": "The official API for the Westworld universe",
	"url": "https://westworld.com/api",
	"active": false,
	"notify": [
		"587e2e6fbad6772e2406c731"
	],
	"maintenance": false,
	"config": {
		"url": "https://westworld.com/api/version",
		"method": "GET",
		"body": null,
		"settings": {
			"intervalInMinutes": 1,
			"notifyAfterXFailures": 1,
			"addRandomParameter": false
		},
		"response": {
			"status": 200,
			"type": "json",
			"data": {
				"version": {
					"type": "String",
					"regex": "^[0-9]+\\.[0-9]+\\.[0-9]+$",
					"showInSummary": true,
					"name": "Version",
					"description": "The version identifier of the current API build"
				},
				"buildNumber": {
					"type": "Number",
					"range": {
						"higher": 11
					},
					"showInSummary": false
				},
				"error": {
					"type": "undefined"
				}
			}
		}
	}
}
```
- or, you on the user interface, you can fill in a simple form where you provide the basic info
- and then supply the data for the "config" property in the JSON editor, for example like this:
```javascript
{
    "url": "https://westworld.com/api/version",
    "method": "GET",
    "body": null,
    "settings": {
        "intervalInMinutes": 1,
        "notifyAfterXFailures": 1,
        "addRandomParameter": false
    },
    "response": {
        "status": 200,
        "type": "json",
        "data": {
            "version": {
                "type": "String",
                "regex": "^[0-9]+\\.[0-9]+\\.[0-9]+$",
                "showInSummary": true,
                "name": "Version",
                "description": "The version identifier of the current API build"
            },
            "buildNumber": {
                "type": "Number",
                "range": {
                    "higher": 11
                },
                "showInSummary": false
            },
            "error": {
                "type": "undefined"
            }
        }
    }
}
```