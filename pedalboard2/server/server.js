const express= require('express')

const app = express()

/** @type {import('express').RequestHandler} */
const parameters= (req,res,next)=>{
    console.log(req.method, req.url)
    res.append('Access-Control-Allow-Origin',['*'])
    next()
}

app.use('/', parameters, express.static('static'))
app.use('/', parameters, express.static('bin'))

app.listen(7009,()=>{
    console.log('Server running on http://localhost:7009')
    setTimeout(()=>{
        console.log('Server still running on http://localhost:7009')
    }, 1000)
})