import { PrismaClient } from "@prisma/client/extension";
import { bridgeQueue } from "../Shared/redis"
import { transferToken } from "../Shared/utils";

export const startProcessingQueue= async () =>{
    bridgeQueue.process(async(job)=>{
   const { txhash, tokenAddress, amount, sender, network } = job.data;

    let transaction = await PrismaClient.transactionData.findUnique({
      where: { txHash: txhash },
    });

    if (!transaction) {
      const nonceRecord = await PrismaClient.nonce.upsert({
        where: { network },
        update: { nonce: { increment: 1 } },
        create: { network, nonce: 1 },
      });

      transaction = await PrismaClient.transactionData.create({
        data: {
          txHash: txhash,
          tokenAddress,
          amount,
          sender,
          network,
          isDone: false,
          nonce: nonceRecord.nonce,
        },
      });
    }

    if (transaction.isDone) return;

    await transferToken(network === "BNB", amount, sender, transaction.nonce);

    await PrismaClient.transactionData.update({
      where: { txHash: txhash },
      data: { isDone: true },
    });
  });
}