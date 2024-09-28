const express= require('express')
const path= require('path')

const directory= path.resolve(__dirname, '..')

/** @type {import('express').RequestHandler} */
const parameters= (req,res,next)=>{
    console.log(req.method, req.url)
    res.set('Access-Control-Allow-Origin',['*'])
    res.set('Cross-Origin-Resource-Policy','cross-origin')
    next()
}


//// PEDALBOARD 2 FILES ////
/** The request handler that expose files of the bin directory, containing the compiled js files*/
exports.pedalboard2_bin= express.static(path.resolve(__dirname, '../bin'))

/** The request handler that expose files of the static directory, containing the uncompiled files */
exports.pedalboard2_static= express.static(path.resolve(__dirname, '../static'))



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
    
    res.json(descriptor)
}
