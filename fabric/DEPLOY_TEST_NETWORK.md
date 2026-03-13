
# Hyperledger Fabric Test-Network Deployment (Dev)

1) Clone fabric-samples (outside this repo):
- git clone https://github.com/hyperledger/fabric-samples
- cd fabric-samples/test-network

2) Start network + channel:
- ./network.sh down
- ./network.sh up createChannel -ca

3) Deploy chaincode (from THIS repo path):
From fabric-samples/test-network, run something like:

./network.sh deployCC -ccn caseflow -ccp <ABS_PATH_TO_THIS_REPO>/fabric/chaincode/caseflow -ccl typescript

4) Verify:
- Use peer chaincode query/invoke per fabric-samples docs.
