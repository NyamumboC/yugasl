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
  const [year, setYear] = useState<number | undefined>(1);
  const [chassis, setChassis] = useState<number | undefined>(1);
  const [price, setPrice] = useState<number | undefined>(1);
  const [riskId, setRiskId] = useState<number | undefined>(1);
  const [applicationId, setApplicationId] = useState<number | undefined>(1);
  const [premium, setPremium] = useState<number | undefined>(1);

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

        // let count = await yugasInsuranceContract.getAllPolicy();
        // console.log("Retrieved total policies count...", count.toNumber());

        /*
         * Execute the actual policies from your smart contract
         */
        const insuranceTxn = await yugasInsuranceContract.applyForPolicy(
          brand ? brand : handleOnBrandChange,
          model ? model : handleOnModelChange,
          regNo ? regNo : handleOnRegNoChange,
          year ? year : "2023",
          chassis ? chassis : "26963036",
          price ? price : "450000",
          
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
        setYear(1);
        setChassis(1);
        setPrice(1);


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
  const handleOnYearChange = (event: { target: { value: any; }; }) => {
    const { value } = event.target.value.replace(/\+|-/ig, '').replace("E", "");
    setYear(value);
  };
  const handleOnChassisChange = (event: { target: { value: any; }; }) => {
    const { value } = event.target.value.replace(/\+|-/ig, '').replace("E", "");
    setChassis(value);
  };
  const handleOnPriceChange = (event: { target: { value: any; }; }) => {
    const { value } = event.target.value.replace(/\+|-/ig, '').replace("E", "");
    setPrice(value);
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
          <div className='columns-2'>
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
                    id="price" type="number" placeholder="Value of Vehicle" onChange={handleOnYearChange} required />
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
        ) : (
          <div>
            <div>
              <p>
              <br /> Providing motor vehicle insurance for all major types of vehicles, ATVs (all-terrain vehicles), golf carts or any similar type.
              <br /> Providing coverage up to Kes 20 million as part which is limited liability with respect thereto covering most insured damage claims related solely from injuries caused by accident against such passenger car/truck while it was owned by another driver under 
              contract on terms having been specifically arranged not exceeding six months prior at the time where collision occurred upon condition that both parties be identified individually 
              pursuant also being licensed drivers before issuance of notice thereof unless otherwise authorize
              </p>
              <br />
              <p>In short... Be safe. Get covered</p>
              <br />
              <p></p>
            </div>
            <button
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-3 rounded-full mt-3"
              onClick={connectWallet}
            >
              Get Started
            </button>
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
