# Prep on the go

A simple app(api) to help (Senior Secondary Certificate Examination) students prepare for their examinations by providing them with free past questions.


![Node.js CI](https://github.com/sircatalyst/prep-on-the-go/workflows/Node.js%20CI/badge.svg?branch=master)


## API Deployed Link

https://prep-on-the-go.herokuapp.com/api/v1


## API Documentation

https://prep-on-the-go.herokuapp.com/swagger


## Built With

- [Html]()
- [CSS]()
- [Node.js](https://nodejs.org/)
- [Typescript](https://www.typescriptlang.org/)
- [Nest.js](https://docs.nestjs.com/)
- [MongoDB](https://www.mongodb.com/)


## For Development

To clone and run this application in development mode, you'll need [Node.js](https://nodejs.org/en/download/), [Git](https://git-scm.com) and  [MongoDB](https://www.mongodb.com/) on your computer.
In your command line, type:

```bash
# Clone this repository
$ git clone https://github.com/sircatalyst/prep-on-the-go.git

# Enter the project directory
$ cd prep-on-the-go

# Install dependencies
$ npm install

# Start the development server
$ npm run start:dev
```
Also, you will need some environment variables to run the application successfully. Check [.envEXAMPLE](.envEXAMPLE) for the environment variables.

With the server running, visit the endpoint below with [Postman](https://www.postman.com/) or any other api testing tool

`GET localhost:3001/api/v1`

```bash
# success request to this GET localhost:3001/api/v1 endpoint will return
{
  "status": 200,
  "data": "Hello World!"
}
```

## For API Documentation

Visit [API Documentation](https://prep-on-the-go.herokuapp.com/swagger)


## Author
- **Temitope Bamidele**
