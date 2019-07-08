import getDxService from '../services/dxService'

// Grab DX instance
export const getDxContract = async (net, web3) => web3.getDutchX(net)
// Grab Tokens and Network
export async function getTokensAndNetwork(web3Instance, networkParam) {
    try {
      const bcNetwork = networkParam || await web3Instance.getNetworkId()
      const dxService = await getDxService(bcNetwork, web3Instance)
      
      // get all available tokens on DutchX Protocol
      const tokens = await dxService.getTokens()
      tokens.push({ name: 'None selected', symbol: '', address: '' })
      return { tokens, bcNetwork }
    } catch (error) {
      console.error(error)
      throw new Error(error)
    }
}