import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  TextField,
  InputAdornment,
  Box,
  Slider,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { logout } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import logo from "../assets/logo.jpg";
import icon from "../assets/icon.png";
import { DriveEta, Image, CheckCircle, Cancel } from "@mui/icons-material";
import { Add, Edit, Delete, AttachMoney } from "@mui/icons-material";

const UserDashboard = () => {
  const [cars, setCars] = useState([]);
  const [requests, setRequests] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [statusFilter, setStatusFilter] = useState("all");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);
  const [carData, setCarData] = useState({
    name: "",
    price: "",
    image: "",
  });
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "cars"));
        const carList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCars(carList);
      } catch (error) {
        console.error("Error fetching cars:", error);
      }
    };

    const fetchRequests = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, "purchaseRequests"),
          where("userEmail", "==", user.email)
        );
        const requestSnapshot = await getDocs(q);
        const requestData = {};
        requestSnapshot.docs.forEach((doc) => {
          requestData[doc.data().carId] = {
            id: doc.id,
            status: doc.data().status,
            action: doc.data().action, 
          };
        });
        setRequests(requestData);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };

    fetchCars();
    fetchRequests();
  }, [user]);

  const handleRequestToBuy = async (car) => {
    if (!user || !user.email) {
      console.error("User not found or not logged in.");
      return;
    }

    try {
      await addDoc(collection(db, "purchaseRequests"), {
        userEmail: user.email,
        carId: car.id,
        carName: car.name,
        price: car.price,
        status: "pending",
        action: "buy",
        requestedAt: new Date().toISOString(),
      });
      alert("Buy request sent successfully!");
      setRequests((prev) => ({
        ...prev,
        [car.id]: { status: "pending", action: "buy" },
      }));
    } catch (error) {
      console.error("Error requesting to buy:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to sell a car!");
      return;
    }

    try {
      await addDoc(collection(db, "purchaseRequests"), {
        userEmail: user.email,
        carName: carData.name,
        price: carData.price,
        imageUrl: carData.image,
        status: "pending",
        action: "sell",
        requestedAt: new Date().toISOString(),
      });
      alert("Sell request sent successfully! Waiting for admin approval.");
      setOpen(false);
      setCarData({ name: "", price: "", image: "" });
    } catch (error) {
      console.error("Error adding sell request:", error);
      alert("Failed to add sell request");
    }
  };

  const filteredCars = cars.filter((car) => {
    const matchesSearch = car.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesPrice =
      car.price >= priceRange[0] && car.price <= priceRange[1];

    const requestStatus = requests[car.id]?.status || "not_requested";

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "requested" && requestStatus === "pending") ||
      (statusFilter === "accepted" && requestStatus === "accepted") ||
      (statusFilter === "rejected" && requestStatus === "rejected") ||
      (statusFilter === "not_requested" && !requests[car.id]);

    return matchesSearch && matchesPrice && matchesStatus;
  });

  const handleClose1 = () => {
    setOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChange = (e) => {
    setCarData({ ...carData, [e.target.name]: e.target.value });
  };

  return (
    <div
      style={{ minHeight: "100vh", backgroundColor: "#121212", color: "white" }}
    >
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 1000,
        }}
      >
        Sell My Car
      </Button>
      {/* Header */}
      <AppBar position="static" sx={{ backgroundColor: "#ff7b00" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box display="flex" alignItems="center" sx={{ gap: 1 }}>
            <img src={logo} alt="Logo" style={{ width: "100%", height: 40 }} />
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "white" }}
            ></Typography>
          </Box>
          <Box display="flex" alignItems="center" sx={{ gap: 1 }}>
            <Avatar
              src={user?.profilePic}
              alt={user?.name}
              onClick={handleClick}
              sx={{ cursor: "pointer" }}
            />
            <Typography
              variant="body1"
              sx={{ fontWeight: "bold", color: "white" }}
            >
              {user?.name}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Filters Section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: { xs: 3, sm: 2 },
          padding: "20px",
          backgroundColor: "#1e1e1e",
          borderRadius: "10px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
        }}
      >
        {/* Search Field */}
        <TextField
          variant="outlined"
          placeholder="Search cars..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: "#ff7b00" }} />
              </InputAdornment>
            ),
            sx: { color: "white" },
          }}
          sx={{
            width: { xs: "100%", sm: "30%" },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#FF8C00" },
              "&:hover fieldset": { borderColor: "#FF8C00" },
            },
          }}
        />

        {/* Price Range Slider */}
        <Box sx={{ width: { xs: "100%", sm: "40%" } }}>
          <Typography variant="body1" gutterBottom sx={{ color: "white" }}>
            Price Range:
          </Typography>
          <Slider
            value={priceRange}
            onChange={(e, newValue) => setPriceRange(newValue)}
            valueLabelDisplay="auto"
            min={0}
            max={10000000}
            sx={{ color: "#ff7b00" }}
          />
        </Box>

        {/* Status Filter Dropdown */}
        <FormControl
          sx={{
            width: { xs: "100%", sm: "20%" },
            "& .MuiInputLabel-root": { color: "#FF8C00" },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#FF8C00" },
              "&:hover fieldset": { borderColor: "#FF8C00" },
            },
          }}
        >
          <InputLabel sx={{ color: "#FF8C00" }}></InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{
              color: "white",
              "& .MuiSvgIcon-root": { color: "#FF8C00" },
            }}
          >
            <MenuItem value="all" sx={{ color: "white" }}>
              All
            </MenuItem>
            <MenuItem value="requested" sx={{ color: "white" }}>
              Requested
            </MenuItem>
            <MenuItem value="accepted" sx={{ color: "white" }}>
              Accepted
            </MenuItem>
            <MenuItem value="rejected" sx={{ color: "white" }}>
              Rejected
            </MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Car Listings */}
      <Grid container spacing={3} padding="20px">
        {filteredCars.map((car) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={car.id}>
            <Card
              sx={{
                backgroundColor: "#1e1e1e",
                color: "white",
                borderRadius: "10px",
                boxShadow: "2px 2px 10px rgba(255, 140, 0, 0.8)",
                transition: "transform 0.3s ease-in-out",
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              <CardMedia
                component="img"
                height="180"
                image={car.imageUrl}
                alt={car.name}
              />
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", color: "#ff7b00" }}
                >
                  {car.name}
                </Typography>
                <Typography variant="body2" marginTop={1}>
                  Price: <strong>₹{car.price}</strong>
                </Typography>
                {requests[car.id] ? (
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{
                      marginTop: 2,
                      backgroundColor:
                        requests[car.id].status === "pending"
                          ? "#d32f2f"
                          : requests[car.id].status === "rejected"
                          ? "#d32f2f"
                          : "#388e3c",
                      color: "white",
                      fontWeight: "bold",
                      "&.Mui-disabled": {
                        backgroundColor:
                          requests[car.id].status === "pending"
                            ? "#d32f2f"
                            : requests[car.id].status === "rejected"
                            ? "#d32f2f"
                            : "#388e3c",
                        color: "white",
                        opacity: 1,
                      },
                    }}
                    disabled
                  >
                    {requests[car.id].status === "pending"
                      ? "Pending Approval"
                      : requests[car.id].status === "rejected"
                      ? "Rejected"
                      : "Approved"}
                  </Button>
                ) : (
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{
                      marginTop: 2,
                      backgroundColor: "#ff7b00",
                      color: "white",
                      fontWeight: "bold",
                    }}
                    onClick={() => handleRequestToBuy(car)}
                  >
                    Request to Buy
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: "#1e1e1e",
            color: "white",
          },
        }}
      >
        <MenuItem
          onClick={handleLogout}
          sx={{ color: "white", "&:hover": { backgroundColor: "#ff7b00" } }}
        >
          Logout
        </MenuItem>
      </Menu>
      
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            backgroundColor: "#ff7b00",
            color: "white",
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontWeight: "bold",
          }}
        >
          Add Your Car
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: "#1e1e1e", padding: "20px" }}>
          <Box
            display="flex"
            flexDirection="column"
            gap={3}
            sx={{ mt: "25px" }}
          >
            <TextField
              label="Car Name"
              fullWidth
              name = "name"
              value={carData.name}
              onChange={handleChange}
              InputLabelProps={{ style: { color: "#FF8C00" } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DriveEta sx={{ color: "#FF8C00" }} />
                  </InputAdornment>
                ),
              }}
              required
              sx={{
                backgroundColor: "#2e2e2e",
                borderRadius: "5px",
                "& .MuiInputBase-input": { color: "white" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#FF8C00" },
                  "&:hover fieldset": { borderColor: "#FF8C00" },
                },
              }}
            />
            <TextField
              label="Price"
              fullWidth
              type="number"
              name = "price"
              value={carData.price}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoney sx={{ color: "#FF8C00" }} />
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{ style: { color: "#FF8C00" } }}
              sx={{
                backgroundColor: "#2e2e2e",
                borderRadius: "5px",
                "& .MuiInputBase-input": { color: "white" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#FF8C00" },
                  "&:hover fieldset": { borderColor: "#FF8C00" },
                },
              }}
            />
            <TextField
              label="Image URL"
              fullWidth
              name="image"
              value={carData.imageUrl}
              onChange={handleChange}
              InputLabelProps={{ style: { color: "#FF8C00" } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Image sx={{ color: "#FF8C00" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                backgroundColor: "#2e2e2e",
                borderRadius: "5px",
                "& .MuiInputBase-input": { color: "white" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#FF8C00" },
                  "&:hover fieldset": { borderColor: "#FF8C00" },
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: "#1e1e1e", padding: "16px" }}>
          <Button
            onClick={handleClose1}
            startIcon={<Cancel />}
            sx={{
              color: "white",
              "&:hover": { backgroundColor: "#ff4444", color: "white" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            startIcon={<Add />}
            sx={{
              backgroundColor: "#FF8C00",
              color: "white",
              fontWeight: "bold",
              "&:hover": { backgroundColor: "#ff7b00" },
            }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UserDashboard;
