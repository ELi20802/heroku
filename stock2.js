const { MongoClient, ServerApiVersion } = require('mongodb');
const http = require('http');
const url = require('url');

const port = process.env.PORT || 3000;

const mongoUrl = "mongodb+srv://emmali_db_user:MongoDB@cluster0.9rnzlao.mongodb.net/?appName=Cluster0";
const dbName = "Stock";
const collectionName = "PublicCompanies";

const client = new MongoClient(mongoUrl, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectDB() {
    await client.connect();
}
  
connectDB();

const server = http.createServer(async (req, res) => {
const parsedUrl = url.parse(req.url, true);
const pathname = parsedUrl.pathname;

if (pathname == "/" && req.method == "GET") {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
    <html>
    <head><title>Stock Search</title></head>
    <body>
        <h1>Stock Search</h1>
        <form action="/process" method="GET">
        <label>Enter a stock ticker symbol or company name:</label><br>
        <input type="text" name="search" required><br><br>
        
        <label>Search by:</label><br>
        <input type="radio" name="type" value="ticker" checked> Ticker symbol<br>
        <input type="radio" name="type" value="company"> Company name<br><br>
        
        <button type="submit">Search</button>
        </form>
    </body>
    </html>
    `);
}

else if (pathname == "/process" && req.method == "GET") {
    const search = parsedUrl.query.search;
    const type = parsedUrl.query.type;
    
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    
    let results;
    if (type == "ticker") {
        results = await collection.find({ ticker: search }).toArray();
    } else {
        results = await collection.find({ companyName: search }).toArray();
    }
    
        results.forEach(company => {
        console.log(`${company.companyName}, ${company.ticker}, $${company.price}`);
    });

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<html><body>Search complete.<a href="/">Back</a></body></html>');
}
});
server.listen(port);
