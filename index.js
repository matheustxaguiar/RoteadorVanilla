 /**
  * PRimary faile for the API
  */
 
 var http = require('http');
 var url = require('url');
 var StringDecoder = require('string_decoder').StringDecoder;

 // Servidor responde todas requisições com string
 var server = http.createServer(function(req, res){

    // Pega a URL
    var parseURL = url.parse(req.url, true);


    // Pega o caminho
    var path = parseURL.pathname;
    var trimmePath = path.replace(/^\/+|\/+$/g, '')


    // Pega a query String como um objeto
    var queryStringObject = parseURL.query;


    // Coleta o HTTP Request
    var method = req.method.toLocaleLowerCase();


    // Pega os headers como um objeto
    var headers = req.headers;

    // Coleta o payload 
   var decoder = new StringDecoder('utf-8');
   var buffer = '';
   req.on('data', function(data){
      buffer += decoder.write(data)
   });
   req.on('end', function(){
      buffer += decoder.end();

      // Escolher o handlers para ir
      var choseHandler = typeof(router[trimmePath]) !== 'undefined' ? router[trimmePath] : handlers.notFound;

      //Construir o objeto
      var data = {
         'trimmePath': trimmePath,
         'queryStringObject': queryStringObject,
         'method': method,
         'headers': headers,
         'payload': buffer
      };

      choseHandler(data, function(statusCode, payload){
         statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

         payload = typeof(payload) == 'object' ? payload : {};

         var payloadString = JSON.stringify(payload);

         res.writeHead(statusCode);
         
         // Envia o response
         res.end(payloadString);

         // Faz o log
         console.log('Returning this response: ', statusCode, payloadString)

      })


   });

 })

 // Começa o servidor e ouve na porta 3000
 server.listen(3000, function(){
    console.log("The server is listening")
 })

// Definindo handlers
var handlers = {};

// Sample handler
handlers.sample = function(data, callback){
   callback(405, {'name':'sample handler'});
};

// Nao encontrado
handlers.notFound = function(data, callback){
   callback(404);
};

// Definindo um roteador
var router = {
   'sample': handlers.sample
};