import { Contract, Wallet, JsonRpcProvider } from "ethers";
import { abi } from "../abi";

export const transferToken = async (
  isBNB: boolean,
  amount: string,
  sender: string,
  nonce: number
) => {
    const rpcProvider = !isBNB ? process.env.BNB : process.env.AVA;
    const privateKey =  process.env.privatekey;
    const contractAddress = !isBNB ? process.env.BNB_Add : process.env.AVA_Add;
    const provider  = new JsonRpcProvider(rpcProvider);
    const wallet = new Wallet(process.env.privateKey,provider);
    const mintInitiater = new Contract(contractAddress,wallet,abi);

      const testToken = !isBNB
    ? process.env.TESTTOKEN_BNB!
    : process.env.TESTTOKEN_AVA!;

  const tx = await mintInitiater.redeem(testToken, sender, amount, nonce);
  await tx.wait();
}