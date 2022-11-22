/*
* Arquivo primario para a API
* Nome: Arthur Delpupo Coelho
* Matrícula: 20202bsi0012   
*/

// Dependencias

var http = require('http');
var https = require('https')
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');

// Instanciação do servidor HTTP
var httpServer = http.createServer(function(req,res){
    unifiedServer(req,res);
});

// Começar o servidor na porta HTTP
httpServer.listen(config.httpPort,function(){
    console.log("O servidor está ouvindo na porta "+ config.httpPort);
});

// Inicialização do servidor HTTPS
var httpsServerOptions = {
    'key' : fs.readFileSync('./https/key.pem'),
    'cert' : fs.readFileSync('./https/cert.pem')
};

var httpsServer = https.createServer(httpsServerOptions, function(req,res){
    unifiedServer(req,res);
});

// Começar o servidor na porta HTTPS
httpsServer.listen(config.httpsPort,function(){
    console.log("O servidor está ouvindo na porta "+ config.httpsPort);
});



// 
var unifiedServer = function(req,res){
    
    // Pegar a URL e analisá-la
    var parsedUrl = url.parse(req.url,true);
    
    // Pegar o caminho
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g,'');

    // Pegar a consulta da string como um objeto
    var queryStringObject = parsedUrl.query;

    // Pegar o método HTTP
    var method = req.method.toLowerCase();

    // Pegar os cabeçalhos como objetos
    var headers = req.headers;

    // Pegar o payload, se nenhuma 
    var decoder = new StringDecoder('utf-8');
    var buffer = '';

    req.on('data', function(data){
        buffer += decoder.write(data);
    });

    req.on('end',function(data){
        buffer += decoder.end();

        // Escolher o handler que o request irá! Ou o NotFound ou o Sample
        var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound; 
        
        // Construir o objeto a ser mandado para o handler 
        var data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : buffer
        };

        // Escolher a rota do request no roteador específico
        chosenHandler(data,function(statusCode,payload){
            //
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            //
            payload = typeof(payload) == 'object' ? payload : {};
            
            // Converter o payload para string
            var payloadString = JSON.stringify(payload);

            // Retornar o response
            res.writeHead(statusCode);
            res.end(payloadString);

            // Registrar o caminho da request
            console.log('Returning this response:' , statusCode, payloadString)
        });

    });
};




// Definir os handlers
var handlers = {};

// Handler de sample
handlers.sample = function(data, callback){
    callback(406,{'name' : 'sample handler'});
};

// Handler não encontrado
handlers.notFound = function(data,callback){
    callback(404);
};

// Definir um roteador de request
var router = {
    'sample' : handlers.sample
};