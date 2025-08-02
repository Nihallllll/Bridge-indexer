import dotenv from "dotenv";
dotenv.config();

import { JsonRpcProvider, Contract } from "ethers";
import { abi } from "../abi";
import { listenToBridgeEvents } from "./eventListener";
import { startProcessingQueue } from "./Processing";

const providerBNB = new JsonRpcProvider(process.env.BNB!);
const providerAVA = new JsonRpcProvider(process.env.AVA!);

const contractBNB = new Contract(
  process.env.BRIDGE_CONTRACT_ADDRESS_BNB!,
  abi,
  providerBNB
);
const contractAVA = new Contract(
  process.env.BRIDGE_CONTRACT_ADDRESS_AVA!,
  abi,
  providerAVA
);

// Start Event Listeners
setInterval(() => listenToBridgeEvents(providerBNB, contractBNB, "bnb"), 5000);
setInterval(() => listenToBridgeEvents(providerAVA, contractAVA, "ava"), 5000);

// Start Queue Processor
startProcessingQueue();