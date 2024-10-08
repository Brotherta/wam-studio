const express= require('express')
const path= require('path')
const fs= require('fs')

/** @type {import('express').RequestHandler} */
const parameters= (req,res,next)=>{
    res.set('Access-Control-Allow-Origin',['*'])
    res.set('Cross-Origin-Resource-Policy','cross-origin')
    next()
}

//// PEDALBOARD 2 FILES ////
/** The request handler that expose files of the bin directory, containing the compiled js files*/
exports.pedalboard2_bin= express.static(path.resolve(__dirname, '../bin'))

/** The request handler that expose files of the static directory, containing the uncompiled files */
exports.pedalboard2_static= new express.Router()
exports.pedalboard2_static.get("*.json",(req,res,next)=>{
    const root= path.resolve(__dirname, '../static')
    const file= path.resolve(root, req.url.slice(1,-5)+".t.json")
    if(path.relative(root,file).startsWith('..')) return next()
    if(!fs.existsSync(file)) return next()
    let content= fs.readFileSync(file,'utf8')
    content=content.replace(/\{\{[A-Z_0-9]+\}\}/g,it=>{
        const value= process.env[it.slice(2,-2)]
        return value ?? it
    })
    res.set('Content-Type','application/json')
    res.status(200).send(content)
})
exports.pedalboard2_static.use(express.static(path.resolve(__dirname, '../static')))
//express.static(path.resolve(__dirname, '../static'))


//// WAM API AS PEDALBOARD 2 LIBRARY ////
const WAM_API_JSON= "https://www.webaudiomodules.com/community/plugins.json"
const WAM_API_BASE="https://www.webaudiomodules.com/community/plugins/"

/**
 * The request handler that expose the WAM API as a Pedalboard2 Library
 * @type {import('express').RequestHandler}
 **/
exports.wam_api_library= async(req,res,next)=>{
    // Get the WAMP API Hostname
    const hostname= req.hostname

    // Fetch the WAM API
    const fetched= await fetch(WAM_API_JSON)
    const json= await fetched.json()

    // Response
    /** @type {import('../src/Pedalboard2Library.ts').Pedalboard2LibraryDescriptor}  */
    const descriptor={
        name: "WAM API Library",
        version: [0,1],
        id: "wamstudio.pedalboard2.wam_api_library",
        permissive: true,
        url:"",
        includes:[],
        plugins:[],
    }
    for(const plugin of json) descriptor.plugins.push(new URL(plugin.path,WAM_API_BASE).href)
    
    res.status(200).json(descriptor)
}
