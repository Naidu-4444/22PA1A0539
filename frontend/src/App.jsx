import React, { useState } from "react";
import {
  CssBaseline,
  ThemeProvider,
  createTheme,
  Container,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import axios from "axios";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9",
    },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
  },
});
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

function App() {
  const [view, setView] = useState("shortener");

  const [url, setUrl] = useState("");
  const [validity, setValidity] = useState("");
  const [shortcode, setShortcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [statsCode, setStatsCode] = useState("");
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsData, setStatsData] = useState(null);
  const [statsError, setStatsError] = useState(null);

  const handleShorten = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const payload = { url };
      if (validity) payload.validity = parseInt(validity, 10);
      if (shortcode) payload.shortcode = shortcode;

      const response = await apiClient.post("/shorturls", payload);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchStats = async (e) => {
    e.preventDefault();
    setStatsLoading(true);
    setStatsData(null);
    setStatsError(null);
    try {
      const response = await apiClient.get(`/shorturls/${statsCode}`);
      setStatsData(response.data);
    } catch (err) {
      setStatsError(err.response?.data?.error || "Failed to fetch statistics.");
    } finally {
      setStatsLoading(false);
    }
  };

  const renderContent = () => {
    if (view === "shortener") {
      return (
        <Paper
          component="form"
          onSubmit={handleShorten}
          sx={{ p: 4, width: "100%" }}
        >
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Create a Short URL
          </Typography>
          <TextField
            fullWidth
            label="Original Long URL"
            variant="outlined"
            margin="normal"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <Box sx={{ display: "flex", gap: 2, my: 2 }}>
            <TextField
              label="Validity (minutes)"
              variant="outlined"
              type="number"
              value={validity}
              onChange={(e) => setValidity(e.target.value)}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Custom Shortcode (optional)"
              variant="outlined"
              value={shortcode}
              onChange={(e) => setShortcode(e.target.value)}
              sx={{ flex: 1 }}
            />
          </Box>
          <Box sx={{ position: "relative", mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading || !url}
              fullWidth
            >
              Shorten URL
            </Button>
            {loading && (
              <CircularProgress
                size={24}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  mt: "-12px",
                  ml: "-12px",
                }}
              />
            )}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {error}
            </Alert>
          )}
          {result && (
            <Alert severity="success" sx={{ mt: 3 }}>
              <Typography>
                Success! Short Link:{" "}
                <strong>
                  <a
                    href={result.shortLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {result.shortLink}
                  </a>
                </strong>
              </Typography>
              <Typography variant="body2">
                Expires: {new Date(result.expiry).toLocaleString()}
              </Typography>
            </Alert>
          )}
        </Paper>
      );
    }

    if (view === "stats") {
      return (
        <Paper sx={{ p: 4, width: "100%" }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            URL Statistics
          </Typography>
          <Box
            component="form"
            onSubmit={handleFetchStats}
            sx={{ display: "flex", gap: 2, mb: 4 }}
          >
            <TextField
              label="Enter Shortcode"
              variant="outlined"
              value={statsCode}
              onChange={(e) => setStatsCode(e.target.value)}
              required
              sx={{ flexGrow: 1 }}
            />
            <Button type="submit" variant="contained" disabled={statsLoading}>
              {statsLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Get Stats"
              )}
            </Button>
          </Box>

          {statsLoading && (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          )}
          {statsError && <Alert severity="error">{statsError}</Alert>}
          {statsData && (
            <Box>
              <Typography variant="h6">Results for /{statsCode}</Typography>
              <Typography sx={{ overflowWrap: "break-word" }}>
                <strong>Original URL:</strong> {statsData.originalUrl}
              </Typography>
              <Typography>
                <strong>Total Clicks:</strong> {statsData.totalClicks}
              </Typography>
              <Typography>
                <strong>Expires:</strong>{" "}
                {new Date(statsData.expiresAt).toLocaleString()}
              </Typography>

              <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                Click Details
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Referrer</TableCell>
                      <TableCell>IP Address</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {statsData.clickDetails.length > 0 ? (
                      statsData.clickDetails.map((click, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            {new Date(click.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>{click.referrer}</TableCell>
                          <TableCell>{click.ipAddress}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          No clicks yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Paper>
      );
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              URL Shortener
            </Typography>
            <Button color="inherit" onClick={() => setView("shortener")}>
              Create New
            </Button>
            <Button color="inherit" onClick={() => setView("stats")}>
              View Stats
            </Button>
          </Toolbar>
        </AppBar>

        <Container
          component="main"
          maxWidth="md"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flexGrow: 1,
            py: 4,
          }}
        >
          {renderContent()}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
