import { Button, Container, Typography, Box } from "@mui/material";
import NavBar from "../components/NavBar";
import { useNavigate } from "react-router-dom";
export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col h-screen">
      <NavBar />
      <Box
        className="flex flex-grow justify-center items-center"
        sx={{ background: (theme) => theme.palette.secondary.main }}
      >
        <Container
          maxWidth="md"
          className="flex flex-col gap-7 items-center text-center"
        >
          <Box>
            <Typography variant="h3" component="h1" color="primary">
              Quiz Generation App
            </Typography>
            <Typography variant="body1">
              Generate quizzes effortlessly with AI. Upload lecture slides and
              let AI create MCQs for you!
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            className="mt-2"
            sx={{ alignSelf: "center", mt: 1 }}
            onClick={()=>navigate('/quiz')}
          >
            Start Now
          </Button>
        </Container>
      </Box>
    </div>
  );
}
