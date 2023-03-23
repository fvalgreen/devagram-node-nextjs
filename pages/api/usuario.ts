import type { NextApiRequest, NextApiResponse } from "next";
import { validarTokenJWT } from "@/middlewares/validarTokenJWT";
import { conectarMongoDB } from "@/middlewares/conectarMongoDB";
import type { RespostaPadraoMsg } from "@/types/RespostaPadraoMsg";
import { UsuarioModel } from "@/models/UsuarioModel";
import nc from "next-connect";
import { upload, uploadImagemCosmic } from "@/services/uploadImagemCosmic";
import { politicaCORS } from "@/middlewares/politicaCORS";

const handler = nc().use(upload.single('file')).put( async (req: any, res: NextApiResponse<RespostaPadraoMsg>) =>{
  try {
    const {userID} = req?.query;
    const usuario = await UsuarioModel.findById(userID);

    if(!usuario){
      return res.status(400).json({erro: 'Usuário não encontrado'})
    };

    const {nome} = req.body;
    if(nome && nome.length > 2){
      usuario.nome = nome;
    };

    const {file} = req;
    if(file && file.originalname){
      const image = await uploadImagemCosmic(req);
      console.log(image.media.url)
      console.log(image.media)
      console.log(image)
      if(image && image.media && image.media.url){
        console.log("ok")
        usuario.avatar = image.media.url;
      }
      
    }

    await UsuarioModel.findByIdAndUpdate({_id : usuario._id}, usuario);

    return res.status(200).json({msg: 'Usuário alterado com sucesso'});

  } catch (e) {
    console.log(e);
    return res.status(400).json({erro: 'Não foi possível atualizar o usuário' + e});
  }
  
}).get(
     async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg | any>) => {
    try {
      const {userID} = req?.query;
      const usuario = await UsuarioModel.findById(userID);
      usuario.senha = null;
      return res.status(200).json(usuario);

    } catch (e) {
      console.log(e);
      return res.status(400).json({erro: 'Não foi possível obter dados do usuário'})
    }});

export const config = {
  api: {
    bodyParser: false
  }
}


export default politicaCORS(validarTokenJWT(conectarMongoDB(handler)));
