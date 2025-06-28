import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Grid,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { db } from "../firebase/firebaseConfig.js";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  setDoc,
} from "firebase/firestore";

const PurchaseRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [carImages, setCarImages] = useState({});
  const [filterStatus, setFilterStatus] = useState("all"); 
  const [filterType, setFilterType] = useState("all"); 
  const user = useSelector((state) => state.auth.user); 

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "purchaseRequests"),
      async (snapshot) => {
        const requestData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const carImagePromises = requestData.map(async (request) => {
          if (request.action === "sell") {
            console.log("=>", request.imageUrl);
            return { id: request.id, image: request.imageUrl };
          } else if (request.carId) {
            const carRef = doc(db, "cars", request.carId);
            const carSnap = await getDoc(carRef);
            return {
              id: request.carId,
              image: carSnap.exists()
                ? carSnap.data().imageUrl
                : "default_image_url",
            };
          }
          return { id: request.id, image: "default_image_url" };
        });

        const carImageResults = await Promise.all(carImagePromises);
        const carImageMap = carImageResults.reduce(
          (acc, item) => ({ ...acc, [item.id]: item.image }),
          {}
        );

        setCarImages(carImageMap);
        setRequests(requestData);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let filtered = requests;
    if (filterStatus !== "all") {
      filtered = filtered.filter((req) => req.status === filterStatus);
    }
    if (filterType !== "all") {
      filtered = filtered.filter((req) => req.action === filterType);
    }

    setFilteredRequests(filtered);
  }, [requests, filterStatus, filterType]);

  const handleAccept = async (request) => {
    const requestId = request.id;

    await updateDoc(doc(db, "purchaseRequests", requestId), {
      status: "accepted",
    });

    if (request.action === "sell") {
      const carRef = doc(db, "cars", request.id);
      await setDoc(carRef, {
        name: request.carName,
        price: request.price,
        imageUrl: request.imageUrl || "",
        ownerEmail: request.userEmail,
      });
    }

    setRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: "accepted" } : req
      )
    );
  };

  const handleReject = async (id) => {
    await updateDoc(doc(db, "purchaseRequests", id), { status: "rejected" });
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: "rejected" } : req))
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with Filters */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: { xs: 2, sm: 0 } }}>
          Purchase Requests
        </Typography>

        {/* Filter Controls */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            width: { xs: "100%", sm: "auto" },
          }}
        >
          {/* Status Filter */}
          <FormControl
            sx={{
              minWidth: 150,
              "& .MuiInputLabel-root": { color: "#FF8C00" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#FF8C00" },
                "&:hover fieldset": { borderColor: "#FF8C00" },
              },
            }}
          >
            <InputLabel sx={{ color: "#FF8C00" }}>Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              sx={{
                color: "white",
                "& .MuiSvgIcon-root": { color: "#FF8C00" },
              }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="accepted">Accepted</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>

          {/* Type Filter (Buy/Sell) */}
          <FormControl sx={{ minWidth: 150,
              "& .MuiInputLabel-root": { color: "#FF8C00" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#FF8C00" },
                "&:hover fieldset": { borderColor: "#FF8C00" },
              },
            }}>
            <InputLabel sx={{ color: "#FF8C00" }}>Type</InputLabel>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              sx={{
                color: "white",
                "& .MuiSvgIcon-root": { color: "#FF8C00" },
              }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="buy">Buy</MenuItem>
              <MenuItem value="sell">Sell</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Purchase Requests Grid */}
      {filteredRequests.length === 0 ? (
        <Typography variant="h6" textAlign="center" color="text.secondary">
          No {filterStatus} {filterType} requests found.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredRequests.map((request) => {
            const userName = request.userEmail || "Unknown User";
            const carImage =
              carImages[request.carId] ||
              carImages[request.id] ||
              "default_image_url";

            return (
              <Grid item xs={12} sm={6} md={4} key={request.id}>
                <Card
                  sx={{
                    maxWidth: 345,
                    boxShadow: "2px 2px 10px rgba(255, 140, 0, 0.8)",
                    transition: "transform 0.3s, box-shadow 0.3s",
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: "2px 2px 10px rgba(255, 140, 0, 0.8)",
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="180"
                    image={carImage}
                    alt={request.carName}
                  />
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold">
                      {request.carName}
                    </Typography>
                    <Typography color="text.secondary">
                      Price: ₹{request.price}
                    </Typography>
                    <Typography color="text.secondary">
                      Requested by: {userName}
                    </Typography>
                    <Typography color="text.secondary">
                      Type: {request.action}
                    </Typography>
                    <Typography
                      color={
                        request.status === "accepted"
                          ? "green"
                          : request.status === "rejected"
                          ? "red"
                          : "gray"
                      }
                      fontWeight="bold"
                    >
                      Status: {request.status}
                    </Typography>

                    {request.status === "pending" && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mt: 2,
                        }}
                      >
                        <Button
                          variant="contained"
                          color="success"
                          onClick={() => handleAccept(request)}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleReject(request.id)}
                        >
                          Reject
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default PurchaseRequests;
