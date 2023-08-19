import "./index.css";

import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { DAppProvider, Goerli, Localhost, Hardhat } from "@usedapp/core";
import React from "react";
import ReactDOM from "react-dom";

import App from "./App";
import WalletButton from "./components/WalletButton";

// IMPORTANT, PLEASE READ
// To avoid disruptions in your app, change this to your own Infura project id.
// https://infura.io/register
const INFURA_PROJECT_ID = "dbcc112f6c7446048a00dbb370a1339b";
const config = {
  readOnlyChainId: Goerli.chainId,
  readOnlyUrls: {
    //[Goerli.chainId]: "https://goerli.infura.io/v3/" + INFURA_PROJECT_ID,
    [Goerli.chainId]:"http://localhost:8545",
    // [Hardhat.chainId]: "http://localhost:8545"
  },
};

// You should replace this url with your own and put it into a .env file
// See all subgraphs: https://thegraph.com/explorer/
const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: "https://api.thegraph.com/subgraphs/name/paulrberg/create-eth-app",
});

ReactDOM.render(
  <React.StrictMode>
    <DAppProvider config={config}>
      <ApolloProvider client={client}>
        <WalletButton />
        <App />
      </ApolloProvider>
    </DAppProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
