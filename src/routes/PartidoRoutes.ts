import { Router } from 'express';
import { PartidoController } from '../controllers/PartidoController';

class PartidoRouter{

    public router : Router = Router();

    constructor(){
        this.config();
    }

    config() : void {
        this.router.post('/create', PartidoController.createPartido.bind(PartidoController));
        this.router.post('/update', PartidoController.updatePartido.bind(PartidoController));
        this.router.get('/delete/:id', PartidoController.deletePartido.bind(PartidoController));
        this.router.get('/get/:id', PartidoController.getPartido.bind(PartidoController));
        this.router.get('/list/:id', PartidoController.getPartidosByJornada.bind(PartidoController));
    }

}

const PARTIDO_ROUTER = new PartidoRouter();
export default PARTIDO_ROUTER.router;