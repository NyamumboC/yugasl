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
          year ? year : "2",
          chassis ? chassis : "2",
          price ? price : "1",
          
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
          applicationId: applicationId,
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
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>Yugasl Insurance</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <h1 className="text-6xl font-bold">
          Yugasl Insurance
        </h1>

        {currentAccount ? (
          <div className="w-full max-w-xs sticky top-3 z-50 ">
            <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="brand">
                  Brand
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="brand" type="text" placeholder="Brand" onChange={handleOnBrandChange} required />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="model">
                  Model
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="model" type="text" placeholder="Model" onChange={handleOnModelChange} required />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="regno">
                  Registration Number
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="regno" type="text" placeholder="Reg No" onChange={handleOnRegNoChange} required />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="year">
                  Year of Manufacture
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="year" type="number" placeholder="Year of Man" onChange={handleOnYearChange} required />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="chassis">
                  Chassis Number
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="chassis" type="number" placeholder="Chassis Number" onChange={handleOnChassisChange} required />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
                  Value of Vehicle
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="price" type="number" placeholder="Value of Vehicle" onChange={handleOnYearChange} required />
              </div>


              <div className="flex items-left justify-between">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-center text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="button"
                  onClick={applyForPolicy}
                >
                  Buy Insurance
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-full mt-3"
            onClick={connectWallet}
          >
            Connect Your Wallet
          </button>
        )}

        {allPolicy.map((policy, index) => {
          return (
            <div className="border-l-2 mt-10" key={index}>
              <div className="transform transition cursor-pointer hover:-translate-y-2 ml-10 relative flex items-center px-6 py-4 bg-blue-800 text-white rounded mb-10 flex-col md:flex-row space-y-4 md:space-y-0">
                {/* <!-- Dot Following the Left Vertical Line --> */}
                <div className="w-5 h-5 bg-blue-600 absolute -left-10 transform -translate-x-2/4 rounded-full z-10 mt-2 md:mt-0"></div>

                {/* <!-- Line that connecting the box with the vertical line --> */}
                <div className="w-10 h-1 bg-green-300 absolute -left-10 z-0"></div>

                {/* <!-- Content that showing in the box --> */}
                <div className="flex-auto">
                  <h1 className="text-md">Reg No: {policy['regNo']}</h1>
                  <h1 className="text-md">Premium: {policy['premium']}</h1>
                  <h4 className="text-md">Risk Id: {policy['riskId']}</h4>
                  <h1 className="text-md">Application Id: {policy['applicationId']}</h1>
                  <h3>Address: {policy['address']}</h3>
                  <h1 className="text-md font-bold">
                    TimeStamp: {policy['timestamp'].toString()}
                  </h1>
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
