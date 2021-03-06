"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseController = void 0;
/* import * as mysql from 'mysql'; */
const messages_1 = require("../util/messages");
const pg_1 = require("pg");
const AuthController_1 = require("./AuthController");
const Email_1 = require("./Email");
const GeneralController_1 = require("./GeneralController");
const crypto = require('crypto');
const connection = new pg_1.Client({
    /*/
    user: 'dev',
    host: process.env.DB_HOST,
    database: 'aposta',
    password: 'test1205',
    port: Number(process.env.DB_PORT),
    /*/
    user: 'postgres',
    database: 'aposta',
    password: '1205',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    //*/
}); //Checar porque no me reconoce los parametros.
class Database {
    constructor() {
        this.runQueryAsync = (query, queryValues) => {
            return new Promise((resolve, reject) => {
                let finalQuery = {
                    text: query,
                    values: queryValues
                };
                connection.query(finalQuery, (err, res) => {
                    if (err)
                        reject(err);
                    else
                        resolve(res);
                });
            });
        };
        try {
            connection.connect();
        }
        catch (error) {
            throw new Error(messages_1.Messages.CANNOT_CONNECT_DB);
        }
    }
    async insertUser(name, username, email, password) {
        let hashPassword = GeneralController_1.GeneralController.generateHash(password);
        let tokenData = GeneralController_1.GeneralController.encodeToken(AuthController_1.AuthController.generateWebToken({ username: username, email: email }));
        let createdOn = new Date();
        let arrValues = [username, hashPassword, email, name, createdOn, false, false, 2, tokenData];
        let selectData = [username, email];
        let selectQuery = 'SELECT * FROM usuarios WHERE username=$1 or email=$2';
        let insertQuery = 'INSERT INTO usuarios(username, password, email, name, created_on, active, validated, role_id, code ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)';
        let checkUserExist = await this.runQueryAsync(selectQuery, selectData).catch((error) => { console.log(error); throw new Error(messages_1.Messages.SINGIN_ERROR); });
        if (checkUserExist.rows.length) {
            throw new Error(messages_1.Messages.ACCOUNT_ALREADY_EXIST);
        }
        let result = await this.runQueryAsync(insertQuery, arrValues).catch((error) => { console.log("error insert"); console.log(error); throw new Error(messages_1.Messages.SINGIN_ERROR); });
        Email_1.EmailController.registerEmail(email, name, tokenData);
        return result;
    }
    async loginUser(username, password) {
        let hashPassword = GeneralController_1.GeneralController.generateHash(password);
        let checkExistData = [username];
        let loginData = [username, hashPassword];
        let selectQuery = 'SELECT * FROM usuarios WHERE username=$1';
        let loginQuery = 'SELECT user_id, name, email, username FROM usuarios WHERE username = $1 AND password = $2';
        let checkUserExist = await this.runQueryAsync(selectQuery, checkExistData).catch((error) => { throw new Error(messages_1.Messages.LOGIN_ERROR); });
        if (!checkUserExist.rows.length) {
            throw new Error(messages_1.Messages.USERNAME_NOT_EXIST);
        }
        let checkLogin = await this.runQueryAsync(loginQuery, loginData).catch((error) => { throw new Error(messages_1.Messages.LOGIN_ERROR); });
        if (!checkLogin.rows.length) {
            throw new Error(messages_1.Messages.WRONG_PASSWORD);
        }
        return checkLogin.rows;
    }
    async confirmCodeActivation(token) {
        let checkExistData = [token];
        let selectQuery = 'SELECT * FROM usuarios WHERE code=$1';
        let checkUserExist = await this.runQueryAsync(selectQuery, checkExistData).catch((error) => { throw new Error(messages_1.Messages.LOGIN_ERROR); });
        if (!checkUserExist.rows.length) {
            throw new Error(messages_1.Messages.USERNAME_NOT_EXIST);
        }
        return checkUserExist.rows;
    }
    async validActivation(user_id) {
        let updateData = [user_id];
        let updateQuery = "UPDATE usuarios SET active = true, validated = true WHERE user_id = $1";
        await this.runQueryAsync(updateQuery, updateData).catch((error) => { throw new Error(messages_1.Messages.VALIDATED_ERROR); });
    }
    async getDataByEmail(email) {
    }
    async insertLiga(nombre, path_img, activo) {
        let updateData = [nombre, path_img, activo];
        let updateQuery = "INSERT INTO ligas( nombre, logo, active ) VALUES($1, $2, $3)";
        await this.runQueryAsync(updateQuery, updateData).catch((error) => { throw new Error(messages_1.Messages.LIGA_INSERT_ERROR); });
    }
    async updateLiga(id, nombre, path_img, activo) {
        let updateData = [id, nombre, path_img, activo];
        let updateQuery = "UPDATE ligas SET nombre = $2, logo = $3, active = $4 WHERE liga_id = $1";
        await this.runQueryAsync(updateQuery, updateData).catch((error) => { throw new Error(messages_1.Messages.QUERY_UPDATE_ERROR); });
    }
    async deleteLiga(id) {
        let deleteData = [id];
        let deleteQuery = "DELETE FROM ligas where liga_id = $1";
        await this.runQueryAsync(deleteQuery, deleteData).catch((error) => { throw new Error(messages_1.Messages.QUERY_DELETE_ERROR); });
    }
    async deleteById(tabla, atributo, atributo_id) {
        let deleteData = [atributo_id];
        let deleteQuery = "DELETE FROM " + tabla + " WHERE " + atributo + " = $1";
        await this.runQueryAsync(deleteQuery, deleteData).catch((error) => { throw new Error(messages_1.Messages.QUERY_DELETE_ERROR); });
    }
    async simpleSelectById(tabla, atributo, atributo_id) {
        let selectData = [atributo_id];
        let selectQuery = "SELECT * FROM " + tabla + " WHERE " + atributo + " = $1";
        let selectResult = await this.runQueryAsync(selectQuery, selectData).catch((error) => { throw new Error(messages_1.Messages.QUERY_SELECT_ERROR); });
        if (!selectResult.rows.length) {
            return null;
        }
        return selectResult.rows;
    }
    async simpleInsert(tabla, atributos, valores) {
        let insetData = valores;
        let queryValues = GeneralController_1.GeneralController.generateDatabaseQueryParam(valores.length);
        let insetQuery = `INSERT INTO ${tabla} ( ${atributos} ) VALUES ( ${queryValues} )`;
        await this.runQueryAsync(insetQuery, insetData).catch((error) => { throw new Error(messages_1.Messages.LIGA_INSERT_ERROR); });
    }
    async simpleUpdateWithCondition(tabla, atributos, valores, condicion) {
        let updateData = valores;
        let queryAtributos = GeneralController_1.GeneralController.generateDatabaseQueryUpdateAtt(atributos);
        let updateQuery = `UPDATE ${tabla} ${queryAtributos} ${condicion}`;
        await this.runQueryAsync(updateQuery, updateData).catch((error) => { throw new Error(messages_1.Messages.QUERY_UPDATE_ERROR); });
    }
    //agregar a la tabla el campo de activo
    async selectAll(tabla) {
        let selectQuery = "SELECT * FROM " + tabla;
        let selectResult = await this.runQueryAsync(selectQuery, null).catch((error) => { throw new Error(messages_1.Messages.QUERY_SELECT_ERROR); });
        if (!selectResult.rows.length) {
            return null;
        }
        return selectResult.rows;
    }
}
exports.DatabaseController = new Database();
