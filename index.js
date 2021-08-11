const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const cors = require('@koa/cors');
const WS = require('ws');
const Router = require('koa-router');
const router = new Router();
const idGenerate = require('node-unique-id-generator');

const app = new Koa();
const port = process.env.PORT || 3000;
const user = [];
app
  .use(koaBody({urlencoded: true, multipart: true, json: true,}))
  .use(cors());

router.post('/newuser', async (ctx) => {
    if(Object.keys(ctx.request.body).length === 0){
        ctx.request.body = 'Нет данных'
    }
    const {name} = JSON.parse(ctx.request.body);
    const nameExist = userState.find (user => user.name === name);
    if(!isExist){
        const newUser ={
            id: idGenerate.generateGUID(),
            name:name
        }
        user.push(newUser);
        ctx.response.body = {
            status:'ok',
            user: newUser,
        };
    } else {
        ctx.response.body = {
            status: 'error',
            message:'this name is already exist'
        };
    }
})



app.use(router.routes());




const server = http.createServer(app.callback())
const wsServer = new WS.Server({ server });

wsServer.on('connection', (ws, req) => {
    ws.on('message', msg => {
      const receivedMSG = JSON.parse(msg);
      if (receivedMSG.type === 'exit') {
        const idx = userState.findIndex(user => user.name === receivedMSG.user.name);
        userState.splice(idx, 1);
        [...wsServer.clients]
        .filter(o => o.readyState === WS.OPEN)
        .forEach(o => o.send(JSON.stringify(userState)));
        return;
      }
      if (receivedMSG.type === 'send') {
        [...wsServer.clients]
        .filter(o => o.readyState === WS.OPEN)
        .forEach(o => o.send(msg));
      }    
    });
    [...wsServer.clients]
        .filter(o => o.readyState === WS.OPEN)
        .forEach(o => o.send(JSON.stringify(userState)));  
  });
  
  server.listen(port);