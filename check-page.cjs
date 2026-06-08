const WebSocket = require('ws');
const http = require('http');

http.get('http://localhost:9222/json', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const tabs = JSON.parse(data);
    const target = tabs.find(t => t.type === 'page' && t.url && t.url.includes('5200'));
    if (!target) { 
      console.log('No matching target found');
      console.log('Available tabs:', tabs.map(t => t.title + ' | ' + t.url).join('\n'));
      return; 
    }
    
    console.log('Connecting to:', target.title, target.url);
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    let msgId = 1;
    
    ws.on('open', () => {
      ws.send(JSON.stringify({ id: msgId++, method: 'Runtime.enable' }));
      
      ws.on('message', (data) => {
        const msg = JSON.parse(data);
        if (msg.method === 'Runtime.consoleAPICalled') {
          console.log('CONSOLE:', JSON.stringify(msg.params.args.map(a => a.value)));
        }
        if (msg.method === 'Runtime.exceptionThrown') {
          console.log('EXCEPTION:', JSON.stringify(msg.params.exceptionDetails));
        }
        if (msg.id) {
          console.log('RESULT:', JSON.stringify(msg.result));
        }
      });
      
      setTimeout(() => {
        ws.send(JSON.stringify({ id: msgId++, method: 'Runtime.evaluate', params: { expression: 'document.title' } }));
      }, 1000);
      
      setTimeout(() => {
        ws.send(JSON.stringify({ id: msgId++, method: 'Runtime.evaluate', params: { expression: 'document.getElementById("root").innerHTML.length' } }));
      }, 2000);
      
      setTimeout(() => {
        ws.send(JSON.stringify({ id: msgId++, method: 'Runtime.evaluate', params: { expression: 'document.body.textContent.substring(0,500)' } }));
      }, 3000);
      
      setTimeout(() => process.exit(0), 5000);
    });
    
    ws.on('error', (err) => console.error('WS Error:', err.message));
  });
}).on('error', (err) => console.error('HTTP Error:', err.message));
