
const WAM_API_JSON= "https://www.webaudiomodules.com/community/plugins.json"
const WAM_API_BASE="https://www.webaudiomodules.com/community/plugins/"

/** @type {import('express').RequestHandler} */
exports.handler= async(req,res,next)=>{
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