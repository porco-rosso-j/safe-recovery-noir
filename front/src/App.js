import { ChainId, shortenAddress, useEthers, useLookupAddress } from "@usedapp/core";
import React, { useEffect, useState } from "react";

import { Body, Container, Header, Image, Link } from "./components";
import logo from "./logo.png";

import {Box, Grid, Typography, Button, Input} from "@mui/material"

import { ethers } from "ethers";

import Safe, {EthersAdapter} from '@safe-global/protocol-kit'
import Onboard from "./components/Onboard"

function App() {
  const [safeAddress, setSafeAddress] = useState("");
  const [safeSDK, setSafeSDK] = useState(null);
  const {library} = useEthers();
  const [PluginAddress, setPluginAddress] = useState("");

  useEffect(() => {
      ;(async () => {
        if(safeAddress != "") {

          const ethAdapter = new EthersAdapter({
            ethers,
            signerOrProvider: library.getSigner(0)
          })

          try {
            setSafeSDK(await Safe.create({ ethAdapter, safeAddress, isL1SafeMasterCopy:true }));
            
          } catch {
            console.log("Failed to set SafeSDK");
          }
          
        }
      })()
  }, [safeAddress])

  return (
    <Container>
      <Body>
        <Box sx={{ flexGrow: 1 }}>
            <Grid
                  item
                  container
                  alignItems="center"
                  justifyContent="center"
              >
              <Box
                component="img"
                sx={{
                  height: 60,
                  marginBottom: "20px",
                  borderRadius: 4
                }}
                src={logo}
              />
          </Grid>
          <Grid
            container
            direction="column"
            spacing={2}
            alignItems="center"
            justifyContent="center"
          >
            <Grid item >
              <Typography variant="h5" textAlign="center" color="white">
              Safe Recovery Plugin powered by Noir 🔑 
              </Typography>
            </Grid>
            { safeSDK == null ? <Grid item>
              <Grid
                sx={{pt: "30px" }}
                container
                // direction="row"
                alignItems="center"
                spacing={3}
                justifyContent="center"

              >
                <Grid item xs={15} textAlign="center" color="white" fontSize={20} >
                  0x786458FBFa964E34e417F305EDa3dbC02cA7a13D
                  <br></br>
                  Paste your Safe address below: 
                </Grid>
                <Grid item >
                  <Input
                     sx={{
                      width: "30ch",
                      color: "white",
                      borderBottom: "2px solid #aaddb5",
                      textAlign: "center"
                    }}
                    id="filled-basic" 
                    variant="filled"
                    placeholder="0x1234..."
                    size="small"
                    onChange={(e) => setSafeAddress(e.target.value)}
                  />
                </Grid>
              </Grid>
            </Grid> : 
            <Onboard safeAddress={safeAddress} safeSDK={safeSDK}/> 
            }
          </Grid> 
        </Box>
      </Body>
    </Container>
  );
}

export default App;
