const express = require('express')
const sqlite3 = require('sqlite3')
const app = express()
const cors = require('cors')
const port = 3000
const host = '0.0.0.0';

app.use(express.json())
app.use(cors())

const db = new sqlite3.Database(':memory:')

db.serialize(() => {
  db.run('ATTACH DATABASE db AS rh')
})

app.route('/:schema/:table')

  .get((req, res) => {
    db.all(`select * from ${req.params.schema}.${req.params.table}`, (err, rows) => {
      rows.map((l) => {
        for(const i in l){
            if (i.startsWith('id_')){
              l[i] = String(l[i])
            }
        }
      })

      res.json(rows)
    })
  })

  .post((req, res) => {
    let keys = Object.keys(req.body)
    let values = Object.values(req.body)
    db.run(`insert into ${req.params.schema}.${req.params.table} (${keys.join(", ")}) values (${keys.map(() => "?").join(", ")})`,
      values
      , function () {
        res.setHeader("lastID", this.lastID)
        res.sendStatus(201)
      })
  })

app.route('/:schema/:table/:id')

  .get((req, res) => {
    db.get(`select * from ${req.params.schema}.${req.params.table} where id_${req.params.table} = ${req.params.id}`, (err, row) => {
      row[`id_${req.params.table}`] = String(row[`id_${req.params.table}`])
      res.json(row)
    })
  })

  .put((req, res) => {
    db.run(`UPDATE ${req.params.schema}.${req.params.table} SET ${keysUpdate.join(", ")} WHERE id_${req.params.table} = ${req.params.id}`,
      values
      , function () {
        res.setHeader("changes", this.changes)
        res.sendStatus(204)
      })
  })

  .delete((req, res) => {
    db.run(`DELETE FROM ${req.params.schema}.${req.params.table} WHERE id_${req.params.table} = ${req.params.id}`,
      function () {
        res.setHeader("changes", this.changes)
        res.sendStatus(204)
      })
  })

app.route('/:schema/:table/:id/:other_table')

  .get((req, res) => {
    db.all(`select * from ${req.params.schema}.${req.params.other_table} where id_${req.params.table} = ${req.params.id}`, (err, rows) => {
      rows.map((l) => {
        for(const i in l){
          if (i.startsWith('id_')){
            l[i] = String(l[i]) 
          }
      }
      })
      res.json(rows)
    })    
  })

  .post((req, res) => {
    req.body[`id_${req.params.table}`] = req.params.id
    let keys = Object.keys(req.body)
    let values = Object.values(req.body)
    db.run(`insert into ${req.params.schema}.${req.params.other_table} (${keys.join(", ")}) values (${keys.map(() => "?").join(", ")})`,
      values
      , (err) => {
        res.sendStatus(201)
      })  
  })


app.listen(port, () => {
  console.log(`Example app listening on host ${host} port ${port}`)
})