import {Request, Response} from 'express';
import { Messages } from '../util/messages';
import { DatabaseController } from '../controllers/Database';
import { GeneralController } from './GeneralController';

class Equipo {

    async getEquipo( request : Request, response : Response ){
        try{
            let equipo_id : any = request.params.id;
            if( equipo_id == undefined || equipo_id == null ){ throw new Error(Messages.ID_ISREQUIRED); }
            let resultQuery = await DatabaseController.simpleSelectById( "equipos", "equipo_id", equipo_id );
            let body = { status : 200, data : resultQuery };
            response.json(body);
        }catch(error : any ){
            let errorBody = { error : error.message };
            response.status(400).send(errorBody);
        }
    }

    async getEquiposByTemporada( request : Request, response : Response ){
        try{
            let temporada_id : any = request.params.id;
            if( temporada_id == undefined || temporada_id == null ){ throw new Error(Messages.TEMPORADA_ID_ISREQUIRED); }
            let resultQuery = await DatabaseController.selectEquipoByTemp(temporada_id); //await DatabaseController.simpleSelectById( "equipos", "temporada_id", temporada_id );
            let body = { status : 200, data : resultQuery };
            response.json(body);
        }catch(error : any ){
            let errorBody = { error : error.message };
            response.status(400).send(errorBody);
        }
    }

    async getEquiposByLiga( request : Request, response : Response ){
        try{
            let liga_id : any = request.params.id;
            if( liga_id == undefined || liga_id == null ){ throw new Error(Messages.LIGA_ID_ISREQUIRED); }
            let resultQuery = await DatabaseController.selectEquipoByLiga(liga_id); //await DatabaseController.simpleSelectById( "equipos", "liga_id", liga_id );
            let body = { status : 200, data : resultQuery };
            response.json(body);
        }catch(error : any ){
            let errorBody = { error : error.message };
            response.status(400).send(errorBody);
        }
    }

    async getEquipos ( request : Request, response : Response ){
        try{
            let { idLiga, idTemporada } = request.params;

            // let resultQuery = await DatabaseController.selectAll( "equipos");
            let resultQuery = await DatabaseController.selectEquipos(Number(idLiga), Number(idTemporada));
            let body = { status : 200, data : resultQuery };
            response.json(body);
        }catch(error : any ){
            let errorBody = { error : error.message };
            response.status(400).send(errorBody);
        }
    }

    async createEquipo( request : Request, response : Response ){
        try{
            if(!request.files){ throw new Error(Messages.IMG_ISREQUIRED); }
            let liga_id : any = request.body.liga_id;
            let temporada_id : any = request.body.temporada_id;
            let nombre_equipo : any = request.body.nombre;
            let activo : boolean = request.body.activo;
            let logo : any = request.files ? request.files.logo : null;
            if( liga_id == undefined || liga_id == null ){ throw new Error(Messages.LIGA_ID_ISREQUIRED); }
            if( temporada_id == undefined || temporada_id == null ){ throw new Error(Messages.TEMPORADA_ID_ISREQUIRED); }
            if( nombre_equipo == undefined || nombre_equipo == null || nombre_equipo.trim() == '' ){throw new Error(Messages.NOMBRE_EQUIPO_ISREQUIRED)}
            //if( logo == undefined || logo == null || logo.length == 0 ){throw new Error(Messages.IMG_ISREQUIRED)}
            let path = request.files ? GeneralController.saveFile(logo) : logo;
            //let path_logo = GeneralController.saveFile(logo);
            let insertData = [liga_id, temporada_id, nombre_equipo, path, activo];
            await DatabaseController.simpleInsert( "equipos", "liga_id, temporada_id, nombre, logo, activo", insertData );
            let body = { status : 200, message : Messages.SUCCESS_INSERT, data : null };
            response.json(body);
        }catch(error : any){
            let errorBody = { error : error.message };
            response.status(400).send(errorBody);
        }
    }

    async updateEquipo( request : Request, response : Response ){
        try{
            let equipo_id : any = request.body.equipo_id;
            let liga_id : any = request.body.liga_id;
            let id_temporada : any = request.body.temporada_id;
            let nombre_equipo : any = request.body.nombre;
            let activo : boolean = request.body.activo;
            let path : string = request.body.logo;
            if( equipo_id == undefined || equipo_id == null ){ throw new Error(Messages.ID_ISREQUIRED); }
            if( liga_id == undefined || liga_id == null ){ throw new Error(Messages.LIGA_ID_ISREQUIRED); }
            if( id_temporada == undefined || id_temporada == null ){ throw new Error(Messages.TEMPORADA_ID_ISREQUIRED); }
            if( nombre_equipo == undefined || nombre_equipo == null || nombre_equipo.trim() == '' ){throw new Error(Messages.NOMBRE_EQUIPO_ISREQUIRED)}
            let updateData = [liga_id, id_temporada, nombre_equipo, activo];
            let fieldsData = ["liga_id", "temporada_id", "nombre", "activo"]
            
            if(request.files){
                let logo : any = request.files.logo;
                path = GeneralController.saveFile(logo);

                updateData.push(path)
                fieldsData.push('logo')
            }

            await DatabaseController.simpleUpdateWithCondition( "equipos", fieldsData, updateData, `equipo_id = ${equipo_id}`  );
            let body = { status : 200, message : Messages.SUCCESS_UPDATE, data : null };
            response.json(body);
        }catch(error : any){
            let errorBody = { error : error.message };
            response.status(400).send(errorBody);
        }
    }

    async deleteEquipo( request : Request, response : Response ){
        try{
            let equipo_id : any = request.params.id;
            if( equipo_id == undefined || equipo_id == null ){ throw new Error(Messages.ID_ISREQUIRED); }
            await DatabaseController.deleteById( "equipos", "equipo_id", equipo_id );
            let body = { status : 200, message : Messages.SUCCESS_DELETE, data : null };
            response.json(body);
        }catch(error : any ){
            let errorBody = { error : error.message};
            response.status(400).send(errorBody);
        }
    }    

}

export const EquipoController = new Equipo();