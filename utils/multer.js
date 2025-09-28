import multer from "multer";
import path from 'path';

export default function upload(getPath){
  const storage = multer.diskStorage({
  destination:(req, file, cb)=>{
    if(file){
      cb(null, 'uploads/'+getPath);
    }else{
      cb(null, false);
    }
  },
  filename:(req, file, cb)=>{
    if(file){
      const ext = path.extname(file.originalname);
      const filename = path.basename(file.originalname, ext);
      cb(null, filename+ext);
    }else{
      cb(null, false)
    }
  }
});

const fileFilter = (req, file, cb)=>{
  if(file.mimetype.startsWith('image/')){
    cb(null, true)
  }else{
    cb(null, false)
  }
};
 return multer({storage, fileFilter});
}
