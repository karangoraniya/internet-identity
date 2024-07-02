"use client"
import Image from "next/image";
import React, { useEffect, useState } from 'react'
import { AuthClient } from "@dfinity/auth-client"
import { Actor, HttpAgent, Identity } from '@dfinity/agent';
import { idlFactory } from '@/utils/blockbolt.did'
import { _SERVICE as MyService } from '@/utils/blockbolt.did'; // Adjust the path to your did.js
import { Principal } from '@dfinity/principal';
import { Button } from "@/components/ui/button"



const blockBoltcanisterId = "bza44-ciaaa-aaaan-qlvna-cai";
const nnsCanisterId = 'mxzaz-hqaaa-aaaar-qaada-cai';
const whitelist = [nnsCanisterId, blockBoltcanisterId];
export default function Home() {

  const [greeting, setGreeting] = useState<string>("");
  const [actor, setActor] = useState<any>(null);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [identiy, setIdentiy] = useState<Identity | null>(null);
  const [addressData, setAddressData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {

    const initAuth = async () => {
      const client = await AuthClient.create();
      setAuthClient(client);

      if (await client.isAuthenticated()) {
        const identity = await client.getIdentity();
        setIdentiy(identity);
        const agent = new HttpAgent({ identity: identity });
        const actor = Actor.createActor(idlFactory, { agent, canisterId: blockBoltcanisterId });
        setActor(actor);
      }
    };

    initAuth();
  }, []);

  const login = async () => {
    if (authClient) {
      await authClient.login({
        maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000),
        onSuccess: async () => {
          const identity = await authClient.getIdentity();
          setIdentiy(identity);
          console.log(identity.getPrincipal().toString());

          const agent = new HttpAgent({ identity });
          const actor = Actor.createActor(idlFactory, { agent, canisterId: blockBoltcanisterId });

          setActor(actor);
        },
      });
    }
  };

  const addr = 'rjjpj-6zdeu-ifzlc-5b7ip-g2uyw-jtpyc-fevjt-tvqcs-dii2o-shr5f-xae'; // Replace with actual Principal ID


  const transfer = async () => {
    if (actor) {
      const toAccount = {
        owner: Principal.fromText(addr!),
        subaccount: [],
      };
      const amount = BigInt(10000); // Example amount
      const result = await actor.transfer({ toAccount, amount });
      console.log(result);
    }
  };

  const fetchAddressData = async () => {
    if (actor) {
      // Replace with your canister method to fetch address data
      const data = await actor.getAddressData(); // Example method
      setAddressData(data);
    }
  };

  const approve = async () => {
    try {
      const canisterId = nnsCanisterId;
      console.log(canisterId, 'demo');

      const identity = await client.getIdentity();
      const agent = new HttpAgent({ identity: identity });

      const actor = Actor.createActor(idlFactory, { agent, canisterId: blockBoltcanisterId });


      const text = 'My first BTC transfer';
      const memo = Array.from(new TextEncoder().encode(text));

      console.log(actor, 'actor');


      const exmple = await actor.icrc2_approve({
        from: Principal.fromText('rjjpj-6zdeu-ifzlc-5b7ip-g2uyw-jtpyc-fevjt-tvqcs-dii2o-shr5f-xae'),
        // from: Principal.fromText(
        //   '3zm3c-qhy2j-5vvce-il3fu-il4ai-wf5fs-bwwjp-dbary-numis-kgxui-rae'
        // ),

        spender: {
          owner: Principal.fromText('bza44-ciaaa-aaaan-qlvna-cai'),
          subaccount: [],
        },
        fee: [],
        memo: [memo],
        from_subaccount: [],
        created_at_time: [],
        expires_at: [],
        expected_allowance: [],
        amount: BigInt(10000),
      });
    } catch (error: any) {
      console.error('Error in randomTransfers:', error);
      setErrorMessage(
        error.message || 'An error occurred during the transfer.'
      );
    }
  };


  return (
    <div className="flex flex-row">
      <Button onClick={login}>Login</Button>
      <Button onClick={transfer}>Transfer</Button>
      <Button onClick={fetchAddressData}>Fetch Address Data</Button>

      {addressData && (
        <div>
          <h3>Address Data</h3>
          <pre>{JSON.stringify(addressData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
