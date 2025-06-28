import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebaseConfig.js";
import { collection, getDocs } from "firebase/firestore";
import {
  Card, CardContent, Typography, Grid, Box, CardMedia, CircularProgress,
  Divider
} from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import SellIcon from "@mui/icons-material/Sell";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

const Overview = () => {
  const [totalCars, setTotalCars] = useState(0);
  const [carsSold, setCarsSold] = useState(0);
  const [carsBought, setCarsBought] = useState(0);
  const [boughtList, setBoughtList] = useState([]);
  const [soldList, setSoldList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const carsSnapshot = await getDocs(collection(db, "cars"));
        setTotalCars(carsSnapshot.size);

        let carsData = {};
        carsSnapshot.forEach((doc) => {
          carsData[doc.id] = doc.data(); 
        });

        const purchaseSnapshot = await getDocs(collection(db, "purchaseRequests"));
        let soldCount = 0, boughtCount = 0;
        let soldCars = [], boughtCars = [];

        purchaseSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.status === "accepted") {
            if (data.action === "buy") {
              soldCount++;
              soldCars.push({
                ...data,
                imageUrl: carsData[data.carId]?.imageUrl || "https://via.placeholder.com/150",
              });
            } else if (data.action === "sell") {
              boughtCount++;
              boughtCars.push(data);
            }
          }
        });

        setCarsSold(soldCount);
        setCarsBought(boughtCount);
        setSoldList(soldCars);
        setBoughtList(boughtCars);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress sx={{ color: "#FF8C00" }} />
      </Box>
    );
  }

  const summaryData = [
    { label: "Total Cars", count: totalCars, icon: <DirectionsCarIcon fontSize="large" /> },
    { label: "Cars Sold", count: carsSold, icon: <SellIcon fontSize="large" /> },
    { label: "Cars Bought", count: carsBought, icon: <ShoppingCartIcon fontSize="large" /> },
  ];

  return (
    <Box p={3}>
      {/* Overview Cards */}
      <Grid container spacing={3}>
        {summaryData.map((item, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <Card
              sx={{
                backgroundColor: "#2E2E2E",
                color: "white",
                textAlign: "center",
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0px 6px 15px rgba(255, 140, 0, 0.8)",
                },
              }}
            >
              <Box sx={{ backgroundColor: "#FF8C00", py: 1.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                {item.icon}
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {item.label}
                </Typography>
              </Box>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                  {item.count}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ bgcolor: "#FF8C00", height: 2, width: "100%", mt: 5 }} />
      {/* Bought and Sold Cars List */}
      {[{ title: "Cars Bought", list: boughtList, icon: <ShoppingCartIcon sx={{ mr: 1, mb: 1.7, color: "#FF8C00" }} /> }, 
        { title: "Cars Sold", list: soldList, icon: <SellIcon sx={{ mr: 1, mb: 1.7, color: "#FF8C00" }} /> }
      ].map((section, idx) => (
        <Grid container spacing={3} mt={3} key={idx}>
          <Grid item xs={12} sx={{ display: "flex", alignItems: "center" }}>
            {section.icon}
            <Typography variant="h5" sx={{ color: "#FF8C00", fontWeight: "bold", mb: 2 }}>
              {section.title}
            </Typography>
          </Grid>
          {section.list.map((car, i) => (
            <Grid item xs={12} sm={6} key={i}>
              <Card
                sx={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#2E2E2E",
                  color: "white",
                  boxShadow: "0px 4px 10px rgba(255, 140, 0, 0.5)",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "scale(1.03)",
                    boxShadow: "0px 6px 15px rgba(255, 140, 0, 0.8)",
                  },
                }}
              >
                <CardMedia
                  component="img"
                  sx={{ width: 120, height: 100, objectFit: "cover", borderRadius: 1, ml: 2 }}
                  image={car.imageUrl || "https://via.placeholder.com/150"}
                  alt={car.carName}
                />
                <CardContent sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                    {car.carName}
                  </Typography>
                  <Typography sx={{ mb: 1 }}>Price: {car.price}</Typography>
                  <Typography>
                    {section.title === "Cars Bought" ? "Buyer" : "Seller"}: {car.userEmail}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ))}
    </Box>
  );
};

export default Overview;
