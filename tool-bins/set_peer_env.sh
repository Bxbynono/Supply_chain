#!/bin/bash
#Sets the context for native peer commands

function usage {
    echo "Usage:             . ./set_peer_env.sh  ORG_NAME"
    echo "           Sets the organization context for native peer execution"
}

if [ "$1" == "" ]; then
    usage
    exit
fi
export ORG_CONTEXT=$1
MSP_ID="$(tr '[:lower:]' '[:upper:]' <<< ${ORG_CONTEXT:0:1})${ORG_CONTEXT:1}"
export ORG_NAME=$MSP_ID

# Added this Oct 22
export CORE_PEER_LOCALMSPID=$ORG_NAME"MSP"

# Logging specifications
export FABRIC_LOGGING_SPEC=INFO

# Location of the core.yaml
export FABRIC_CFG_PATH=/workspaces/supplychain/config/customer
export FABRIC_CFG_PATH=/workspaces/supplychain/config/manufacturer

# Address of the peer
# export CORE_PEER_ADDRESS=customer.$1.com:7051
export CORE_PEER_ADDRESS=manufacturer.$1.com:7051


# Local MSP for the admin - Commands need to be executed as org admin
export CORE_PEER_MSPCONFIGPATH=/workspaces/supplychain/config/crypto-config/peerOrganizations/$1.com/users/Admin@$1.com/msp

# Address of the orderer
export ORDERER_ADDRESS=orderer.supplychain.com:7050

export CORE_PEER_TLS_ENABLED=false
