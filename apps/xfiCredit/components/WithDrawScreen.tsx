/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { toast } from "@/hooks/use-toast";
import { getYieldPoolConfig } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Dispatch, SetStateAction } from "react";
import { useWriteContract } from "wagmi";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";

const WithDrawScreen = ({
  amount,
  expectedYield,
  position_id,
  setShowWithDrawModal,
  transaction_hash,
  owner,
}: {
  amount?: number;
  expectedYield?: number;
  position_id: string | null;
  transaction_hash?: string;
  setShowWithDrawModal: Dispatch<SetStateAction<boolean>>;
  owner?: string;
}) => {
  const queryClient = useQueryClient();

  const { writeContract: withDraw, isPending: isPendingWithDraw } =
    useWriteContract();

  const handleWithdraw = async () => {
    try {
      withDraw(
        { ...getYieldPoolConfig("withdraw", [position_id]) },
        {
          async onSuccess() {
            toast({
              title: "Transaction Successful",
              description: "Withdrawal was a success",
            });
            await queryClient.invalidateQueries();
            //remove transaction
            window.history.pushState({}, "", `/`);
            setShowWithDrawModal(false);
          },
          onError(error) {
            console.log(error);
            if (error.message.includes("User rejected the request")) {
              toast({
                variant: "destructive",
                title: "Transaction Rejected",
                description: "You rejected the transaction",
              });
              return;
            }
            if (error.message.includes("Still locked")) {
              toast({
                variant: "destructive",
                title: "Transaction Failed: Tokens still locked",
              });
              return;
            }
            toast({
              variant: "destructive",
              title: "Transaction Failed: something was wrong or still locked",
            });
          },
        }
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error);
    }
  };

  return (
    // <Card >

    <DialogContent className="m-2 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50">
      <DialogHeader>
        <DialogTitle className="text-foreground">Withdraw</DialogTitle>
        <DialogDescription className="space-y-4 pt-3">
          <p>This process mostly takes a few minutes.</p>
        </DialogDescription>
      </DialogHeader>
      <div className="flex items-center gap-3 w-full">
        <div className="bg-slate-200 dark:bg-slate-900/50 w-full p-4 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500">
          <p className="text-sm text-slate-400">Deposited</p>
          <p className="text-xl font-bold">
            {amount ? `${amount} FYT` : "N/A"}
          </p>
        </div>
        <div className="bg-slate-200 dark:bg-slate-900/50 w-full p-4 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500">
          <p className="text-sm  text-slate-400">Current Yield</p>
          <p className="text-xl font-bold">
            {expectedYield ? `${Number(expectedYield).toFixed(8)} FYT` : "N/A"}
          </p>
        </div>
      </div>
      <div className="bg-slate-300 dark:bg-slate-700/50 w-full p-4 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500">
        <p className="text-sm  text-slate-400">Expected Earn</p>
        <p className="text-xl font-bold">
          {expectedYield && amount
            ? `${Number(amount + expectedYield).toFixed(8)} FYT`
            : "N/A"}
        </p>
      </div>
      <Button
        disabled={isPendingWithDraw}
        onClick={handleWithdraw}
        type="button"
        variant={"default"}
        className="w-full bg-gradient-to-r from-lime-500 to-yellow-500 text-slate-800 font-semibold hover:opacity-90"
      >
        <>
          {isPendingWithDraw && (
            <div className="size-6 rounded-full animate-[spin_0.5s_linear_infinite] border-b-transparent border-[3px] border-white" />
          )}
          {isPendingWithDraw ? "Please wait..." : "Withdraw"}
        </>
      </Button>
    </DialogContent>
  );
};

export default WithDrawScreen;
