import { ethers } from "ethers"
import CaseAnchor from "../chain/artifacts/contracts/CaseAnchor.sol/CaseAnchor.json"

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
const RPC_URL = "http://127.0.0.1:8545"

export function getContract() {
  const provider = new ethers.JsonRpcProvider(RPC_URL)

  return new ethers.Contract(
    CONTRACT_ADDRESS,
    CaseAnchor.abi,
    provider
  )
}
