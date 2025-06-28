import React, { useState } from "react";
import {
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  CssBaseline,
  Box,
  Divider,
  Avatar,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import MuiAppBar from "@mui/material/AppBar";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/authSlice";
import ManageCars from "../components/ManageCars";
import PurchaseRequests from "../components/PurchaseRequests";
import Overview from "../components/Overview";

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

const drawerWidth = 240;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  })
);
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const AdminDashboard = () => {
  const [open, setOpen] = useState(true);
  const [selectedView, setSelectedView] = useState("Overview");
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleMenuItemClick = (view) => {
    setSelectedView(view);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };
  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, ...(open && { display: "none" }), color: "white" }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1, color: "white" }}>
            Admin Dashboard
          </Typography>

          {/* Profile Section */}
          {user ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar src={user?.profilePic} alt={user?.name} />
              <Typography
                variant="body1"
                sx={{ fontWeight: "bold", color: "white" }}
              >
                {user.name}
              </Typography>
            </Box>
          ) : (
            <AccountCircleIcon sx={{ fontSize: 30 }} />
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant="persistent"
        anchor="left"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
        }}
      >
        <Box>
          <DrawerHeader>
            <IconButton
              onClick={handleDrawerClose}
              color="inherit"
              sx={{ "&:hover": { backgroundColor: "#444", color: "white" } }}
            >
              <ChevronLeftIcon />
            </IconButton>
          </DrawerHeader>

          <styledList>
            {[
              { text: "Overview", icon: <DashboardIcon /> },
              { text: "Manage Cars", icon: <DirectionsCarIcon /> },
              { text: "Purchase Requests", icon: <AssignmentIcon /> },
            ].map((item) => (
              <ListItemButton
                key={item.text}
                onClick={() => handleMenuItemClick(item.text)}
                selected={selectedView === item.text}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "primary.main",
                    color: "white",
                  },
                  "&.Mui-selected:hover": { backgroundColor: "primary.dark" },
                  "&:hover": { backgroundColor: "#444" },
                }}
              >
                {item.icon}
                <ListItemText primary={item.text} sx={{ marginLeft: 2 }} />
              </ListItemButton>
            ))}
          </styledList>
        </Box>
        <Box sx={{ marginTop: "auto" }}>
          <Divider sx={{ bgcolor: "#ff7b00" }} />
          <ListItemButton
            onClick={handleLogout}
            sx={{ "&:hover": { backgroundColor: "#ff7b00" }, gap: "32px" }}
          >
            <ExitToAppIcon />
            <ListItemText primary="Logout" sx={{ marginLeft: 2 }} />
          </ListItemButton>
        </Box>
      </Drawer>
      <Main open={open}>
        <Toolbar />
        {selectedView === "Overview" && <Overview/>}
        {selectedView === "Manage Cars" && <ManageCars />}
        {selectedView === "Purchase Requests" && <PurchaseRequests />}
      </Main>
    </Box>
  );
};

export default AdminDashboard;
