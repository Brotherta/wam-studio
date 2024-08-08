const express= require('express')

const PORT= 7002

const app = express()

/** @type {import('express').RequestHandler} */
const parameters= (req,res,next)=>{
    console.log(req.method, req.url)
    res.set('Access-Control-Allow-Origin',['*'])
    res.set('Cross-Origin-Resource-Policy','cross-origin')
    next()
}

app.use('/', parameters, express.static('static'))
app.use('/', parameters, express.static('bin'))

app.listen(PORT,()=>{
    console.log('Server running on http://localhost:'+PORT)
    setTimeout(()=>{
        console.log('Server still running on http://localhost:'+PORT)
    }, 1000)
})

app.use('/wam_api_library.json', parameters, require('./wam_api_library.js').handler)