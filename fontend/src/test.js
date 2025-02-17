import {useEffect } from "react";
import axios from "axios";

export const WebSocket = () => {

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetcInfo = await axios.get("http://localhost:3001/info");
        console.log("Info",fetcInfo.data);
      } catch (error) {
        console.error("Error fetching data:", error); 
      }
    };
  
    fetchData();
  }, []);



  return (
<div>
  test
</div>
  );
};
