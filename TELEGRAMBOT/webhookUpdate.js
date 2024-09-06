
const fs = require('fs');

const editWebhook = async () => {
    try {
      // Read the JSON file
      const addresses = JSON.parse(fs.readFileSync('addresses.json', 'utf8'));
  
      const response = await fetch(
        "https://api.helius.xyz/v0/webhooks/?api-key=ad99805d-0ce2-4769-96ef-3d68a34efb2d",
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            webhookURL: "https://test-helius-worker.ogbetaprosper85.workers.dev/",
            transactionTypes: ["NFT_LISTING","NFT_SALE"],
            accountAddresses: addresses,  // Use the addresses from the file
            webhookType: "enhanced"
          }),
        }
      );
      const data = await response.json();
      console.log({ data });
    } catch (e) {
      console.error("error", e);
    }
  };
  
  editWebhook();
