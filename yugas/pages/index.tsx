import type { NextPage } from 'next'
import Head from 'next/head'
import { ethers } from "ethers";
import Image from 'next/image'

import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import { useState, useEffect } from 'react';

// Import abi
import abi from "../utils/YugasInsurance.json";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const Home: NextPage = () => {

  const contractAddress = "0x8CfD5991E207a0e3a821FDC455aEB4e1C508a5B7";

  const contractABI = abi.abi;

  /*
   * Just a state variable we use to store our user's public wallet.
   */
  const [currentAccount, setCurrentAccount] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [regNo, setRegNo] = useState("");
  const [regNo2, setRegNo2] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState("");
  const [chassis, setChassis] = useState("");
  const [price, setPrice] = useState("");

  const [claimApplicationId, setClaimApplicationId] = useState("");


  /*
   * All state property to store policies and claims
   */
  const [allPolicy, setAllPolicy] = useState<any[]>([]);
  const [allClaim, setAllClaim] = useState<any[]>([]);
  const [allClaimStatus, setAllClaimStatus] = useState<any[]>([]);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      /*
       * Check if we're authorized to access the user's wallet
       */
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        setCurrentAccount(account);
        toast.success("Wallet is Connected", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        toast.warn("Make sure you have MetaMask Connected", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error) {
      toast.error("Make sure you have MetaMask Connected", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  /**
   * Implement your connectWallet method here
   */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        toast.warn("Make sure you have MetaMask Connected", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const applyForPolicy = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const yugasInsuranceContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );


        const insuranceTxn = await yugasInsuranceContract.applyForPolicy(
          brand ? brand : handleOnBrandChange,
          model ? model : handleOnModelChange,
          regNo ? regNo : handleOnRegNoChange,
          year ? year : handleOnYearChange,
          chassis ? chassis : handleOnChassisChange,
          price ? price : handleOnPriceChange,
          
          // ethers.utils.parseEther("0.001"),
          // {
          //   gasLimit: 300000,
          // }
        );
        console.log("Mining...", insuranceTxn.hash);


        toast.info("Creating New Policy...", {
          position: "top-left",
          autoClose: 18050,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        await insuranceTxn.wait();

        console.log("Mined -- ", insuranceTxn.hash);

        setBrand("");
        setModel("");
        setRegNo("");
        setYear("");
        setChassis("");
        setPrice("");


        toast.success("Insurance Policy Created!", {
          position: "top-left",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        console.log("Policy Creation Failed!");
      }
    } catch (error) {
      toast.error(`${"Policy Creation Failed!"}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  /*
   * Create a method that gets all policies from your contract
   */
  const getAllPolicy = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const yugasInsuranceContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const policies = await yugasInsuranceContract.getAllPolicy();

        const policyCleaned = policies.map((policy: { giver: any; timestamp: number; regNo: any; premium: any; riskId: any; applicationId: any; }) => {
          return {
            address: policy.giver,
            timestamp: new Date(policy.timestamp * 1000),
            regNo: policy.regNo,
            premium: parseInt(policy.premium),
            riskId: policy.riskId,
            applicationId: parseInt(policy.applicationId),
          };
        });

        /*
         * Store our data in React State
         */
        setAllPolicy(policyCleaned);
      } else {
        console.log("Object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  /*
   * This runs our function when the page loads.
   */
  useEffect(() => {
    let yugasInsuranceContract: ethers.Contract;
    getAllPolicy();
    checkIfWalletIsConnected();

    const onNewPolicy = (from: any, timestamp: number, regNo: any, premium: any, riskId: any, applicationId: any) => {
      console.log("NewPolicy", from, timestamp, regNo, premium, riskId, applicationId);
      setAllPolicy((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          regNo: regNo,
          premium: parseInt(premium),
          riskId: riskId,
          applicationId: parseInt(applicationId),
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      yugasInsuranceContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      yugasInsuranceContract.on("NewPolicy", onNewPolicy);
    }

    return () => {
      if (yugasInsuranceContract) {
        yugasInsuranceContract.off("NewPolicy", onNewPolicy);
      }
    };
  }, []);

  const createClaim= async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const yugasInsuranceContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );


        const claimTxn = await yugasInsuranceContract.createClaim(
          regNo2 ? regNo2  : handleOnRegNo2Change,
          claimApplicationId ? claimApplicationId : handleOnApplicationIdChange,
          description ? description : handleOnDescriptionChange,
          
          // ethers.utils.parseEther("0.001"),
          // {
          //   gasLimit: 300000,
          // }
        );
        console.log("Mining...", claimTxn.hash);


        toast.info("Creating New Claim...", {
          position: "top-left",
          autoClose: 18050,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        await claimTxn.wait();

        console.log("Mined -- ", claimTxn.hash);

        setRegNo2("");
        setDescription("");
        setClaimApplicationId("");


        toast.success("Claim Created!", {
          position: "top-left",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        console.log("Claim Creation Failed!");
      }
    } catch (error) {
      toast.error(`${"Claim Creation Failed!"}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  /*
   * Create a method that gets all claims from your contract
   */
  const getAllClaim = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const yugasInsuranceContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const claims = await yugasInsuranceContract.getAllClaim();
        
        const claimCleaned = claims.map((claim: { giver: any; timestamp: number; regNo2: any; claimApplicationId: any; claimId: any; claimDescription: any; }) => {
          return {
            address: claim.giver,
            timestamp: new Date(claim.timestamp * 1000),
            regNo2: claim.regNo2,
            claimApplicationId: parseInt(claim.claimApplicationId),
            claimId: claim.claimId,
            claimDescription: parseInt(claim.claimDescription),
          };
        });

        /*
         * Store our data in React State
         */
        setAllClaim(claimCleaned);
      } else {
        console.log("Object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  /*
   * This runs our function when the page loads.
   */
  useEffect(() => {
    let yugasInsuranceContract: ethers.Contract;
    getAllClaim();
    checkIfWalletIsConnected();

    const onNewClaim = (from: any, timestamp: number, regNo2: any, claimApplicationId: any, claimId: any, claimDescription: any) => {
      console.log("NewClaim", from, timestamp, regNo2, claimApplicationId, claimId, claimDescription);
      setAllClaim((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          regNo2: regNo2,
          claimApplicationId: parseInt(claimApplicationId),
          claimId: claimId,
          claimDescription: claimDescription,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      yugasInsuranceContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      yugasInsuranceContract.on("NewClaim", onNewClaim);
    }

    return () => {
      if (yugasInsuranceContract) {
        yugasInsuranceContract.off("NewClaim", onNewClaim);
      }
    };
  }, []);

  const handleOnBrandChange = (event: { target: { value: any; }; }) => {
    const { value } = event.target;
    setBrand(value);
  };
  const handleOnModelChange = (event: { target: { value: any; }; }) => {
    const { value } = event.target;
    setModel(value);
  };
  const handleOnRegNoChange = (event: { target: { value: any; }; }) => {
    const { value } = event.target;
    setRegNo(value);
  };
  const handleOnRegNo2Change = (event: { target: { value: any; }; }) => {
    const { value } = event.target;
    setRegNo2(value);
  };
  const handleOnYearChange = (event: { target: { value: any; }; }) => {
    const { value } = event.target;
    setYear(value);
  };
  const handleOnChassisChange = (event: { target: { value: any; }; }) => {
    const { value } = event.target;
    setChassis(value);
  };
  const handleOnPriceChange = (event: { target: { value: any; }; }) => {
    const { value } = event.target;
    setPrice(value);
  };
  const handleOnDescriptionChange = (event: { target: { value: any; }; }) => {
    const { value } = event.target;
    setDescription(value);
  };
  const handleOnApplicationIdChange = (event: { target: { value: any; }; }) => {
    const { value } = event.target;
    setClaimApplicationId(value);
  };


  return (
    
    <div className="flex min-h-screen flex-col items-center justify-center py-2 bg-slate-500">
      <Head>
        <title>Yugasl Insurance</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="w-full flex-1 items-center justify-center px-20 text-center">
        <h1 className="text-6xl font-bold sticky top-3 z-50">
          Yugasl Insurance
        </h1>
        <br />
        {currentAccount ? (
          <div>
            <h3 className="text-3xl font-bold top-3 z-50 pb-8">Buy Insurance</h3>
            <div className='columns-2 pb-12'>
              <div className="flex justify-center w-full max-w-xs sticky top-3 z-50 ">
                <form className="bg-slate-100 shadow-md rounded px-12 pt-6">
                  <div className="mb-3">
                    <label className="block text-gray-700 text-sm font-bold" htmlFor="brand">
                      Brand
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-6 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="brand" type="text" placeholder="Brand" onChange={handleOnBrandChange} required />
                  </div>

                  <div className="mb-3">
                    <label className="block text-gray-700 text-sm font-bold" htmlFor="model">
                      Model
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="model" type="text" placeholder="Model" onChange={handleOnModelChange} required />
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-gray-700 text-sm font-bold" htmlFor="regno">
                      Registration Number
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="regno" type="text" placeholder="Reg No" onChange={handleOnRegNoChange} required />
                  </div>

                  <div className="mb-3">
                    <label className="block text-gray-700 text-sm font-bold" htmlFor="year">
                      Year of Manufacture
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="year" type="number" placeholder="Year of Man" onChange={handleOnYearChange} required />
                  </div>

                  <div className="mb-3">
                    <label className="block text-gray-700 text-sm font-bold" htmlFor="chassis">
                      Chassis Number
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="chassis" type="number" placeholder="Chassis Number" onChange={handleOnChassisChange} required />
                  </div>

                  <div className="mb-3">
                    <label className="block text-gray-700 text-sm font-bold" htmlFor="price">
                      Value of Vehicle
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="price" type="number" placeholder="Value of Vehicle" onChange={handleOnPriceChange} required />
                  </div>

                  <div className="flex items-center justify-center">
                    <button
                      className="bg-cyan-600 hover:bg-cyan-700 text-center text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      type="button"
                      onClick={applyForPolicy}
                    >
                      Buy Insurance
                    </button>
                  </div>
                  <br />
                </form>
              </div>
              <div className='border'>
                <br />
              <p>
                <br /><br /><br />
                  Book Your vehicle insurance with Yugasl.
                  
                  <br /> <br />
                  Pay with Matic and let us insure your vehicle
                  <br /> <br />

                  Easy, Convenient, Fast
                  <br /> <br /> 
                  We provide motor vehicle insurance for all types of vehicles. 
                  <br /> Just fill in your vehicle details on the form provided.
                  <br /> <br /> 
                  We provide coverage for up to Kes 20 million and cover most insured damage claims related solely from injuries and damage caused by an accident.
                
                </p>
                <br /><br /> <br />
                <p>In short... Be safe. Get covered
                  <br />
                  By Yugasl
                  <br /><br /><br />
                </p>
    
                <br />
                <p></p>
              </div>
              <br /><br />
            </div>
          </div>
        ) : (
          <div className='mx-24'>
            <div>
              <p>
                Welcome to our website. 
                <br/> We offer blockchain-based motor vehicle insurance!
                <br /><br /> Our innovative use of blockchain technology allows us to provide a faster, 
                more secure, and more transparent insurance experience for our customers. 
                With our system, all policy information and claims are stored on a decentralized network, 
                ensuring that your data is safe and tamper-proof.
                <br />
                <br />Our motor vehicle insurance covers a wide range of vehicles, 
                including cars, trucks, motorcycles, and more. We offer competitive rates 
                and a range of coverage options to meet your specific needs.
                <br />
                <br />In the event of a claim, our blockchain system allows for a faster 
                and more efficient claims process. All relevant information is easily accessible and verifiable, 
                making it easier for our team to assess and process your claim.
                <br />
                <br />Thank you for considering us for your motor vehicle insurance needs. 
                We look forward to the opportunity to serve you and protect your valuable assets.
                <br />
              </p>
            </div>
            <button
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-3 rounded-full mt-3"
              onClick={connectWallet}
            >
              Get Started
            </button>
            <br /><br />
          </div>
        )}

        {allPolicy.map((policy, index) => {
          return (
            <div className="border-l-2 flex justify-center" key={index}>
              <div className="transform transition cursor-pointer hover:-translate-y-2 ml-10 relative flex items-center px-6 py-4 bg-cyan-700 text-white rounded mb-10 flex-col md:flex-row space-y-4 md:space-y-0">
                {/* <!-- Content that showing in the box --> */}
                <div className="flex-auto">
                  <h3 className="text-md">Reg No: {policy['regNo']}</h3>
                  <h4 className="text-md">Premium: {policy['premium']}</h4>
                  <h6 className="text-md">Risk Id: {policy['riskId']}</h6>
                  <h3 className="text-md">Application Id: {policy['applicationId']}</h3>
                  <h4>Address: {policy['address']}</h4>
                  <h6 className="text-md font-bold">
                    TimeStamp: {policy['timestamp'].toString()}
                  </h6>
                </div>
              </div>
            </div>
          );
        })}
        {currentAccount ? (
          <div>
            <br />
              <h3 className="pt-8 pb-8 text-3xl font-bold top-3 z-50">Create Insurance Claim</h3> <br />
            <div className='flex justify-center w-full mb-20'>
            <br />
            <br />
              <div className="flex justify-center top-3 z-50">
                <form className="bg-slate-100 shadow-md rounded px-8 pt-8">
                  <h3 className="mx-80">Claim Form</h3>
                  <div className="mb-3 mr-60">
                    <label className=" block text-gray-700 text-sm font-bold" htmlFor="regNo2">
                      Vehicle Registration Number
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="regno2" type="text" placeholder="Registration Number" onChange={handleOnRegNo2Change} required />
                  </div>
                  
                  <div className="mb-3 mr-60">
                    <label className="block text-gray-700 text-sm font-bold" htmlFor="applicationId">
                      Policy Application Id
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="applicationId" type="number" placeholder="Policy Application Id" onChange={handleOnApplicationIdChange} required />
                  </div>   

                  <div className="mb-3">
                    <label
                      className="block text-black-700 text-sm font-bold mb-2" htmlFor="description"
                    >
                      Claim Description
                    </label>

                    <textarea
                      className="form-textarea mt-1 block w-full shadow appearance-none py-2 px-3 border rounded text-black-900 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="I was driving along .... Avenue when ... "
                      id="description"
                      rows={8}
                      onChange={handleOnDescriptionChange}
                      required
                    ></textarea>
                  </div>             

                  <div className="flex items-center justify-center">
                    <button
                      className="bg-cyan-600 hover:bg-cyan-700 text-center text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      type="button"
                      onClick={createClaim}
                    >
                      Create Claim
                    </button>
                  </div>
                  <br />
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div> </div>
        )}

        {allClaim.map((claim, index) => {
          return (
            <div className="border-l-2 flex justify-center" key={index}>
              <div className="transform transition cursor-pointer hover:-translate-y-2 ml-10 relative flex items-center px-6 py-4 bg-cyan-700 text-white rounded mb-10 flex-col md:flex-row space-y-4 md:space-y-0">
                {/* <!-- Content that showing in the box --> */}
                <div className="flex-auto">
                  <h3 className="text-md">Reg No: {claim['regNo2']}</h3>
                  <h4 className="text-md">Policy Id: {claim['claimApplicationId']}</h4>
                  <h6 className="text-md">claim Id: {claim['claimId']}</h6>
                  <h3 className="text-md">Claim Description: {claim['claimDescription']}</h3>
                  <h4>Address: {claim['address']}</h4>
                  <h6 className="text-md">
                    TimeStamp: {claim['timestamp'].toString()}
                  </h6>
                </div>
              </div>
            </div>
          );
        })}
      </main>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <footer className="flex h-24 w-full items-center justify-center border-t">
        <p className="flex items-center justify-center gap-2" >
          Powered by Yugasl
        </p>
      </footer>
    </div>

    
  );
};

export default Home;
