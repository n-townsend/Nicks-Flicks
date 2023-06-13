const http = require('http'), //Creates HTTP Variable and assigns Instance of HTTP module
      fs = require('fs'),     //Creates FS Variable and assigns Instance of FS module
      url = require('url');   //Creates URL Variable and assigns Instance of URL module

/* Now the create Server function can be called on the HTTP variable created earlier. 
Request and Response are the 2 arguments of the function */      
http.createServer((request, response) => {
    let addr = request.url,
      q = url.parse(addr, true),
      filePath = '';

// Append File function to create log of the URL and Time it is requested      
    fs.appendFile('log.txt', 'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n', (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Added to log.');
        }    
    });

    if (q.pathname.includes('documentation')) {
        filePath = (__dirname + '/documentation.html');
    } else {
        filePath = 'index.html';
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            throw err;
        }

        response.writeHead(200, { 'Content-Type': 'text/html' }); // This tells server to add a Header to the response
        response.write(data);
        response.end();

    });
}).listen(8080); // Identifies which port the server should listen for request on
console.log('My Test server is running on Port 8080');    