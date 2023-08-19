import React, { useEffect, useState } from "react";
import { shortenAddress, useEthers } from "@usedapp/core";
import { AppBar, Toolbar} from "@mui/material"
import { Button } from "./index";

function WalletButton() {
    const [rendered, setRendered] = useState("");
    const { account, activateBrowserWallet, deactivate, error, chainId } = useEthers();
  
    useEffect(() => {
      if (account) {
        setRendered(shortenAddress(account));
      } else {
        setRendered("");
      }
    }, [account, setRendered]);
  
    useEffect(() => {
      console.log("chainId: ", chainId)
      if (error) {
        console.error("Error while connecting wallet:", error.message);
      }
    }, [error]);
  
    return (
      <AppBar position="static" sx={{ backgroundColor: '#01796F'}}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}> SafeRecover </span>
        </div>
      <Button
        onClick={() => {
          if (!account) {
            activateBrowserWallet();
          } else {
            deactivate();
          }
        }}
      >
        {rendered === "" && "Connect Wallet"}
        {rendered !== "" && rendered}
      </Button>
      </Toolbar>
      </AppBar>
    );
  }

  export default WalletButton;
  