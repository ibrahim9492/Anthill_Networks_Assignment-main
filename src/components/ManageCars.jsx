import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  IconButton,
  Grid,
  Box,
  Slider,
  InputAdornment,
} from "@mui/material";
import { Add, Edit, Delete, AttachMoney, Search } from "@mui/icons-material";
import { DriveEta, Image, CheckCircle, Cancel } from "@mui/icons-material";
import { db } from "../firebase/firebaseConfig.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

const ManageCars = () => {
  const [cars, setCars] = useState([]);
  const [open, setOpen] = useState(false);
  const [carData, setCarData] = useState({ name: "", price: "", imageUrl: "" });
  const [editingCar, setEditingCar] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000000]);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    const querySnapshot = await getDocs(collection(db, "cars"));
    const carList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setCars(carList);
  };

  const handleAddCar = async () => {
    if (!carData.name || !carData.price || !carData.imageUrl) return;
    await addDoc(collection(db, "cars"), carData);
    fetchCars();
    handleClose();
  };

  const handleDeleteCar = async (id) => {
    await deleteDoc(doc(db, "cars", id));
    fetchCars();
  };

  const handleEditCar = async () => {
    if (!editingCar) return;
    await updateDoc(doc(db, "cars", editingCar.id), carData);
    fetchCars();
    handleClose();
  };

  const handleOpen = (car = null) => {
    setOpen(true);
    if (car) {
      setEditingCar(car);
      setCarData({ name: car.name, price: car.price, imageUrl: car.imageUrl });
    } else {
      setEditingCar(null);
      setCarData({ name: "", price: "", imageUrl: "" });
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const filteredCars = cars.filter(
    (car) =>
      car.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      car.price >= priceRange[0] &&
      car.price <= priceRange[1]
  );

  return (
    <div style={{ padding: "20px", minHeight: "100vh" }}>
      {/* Filters Section */}
      <Grid container spacing={3} alignItems="center" marginBottom="20px">
        {/* Search Bar */}
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            variant="outlined"
            placeholder="Search cars..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "orange" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              width: "100%",
              border: "2px solid #FF8C00",
              borderRadius: "5px",
            }}
          />
        </Grid>

        {/* Price Range Slider */}
        <Grid item xs={12} sm={6} md={4}>
          <Box>
            <Typography variant="body1" gutterBottom>
              Price Range:
            </Typography>
            <Slider
              value={priceRange}
              onChange={handlePriceChange}
              valueLabelDisplay="auto"
              min={0}
              max={10000000}
              sx={{ color: "#FF8C00" }}
            />
          </Box>
        </Grid>

        {/* Add Car Button */}
        <Grid item xs={12} sm={12} md={4} sx={{ textAlign: { xs: "center", sm: "right" } }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpen()}
            sx={{
              backgroundColor: "#FF8C00",
              color: "white",
              fontWeight: "bold",
            }}
          >
            Add Car
          </Button>
        </Grid>
      </Grid>

      {/* Car Listings */}
      <Grid container spacing={3}>
        {filteredCars.map((car) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={car.id}>
            <Card
              sx={{
                backgroundColor: "black",
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
                  sx={{ fontWeight: "bold", color: "#FF8C00" }}
                >
                  {car.name}
                </Typography>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mt={1}
                >
                  <Typography variant="body2">
                    Price: <strong>₹{car.price}</strong>
                  </Typography>
                  <Box>
                    <IconButton
                      onClick={() => handleOpen(car)}
                      sx={{ color: "#FF8C00" }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteCar(car.id)}
                      sx={{ color: "red" }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Car Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
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
          {editingCar ? <Edit /> : <Add />}
          {editingCar ? "Edit Car" : "Add Car"}
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: "#1e1e1e", padding: "20px" }}>
          <Box display="flex" flexDirection="column" gap={3} sx={{ mt: "25px" }}>
            <TextField
              label="Name"
              fullWidth
              value={carData.name}
              onChange={(e) => setCarData({ ...carData, name: e.target.value })}
              InputLabelProps={{ style: { color: "#FF8C00" } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DriveEta sx={{ color: "#FF8C00" }} />
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
            <TextField
              label="Price"
              fullWidth
              type="number"
              value={carData.price}
              onChange={(e) =>
                setCarData({ ...carData, price: e.target.value })
              }
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
              value={carData.imageUrl}
              onChange={(e) =>
                setCarData({ ...carData, imageUrl: e.target.value })
              }
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
            onClick={handleClose}
            startIcon={<Cancel />}
            sx={{
              color: "white",
              "&:hover": { backgroundColor: "#ff4444", color: "white" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={editingCar ? handleEditCar : handleAddCar}
            startIcon={editingCar ? <CheckCircle /> : <Add />}
            sx={{
              backgroundColor: "#FF8C00",
              color: "white",
              fontWeight: "bold",
              "&:hover": { backgroundColor: "#ff7b00" },
            }}
          >
            {editingCar ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ManageCars;