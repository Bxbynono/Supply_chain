const fs = require('fs');
const path = require('path');
const { Wallets, FileSystemWallet, X509WalletMixin } = require('fabric-network');
const CRYPTO_CONFIG = path.resolve(__dirname, '../config/crypto-config');
const CRYPTO_CONFIG_PEER_ORGS = path.join(CRYPTO_CONFIG, 'peerOrganizations')
const WALLET_FOLDER = './wallet'

var wallet
main();
async function main() {
  let action = 'list'
  if (process.argv.length > 2) {
    action = process.argv[2]
  }
  else {
    console.log(
      `Usage: node wallet.js list
        node wallet.js add supplychain Admin)
        Not enough arguments.`)
    return
  }
  console.log(CRYPTO_CONFIG_PEER_ORGS)
  wallet = await Wallets.newFileSystemWallet(WALLET_FOLDER)

  console.log(process.argv.length)
  if (action == 'list') {
    console.log("List of identities in wallet:")
    listIdentities()
  } else if (action == 'add' || action == 'export') {
    if (process.argv.length < 5) {
      console.log("For 'add' & 'export' - Org & User are needed!!!")
      process.exit(1)
    }
    if (action == 'add') {
      addToWallet(process.argv[3], process.argv[4])
      console.log('Done adding/updating.')
    } else {
      exportIdentity(process.argv[3], process.argv[4])
    }
  }
}

/**
 * @param   string  
 * @param   string  
 */
async function addToWallet(org, user) {
  try {
    var cert = readCertCryptogen(org, user)

    var key = readPrivateKeyCryptogen(org, user)

  } catch (e) {
    console.log("Error reading certificate or key!!! " + org + "/" + user)
    process.exit(1)
  }

  let mspId = createMSPId(org)

  const identityLabel = createIdentityLabel(org, user);

  const userIdentity = await wallet.get(identityLabel);
  if (userIdentity) {
    console.log(`An identity for the user "${identityLabel}" already exists in the wallet`);
    return;
  }
  const identity = {
    credentials: {
      certificate: cert,
      privateKey: key,
    },
    mspId: mspId,
    type: 'X.509',
  };

  await wallet.put(identityLabel, identity);

  console.log(`Successfully added user "${identityLabel}" to the wallet`);
}

async function listIdentities() {
  console.log("Identities in Wallet:")

    const identities = await wallet.list();

    for (const identity of identities) {
        console.log(`user: ${identity}`);
    }

}

/**
* @param {string} org 
* @param {string} user 
*/
async function exportIdentity(org, user) {
  // Label is used for identifying the identity in wallet
  let label = createIdentityLabel(org, user)

  // To retrive execute export
  let identity = await wallet.export(label)

  if (identity == null) {
    console.log(`Identity ${user} for ${org} Org Not found!!!`)
  } else {
    // Prints all attributes : label, Key, Cert
    console.log(identity)
  }
}

/**
 * Reads content of the certificate
 * @param {string} org 
 * @param {string} user 
 */
function readCertCryptogen(org, user) {
  //budget.com/users/Admin@budget.com/msp/signcerts/Admin@budget.com-cert.pem"
  var certPath = CRYPTO_CONFIG_PEER_ORGS + "/" + org + ".com/users/" + user + "@" + org + ".com/msp/signcerts/" + user + "@" + org + ".com-cert.pem"
  const cert = fs.readFileSync(certPath).toString();
  return cert
}

/**
 * Reads the content of users private key
 * @param {string} org 
 * @param {string} user 
 */
function readPrivateKeyCryptogen(org, user) {
  // ../crypto/crypto-config/peerOrganizations/budget.com/users/Admin@budget.com/msp/keystore/05beac9849f610ad5cc8997e5f45343ca918de78398988def3f288b60d8ee27c_sk
  var pkFolder = CRYPTO_CONFIG_PEER_ORGS + "/" + org + ".com/users/" + user + "@" + org + ".com/msp/keystore"
  fs.readdirSync(pkFolder).forEach(file => {
    // console.log(file);
    // return the first file
    pkfile = file
    return
  })

  return fs.readFileSync(pkFolder + "/" + pkfile).toString()
}

/**
 * Utility function
 * Creates the MSP ID from the org name for 'acme' it will be 'AcmeMSP'
 * @param {string} org 
 */
function createMSPId(org) {
  return org.charAt(0).toUpperCase() + org.slice(1) + 'MSP'
}

/**
 * Utility function
 * Creates an identity label for the wallet
 * @param {string} org 
 * @param {string} user 
 */
function createIdentityLabel(org, user) {
  return user + '@' + org + '.com';
}