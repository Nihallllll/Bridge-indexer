import { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client/extension";
import { Contract } from "ethers";
import { JsonRpcProvider , Interface } from "ethers";
import { bridgeQueue } from "../Shared/redis";
import { abi } from "../abi";
import { prisma } from "../Shared/prisma";

const bridgeInterface = new Interface(abi);
export const listenToBridgeEvents = async (
    provider : JsonRpcProvider,
    contract : Contract,
    network  : "bnb" | "ava" 
)=>{
   let lastProcessedBlock = await prisma.NetworkStatus.findUnique({
    where :{network}
   })

   let lastTransactBlock = await provider.getBlockNumber();

   if(!lastProcessedBlock){
     const data = await prisma.networkStatus.create({
      data: { network, lastProcessedBlock: lastTransactBlock },
    });
    lastProcessedBlock = { ...data };
   }

   if(lastProcessedBlock.lastProcessedBlock >= lastTransactBlock)return ;

   const filter = contract.filters.Bridged_event();
   const logs = await provider.getLogs({
    ...filter,
    fromBlock: lastProcessedBlock.lastProcessedBlock + 1,
    toBlock :"latest"
   });


    for (const log of logs) {
    const parsedLog = bridgeInterface.parseLog(log);   //here bridgeInterface is the abi interface of our contract

    const txhash = log.transactionHash.toLowerCase();
    const tokenAddress = parsedLog?.args[0].toString();
    const amount = parsedLog?.args[1].toString();
    const sender = parsedLog?.args[2].toString();

    await bridgeQueue.add({
      txhash,
      tokenAddress,
      amount,
      sender,
      network,
    });
     }

  await PrismaClient.networkStatus.update({
    where: { network },
    data: { lastProcessedBlock: lastTransactBlock },
  });
}