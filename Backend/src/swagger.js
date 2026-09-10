const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");


const swaggerOptions = {

    definition: {
        openapi: "3.0.0",

        info: {
            title: "E-Commerce Marketplace API",
            version: "1.0.0",
            description: "Multi-Vendor E-Commerce Marketplace Platform API Documentation"
        },

        servers: [
            {
                url: "http://localhost:5000/api",
                description: "Development Server"
            }
        ]
    },


    apis: [
        "./src/routes/**/*.js"
    ]

};


const swaggerDocs = swaggerJsdoc(swaggerOptions);


module.exports = {
    swaggerUi,
    swaggerDocs
};
