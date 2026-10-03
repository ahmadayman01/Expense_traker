//   GET    /api/expenses        return all expenses
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();
const app = express();
app.use(cors());

const pool = new Pool(
    {
           host: process.env.DB_HOST,
           port: process.env.DB_PORT,
           user: process.env.DB_USER,
           password: process.env.DB_PASSWORD,
           database: process.env.DB_NAME,
    } 
)

app.get("/api/expenses" , async(req, res)=>
{
    const  category = req.query.category;
    // console.log("CATEGORY:", category);
    if(category)
    {
        // console.log("FILTER QUERY RUNNING");
        const query = "SELECT id, title, amount::float8 AS amount, category, to_char(date, 'YYYY-MM-DD') AS date FROM expenses WHERE category = $1";
        const result = await pool.query(query, [category]);
        res.json(result.rows);
        return;
    }
    const result = await pool.query("SELECT id , title , amount::float8 as amount  , category , to_char(date , 'YYYY-MM-DD') as date FROM expenses");
    res.json(result.rows);
})


//   GET    /api/expenses/:id    return one expense (404 if not found)
app.get("/api/expenses/:id" , async(req, res)=>
{
    const id = req.params.id;
    const numID = Number(id);
    if(Number.isNaN(numID))
    {
        return res.status(404).json(
            {
                message: "invalid ID , its shuld be Number"
            }
        );

    }
    const result = await pool.query("SELECT id , title , amount::float8 as amount  , category , to_char(date , 'YYYY-MM-DD') as date FROM expenses where id  = $1" , [numID]);
    if(result.rows.length == 0)
    {
               return res.status(404).json(
            {
                message: "invalid ID , this i id is not difinding"
            }
        ); 
    }
    res.json(result.rows[0]);
})
//   POST   /api/expenses        add an expense (201, or 400 if the data is invalid)
app.use(express.json());
app.post("/api/expenses" , async(req , res)=>
{
    const title = req.body.title;
    const amount = req.body.amount;
    const category = req.body.category;
    const date = req.body.date;
    if(!title)
    {
      return  res.status(400).json(
        {
            message: "Bad Request"
        }
        );
    }

    if(Number.isNaN(amount) || amount <= 0 )
    {
        return  res.status(400).json(
        {
            message: "Bad Request"
        }
        );
    }

    const allowedCategories = ["Food" , "Transport" , "Bills" , "Entertainment", "Other"];
    if(!allowedCategories.includes(category))
    {
        return  res.status(400).json(
        {
            message: "Bad Request"
        }
        );
    }
    if(!date)
    {
        return  res.status(400).json(
        {
            message: "Bad Request"
        }
        );
    }
    const result =  await pool.query("INSERT INTO expenses (title, amount, category, date)  VALUES ($1 , $2, $3 ,$4 ) RETURNING *",[title ,amount ,category ,date]);
    res.status(201).json(result.rows[0]);
})  
//   PUT    /api/expenses/:id    update an expense (200, 400, or 404)
app.put("/api/expenses/:id" , async (req ,res)=>
{
    const id  = req.params.id;
    const numID = Number(id);

    if (Number.isNaN(numID)) {
        return res.status(404).json(
            {
                message: "invalid ID , its shuld be Number"
            }
        );
    }

    const title = req.body.title;
    const amount = req.body.amount;
    const category = req.body.category;
    const date = req.body.date;

    if(!title)
    {
      return  res.status(400).json(
        {
            message: "Bad Request"
        }
        );
    }

    if(Number.isNaN(amount) || amount <= 0 )
    {
        return  res.status(400).json(
        {
            message: "Bad Request"
        }
        );
    }

    const allowedCategories = ["Food" , "Transport" , "Bills" , "Entertainment", "Other"];
    if(!allowedCategories.includes(category))
    {
        return  res.status(400).json(
        {
            message: "Bad Request"
        }
        );
    }
    if(!date)
    {
        return  res.status(400).json(
        {
            message: "Bad Request"
        }
        );
    }
    const result = await pool.query("update expenses set title = $1 , amount = $2,  category = $3,  date = $4   where id  = $5   RETURNING *" ,[title, amount, category, date , numID]);
    if(result.rowCount === 0)
    {
       return res.status(404).json({
            message: "Expense not found"
        });
    }

    res.status(200).json(result.rows[0])
});
//   DELETE /api/expenses/:id    delete an expense (200, or 404)
app.delete("/api/expenses/:id" , async (req,res)=>
{
    const id  = req.params.id;
    const numID = Number(id);
    if(Number.isNaN(numID))
    {
         return res.status(404).json({
             message: "invalid ID , its shuld be Number"
        });
    }
    const result = await pool.query("delete from expenses where id  = $1" , [numID]);
    if(result.rowCount === 0)
    {
               return res.status(404).json({
            message: "Expense not found"
        });
    }
    res.status(200).json(
        {
            message : "deleted successfully"
        }
    );
})
//
// Tips:
//   - Create one Pool (from the "pg" library) with the values from .env,
//     and use pool.query(...) in every route.
//   - ALWAYS send the values as parameters: pool.query("... WHERE id = $1", [id]).
//     NEVER build the SQL text by joining strings with data from the user.
//   - Use RETURNING to get the new (or updated) row back from INSERT and UPDATE.
//   - The database creates the id. The client never sends one.
//   - pg returns NUMERIC as text and DATE as a JavaScript Date, so fix both in your SELECT.
//     Hint: amount::float8 and to_char(date, 'YYYY-MM-DD').
//   - Validate the data before the query, and answer 400 with a message that explains the problem.
//   - Check the id before the query. A text like "abc" makes PostgreSQL throw an error.
//   - Enable CORS so the frontend can talk to the server.
//   - Test every endpoint with Thunder Client BEFORE you connect the frontend.
app.listen(3000 , () =>
{
    console.log("server is runing");
})
