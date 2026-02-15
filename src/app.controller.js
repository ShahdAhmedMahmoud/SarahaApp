import express from 'express'
import checkConnectionDB from './DB/connectionDB.js'
import userRouter from './modules/users/user.controller.js'

const app = express()
const port = 3000


const bootstrap = () =>{
    app.use(express.json())

    app.get('/', (req, res) => res.send('welcome😊'))
 checkConnectionDB();
 app.use("/users",userRouter)
    app.use("{/*demo}",(req,res,next)=>{
        res.status(404).json({message:`${req.originalUrl} not found`})
    })
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

}

export default bootstrap