export let isLogged = false;

export const isAuthHelper = (req)=>{
  if(req?.session?.isLogged && req?.cookies?.user){
      isLogged = true;
  }else{
      isLogged = false;
  }
};

export let stayPath ='/'

export const pathNow = (req)=>{
    if(req.method == "GET"){
        stayPath = req.path
  }
};