import React, { useEffect, useState } from "react";
import {
  CreateItemsSection,
  CreateItemsWrapper,
  CreateItemsHeading,
  FormInput,
  FormTextArea,
  MintButton,
} from "./CreateItemsElements";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { proxyAddress as address } from "../../contracts";
import abi from "../../contracts/Market.json";
import { notifyError, notifyInfo, notifySuccess } from "../../helper";
import { create as ipfsClient } from "ipfs-http-client";
import { Buffer } from "buffer";
const nftInterface = new ethers.utils.Interface(abi);

const projectId = "21XbUTxQd3BjlYJq9zjmy0czKgr";
const projectSecret = "cac4c8208574e13819906decb0299b42";
const authorization =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

const client = ipfsHttpClient({
  url: "https://ipfs.infura.io:5001/api/v0",
  headers: {
    authorization,
  },
});

const CreateItems = (props) => {
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({
    price: "",
    name: "",
    description: "",
  });
  useEffect(() => {
    setFileUrl(null);
    updateFormInput({ price: "", name: "", description: "" });
  }, []);

  const resetForm = () => {
    updateFormInput({
      price: "",
      name: "",
      description: "",
    });
  };
  console.log(fileUrl);
  const onChange = async (e) => {
    const file = e.target.files[0];
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      console.log(added.path);
      const url = `https://ipfs.io/ipfs/${added.path}`;
      setFileUrl(url);
      console.log(fileUrl);
    } catch (error) {
      notifyError("Oops !", "Something went wrong while uploading");
      console.log("Error uploading file: ", error);
    }
  };

  const uploadToIPFS = async () => {
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) return;
    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    });
    try {
      const added = await client.add(data);
      const url = `https://ipfs.io/ipfs/${added.path}`;
      console.log("succesfully uploaded");

      return url;
    } catch (error) {
      notifyError("Oops !", "Something went wrong while uploading");
      console.log("Error uploading file: ", error);
    }
  };

  // const listNFTForSale = async () => {
  //   try {
  //     const url = await uploadToIPFS();
  //     const provider = new ethers.providers.Web3Provider(window.ethereum);
  //     const signer = provider.getSigner();
  //     const price = ethers.utils.parseUnits(formInput.price, "ether");
  //     let contract = new ethers.Contract(address, nftInterface, signer);

  //     let transaction = await contract.createToken(url, price);
  //     await notifyInfo("Please wait !", "Transaction being processed");
  //     await transaction.wait();

  //     await notifySuccess(
  //       "Congratulations !",
  //       "You have successfully listed NFT"
  //     );
  //     await resetForm();
  //   } catch (error) {
  //     console.log(error);
  //     await notifyError(error);
  //     await resetForm();
  //   }
  // };

  const listNFTForSale = async () => {
    const urlurl = await uploadToIPFS();

    try {
      const url = await uploadToIPFS();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const price = ethers.utils.parseUnits(formInput.price, "ether");
      let contract = new ethers.Contract(address, nftInterface, signer);

      let transaction = await contract.createToken(url, price);
      await notifyInfo("Please wait !", "Transaction being processed");
      await transaction.wait();

      await notifySuccess(
        "Congratulations !",
        "You have successfully listed NFT"
      );
      await resetForm();
    } catch (error) {
      console.log(formInput);
      console.log(error);
      console.log(urlurl);
      await notifyError("Oops !", "Something went wrong while listing");
      await resetForm();
    }
  };

  return (
    <>
      <CreateItemsSection>
        <CreateItemsWrapper>
          <CreateItemsHeading>List an Item</CreateItemsHeading>
          <FormInput
            onChange={(e) =>
              updateFormInput({ ...formInput, name: e.target.value })
            }
            name="name"
            type="name"
            placeholder="Name of Item"
          />
          <FormTextArea
            onChange={(e) =>
              updateFormInput({ ...formInput, description: e.target.value })
            }
            placeholder="Description for Item"
          />
          <FormInput
            onChange={(e) =>
              updateFormInput({ ...formInput, price: e.target.value })
            }
            name="price"
            type="number"
            placeholder="Price of Item in Matic"
          />
          <FormInput onChange={onChange} type="file" style />
          <div>
            {fileUrl && (
              <img
                style={{ margin: "20px" }}
                width="350px"
                height="350px"
                alt="uploaded img"
                src={fileUrl}
              />
            )}
          </div>
          <MintButton onClick={() => listNFTForSale()}>Mint</MintButton>
        </CreateItemsWrapper>
      </CreateItemsSection>
    </>
  );
};

export default CreateItems;
