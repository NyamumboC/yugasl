const main = async () => {
    const yugasContractFactory = await hre.ethers.getContractFactory(
      "YugasInsurance"
    );
    const yugasInsurance = await yugasContractFactory.deploy({
      value: hre.ethers.utils.parseEther("0.1"),
    });
    await yugasContract.deployed();
    console.log("Yugas Contract deployed to:", yugasinsurance.address);
  
    /*
     * Get Contract balance
     */
    let contractBalance = await hre.ethers.provider.getBalance(
      yugasInsurance.address
    );
    console.log(
      "Contract balance:",
      hre.ethers.utils.formatEther(contractBalance)
    );
  
    /*
     * Let's try to buy an item
     */
    const yugasTxn = await yugasInsurance.applyForPolicy(
      "Toyota",
      "Corolla",
      "UAE5555",
      "2004",
      "67862347",    
      "5000")
;
    await yugasTxn.wait();
  
    /*
     * Get Contract balance to see what happened!
     */
    contractBalance = await hre.ethers.provider.getBalance(
      yugasContract.address
    );
    console.log(
      "Contract balance:",
      hre.ethers.utils.formatEther(contractBalance)
    );
  
    let allYugas = await yugasContract.getAllPolicy();
    console.log(allYugas);
  };
  
  const runMain = async () => {
    try {
      await main();
      process.exit(0);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  };
  
  runMain(); 