import React, { useEffect, useState } from "react";
import { shortenAddress, useEthers} from "@usedapp/core";
import { Body, Container, Header, Image, Link } from "./index";
import {Box, Grid, Button, Typography, Input} from "@mui/material"
import {createKeyPair, changeOwner} from "../utils/webauthn/createKeyPair"
import {getSafePluginAddress, isPluginEnabled} from "../utils/ts/safe"
import * as ethers from "ethers"


function Onboard(props) {
    const [currentOwner, setCurrentOwner] = useState("")
    const [pendingNewOwner, setPendingNewOwner] = useState("");
    const [newOwner, setNewOwner] = useState("");
    const [SafePluginAddress, setSafePluginAddress] = useState("");
    const [isEnabled, setIsEnabled] = useState(false)
  
    useEffect(() => {
      ;(async () => {
        if(SafePluginAddress == "") {
          const PluginAddr = await getSafePluginAddress(props.safeAddress);
          console.log("PluginAddr: ", PluginAddr)
          if (PluginAddr != ethers.constants.AddressZero) {
            setSafePluginAddress(PluginAddr);
          }
        } else {
          const _isPluginEnabled = await isPluginEnabled(SafePluginAddress);
          console.log("isPluginEnabled: ", _isPluginEnabled)
          if (_isPluginEnabled) {
            setIsEnabled(_isPluginEnabled)
          }
        }
      })()
    })

    useEffect(() => {
      ;(async () => {
          const safeSDK = props.safeSDK;
          const currentOwner = await safeSDK.getOwners();
          setCurrentOwner(currentOwner[0]);
      })()
    })

    return (
       
        <Body>
              <Grid item>
                <Grid
                  pb="30px"
                  container
                  alignItems="center"
                  spacing={1}
                  justifyContent="center"
  
                >
                  <Grid item xs={15} textAlign="center" color="white" fontSize={18} >
                    - Safe: {shortenAddress(props.safeAddress)} 
                  </Grid>
                  { currentOwner != "" ? 
                  <Grid item xs={15} textAlign="center" color="white" fontSize={18} >
                    - Owner address: { shortenAddress(currentOwner) }
                  </Grid> : null } 
                   { SafePluginAddress != "" ? 
                  <Grid item xs={15} textAlign="center" color="white" fontSize={18} >
                    - WebAuthn Recover Plugin: {shortenAddress(SafePluginAddress)} 
                  </Grid> : null }
                </Grid>
              </Grid>
              { !isEnabled ?  
              <Grid item >
              <Grid item xs={15} color="white" fontSize={20} >
                   Enable plugin to gain the ability to recover your Safe with a fingerprint: 
                  </Grid>
                  <Box textAlign="center" alignItems="center">
                  <Button 
                  sx={{ mt:"35px"}}
                  variant="contained"
                  onClick={async() => {
                    await createKeyPair(props.safeAddress, props.safeSDK);
                    const _isPluginEnabled = await isPluginEnabled(SafePluginAddress);
                    if (_isPluginEnabled) {
                      setIsEnabled(_isPluginEnabled)
                    }
                  }}
                >
                  Add & Enable Plugin
                </Button>
                  </Box>
              </Grid> : 
              // null 
              <Grid item>
              <Grid
                sx={{pt: "10px" }}
                container
                alignItems="center"
                spacing={3}
                justifyContent="center"
              >
                <Grid item xs={15} textAlign="center" color="white" fontSize={20} >
                  [ 🚑 Change an owner to recover your Safe 🚑 ]
                </Grid>
                <Grid item >
                  <Input
                     sx={{
                      marginRight: "20px",
                      width: "44ch",
                      color: "white",
                      borderBottom: "2px solid #aaddb5",
                      textAlign: "center"
                    }}
                    id="filled-basic" 
                    variant="filled"
                    placeholder="0x1234..."
                    size="small"
                    onChange={(e) => setPendingNewOwner(e.target.value)}
                  />
                </Grid>
                <Box sx={{marginBottom:"6px"}} textAlign="center" alignItems="center">
                  <Button 
                  sx={{ mt:"35px"}}
                  variant="contained"
                  onClick={async() => {
                    if (pendingNewOwner != "") {
                      const newOwnerAddress = await changeOwner(
                        props.safeAddress, 
                        props.safeSDK,
                        SafePluginAddress,
                        currentOwner, 
                        pendingNewOwner
                        );
                      setNewOwner(newOwnerAddress);
                      console.log("yay!")
                    } else {
                      console.log("pending owner address not set")
                    }
                    
                  }}
                >
                  Change Owner
                </Button>
               </Box>
              </Grid>
            </Grid>
              }
        </Body>
    );
  }
  
  export default Onboard;
  