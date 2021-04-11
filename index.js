const express = require('express');
const app = express();
const port = 3004;
const mongoClient = require('mongodb').MongoClient;
const { ObjectId } = require('mongodb');
(async() => {
    const url = 'mongodb://localhost:27017'
    const dbNome = 'Cadprofessores'
    const cliente = await mongoClient.connect(url, {useUnifiedTopology: true})
    const db = cliente.db(dbNome)

    const professor = db.collection('professores');

     app.use(express.json());


    //Read All (Ler Tudo)
    app.get('/professores', async (req, res) => {
        res.send(await professor.find().toArray())
    })

    //Read Single (Ler individual)
    app.get('/professor/:id',async(req,res)=>{
        const id = req.params.id;
        const mens = await professor.findOne({_id: ObjectId(id)})
        res.send(mens)
        
     });


    //Create single
    app.post('/professor',async(req,res)=>{
        const prof = req.body
        await professor.insertOne(prof).then(result => {
            console.log('Foi inserido %i item!',result.insertedCount)
            console.log(req.body)
            res.send('Professor criado com sucesso')
            return result
          })
          .catch(err => console.error('Falha ao Inserir Documentos: %s',err))
        
    })


     //Create many
     app.post('/professorvarios',async(req,res)=>{
        // no postman tem que ser [{prod1},{prod2}]
        console.log(req.body)
        const professorvarios = req.body
        await professor.insertMany(professorvarios).then(result => {
            console.log('Foram inseridos %i itens!',result.insertedCount)
            console.log(req.body)
            res.send('Professores criados com sucesso')
            return result
          })
          .catch(err => console.error('Falha ao Inserir Documentos: %s',err))

    })
      

    //Update single
    app.put('/professor/alterar/:id',async(req,res)=>{
        const id = req.params.id
        const prof = req.body
        await professor.updateOne(
        {
            _id: ObjectId(id)},
            {
                $set: {...prof}
            }
        )
        res.send('Alteração individual por ID realizada com sucesso')
    });


    //consulta todos os contratos com o inicio in
    app.get('/consultain',async(req,res)=>{
        //usando regex https://chartio.com/resources/tutorials/how-to-use-a-sql-like-statement-in-mongodb/
        //usando o ˆ localizamos apenas o que coemça com 'in'
        msg = await professor.find({ tipocontrato: /^in/ }).toArray()
        res.send(msg)
    })

    //consulta todos os contratos com o inicio det
    app.get('/consultadet',async(req,res)=>{
        msg = await professor.find({ tipocontrato: /^det/ }).toArray()
        res.send(msg)
    })


    //nome e carga horária do professor em que tiver a carg MIN e carga MAX por parametro
    app.get('/cargahoraria/:inicio/:fim', async (req, res) => {
        inicio = parseInt(req.params.inicio)
        fim = parseInt(req.params.fim)
        //$gte: maior ou igual
        //$lte: menor ou igual
        msg = await professor.find({cargahoraria: { $gte: inicio, $lte: fim }}).toArray();
        msg = msg.map(a => { return {nomecompleto: a.nomecompleto, cargahoraria: a.cargahoraria}});
        res.send(msg)
    })


    //nome/nivel/letra detodos os contratos q sao indeterminados
    app.get('/consultaindeterminados', async (req, res) => {
        msg = await professor.find({ tipocontrato: /indeterminado/ }).toArray()
        msg = msg.map(a => {return {nomecompleto: a.nomecompleto, nivel: a.nivel, letra: a.letra}})
        res.send(msg)
    })


    //nivel e letra de todos os professores de A a M
    app.get('/professoresAateM',async(req,res)=>{
        msg = await professor.find({ nomecompleto: /^[A-M]/ }).toArray()
        msg = msg.map(a => {return {nivel: a.nivel, letra: a.letra }})
        res.send(msg)
    })

    //alterar apenas a letra de um professor colocando o codigo e a nova letra por parametro
    app.put('/alteraletra/:codigo/:letra',async(req,res)=>{
        const codigo = req.params.codigo
        const letra = req.params.letra
        const result = await professor.updateOne(
        {
            codigo: codigo.toString()},
            {
                $set: {letra: letra}
            }
        )
        res.send('Alteração individual de letra por ID realizada com sucesso');
    });

    
    //alterar apenas o nivel de um professor colocando o codigo e a novo nivel por parametro
    app.put('/alteranivel/:codigo/:nivel',async(req,res)=>{
        const codigo = req.params.codigo
        const nivel = req.params.nivel
        const result = await professor.updateOne(
        {
            codigo: codigo.toString()},
            {
                $set: {nivel: parseInt(nivel)}
            }
        )
        res.send('Alteração individual de nível por ID realizada com sucesso');
    });

    //remove professor por codigo passado por parametro
    app.delete('/remover/:codigo',async(req,res) =>{
        const codigo = req.params.codigo
        await professor.deleteOne({ codigo: codigo})
        res.send('Professor código: ' + codigo + ' removido com sucesso ')
    })

    //todos os professores de carga horária =0
    app.delete('/cargahoraria/zerada/',async(req,res)=>{
        await professor.deleteMany({ cargahoraria: 0 })
        res.send('Professor(es) removido(s) com sucesso') 
    })

app.listen(port, () => {
  console.info('Servidor rodando em localhost:' + port)
  console.log('Log Servidor')
  console.warn('Warn servidor')
})

})()