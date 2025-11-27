const fs = require('fs');
const content = fs.readFileSync('src/nlp/gemini-agent.ts', 'utf-8');

const newExamples = `User: "Update my last entry for Acme and set rate to $100"
Response: [{"type":"update_entry","target":{"lastForClient":"Acme"},"payload":{"hourlyRate":100}}]

User: "Delete my last entry"
Response: [{"type":"delete_entry","target":{"last":true}}]

User: "Delete all entries for Acme Corp from last week"
Response: [{"type":"delete_entry","target":{"clientName":"Acme Corp","dateFrom":"2025-11-14","dateTo":"2025-11-21"}}]

User: "Show me total hours by client" or "Hours per client"
Response: [{"type":"show_summary","payload":{"groupBy":"client"}}]

User: "Show total pending" or "How much is pending?" or "Unpaid work"
Response: [{"type":"show_summary","target":{"paymentStatus":"pending"}}]

User: "Show me hours for Acme Corp"
Response: [{"type":"show_summary","target":{"clientName":"Acme Corp"}}]

IMPORTANT:`;

const updated = content.replace(
  /User: "Update my last entry for Acme and set rate to \$100"\nResponse: \[{"type":"update_entry","target":{"lastForClient":"Acme"},"payload":{"hourlyRate":100}}\]\n\nIMPORTANT:/,
  newExamples
);

fs.writeFileSync('src/nlp/gemini-agent.ts', updated);
console.log('File updated successfully');
