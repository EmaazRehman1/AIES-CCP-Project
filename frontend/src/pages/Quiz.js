import React, { useState } from "react";
import { Box, Container, Typography, Tabs, Tab, Paper, Input, Button, TextField, IconButton, Select, MenuItem } from "@mui/material";
import NavBar from "../components/NavBar";
import { Toaster, toast } from 'react-hot-toast';
import { Modal } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import { InputLabel } from "@mui/material";
import { FormControl } from "@mui/material";

export default function Quiz() {
    const url = "http://127.0.0.1:8000";
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [linkLoading, setLinkLoading] = useState(false)
    const [activeTab, setActiveTab] = useState(0);
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState(null);
    const [editData, setEditData] = useState([]);
    const [formLink, setFormLink] = useState(null)
    const [editUrl, setEditUrl] = useState(null);
    const [number, setNumber] = useState(null)
    // const [data, setData] = useState({
    //     questions: [
    //         {
    //             question: "What is the capital of France?",
    //             options: ["Berlin", "Madrid", "Paris", "Rome"],
    //             correct_answer: "Paris"
    //         },
    //         {
    //             question: "Which planet is known as the Red Planet?",
    //             options: ["Earth", "Mars", "Jupiter", "Venus"],
    //             correct_answer: "Mars"
    //         },
    //         {
    //             question: "What is the square root of 64?",
    //             options: ["6", "7", "8", "9"],
    //             correct_answer: "8"
    //         }
    //     ]
    // });

    const handleGenerateQuiz = async () => {
        setFormLink(null)
        setEditUrl(null)
        setLinkLoading(true);
        const payload = {
            questions: data.questions.map(q => ({
                question: q.question,
                options: q.options,
                correct_answer: q.correct_answer
            })),
        };
        try {
            const response = await fetch("http://127.0.0.1:8000/generate-form", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            console.log(response)
            const result = await response.json();
            if (result.success) {
                console.log(result);
                toast.success("Quiz form generated successfully!");
                setFormLink(result.form_url)
                setEditUrl(result.edit_url);
            } else {
                throw new Error(result.error || "Failed to generate form");
            }
        } catch (error) {
            // setError(error.message);
            console.error("Error generating quiz:", error);
            toast.error("Failed to generate quiz form, Please check the questions and try again");
        } finally {
            setLinkLoading(false);
        }
    };
    // const handleChange = (event, newValue) => {
    //     setActiveTab(newValue);
    // };

    const handleFileChange = (event) => {
        const fileInput = event.target.files[0];
        setFile(fileInput);
    }

    const handleUpload = async () => {
        if (!file) {
            toast.error("Please select a file");
            return;
        }
        if (!number) {
            toast.error("Please select the number of questions");
            return;
        }
        setFormLink(null)
        setEditUrl(null)
        setData([])
        const formData = new FormData();
        formData.append("file", file);
        formData.append("number", number);
        try {
            setLoading(true);
            const resp = await fetch(`${url}/upload`, {
                method: 'POST',
                body: formData
            })
            if (!resp.ok) {
                throw new Error("Failed to upload file");
            }
            const data = await resp.json();
            setData(data.data);
            console.log("resp", resp)
            console.log(data.data)
        } catch (e) {
            toast.error(e.message || "Failed to upload file");
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = () => {
        if (data?.questions) {
            setEditData([...data.questions]);
            setOpen(true);
        } else {
            toast.error("No questions available to edit.");
        }
    };


    const handleSave = () => {
        const isValid = editData.every(question =>
            question.options.includes(question.correct_answer)
        );

        if (!isValid) {
            toast.error("Correct answer must be one of the options.");
            return;
        }

        setData((prevData) => ({ ...prevData, questions: editData }));
        toast.success("Quiz saved successfully")
        setOpen(false);
    };

    const handleChange = (index, field, value) => {
        const updatedData = [...editData];
        updatedData[index][field] = value;
        setEditData(updatedData);
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const updatedData = [...editData];
        updatedData[qIndex].options[oIndex] = value;
        setEditData(updatedData);
    };

    const addQuestion = () => {
        setEditData([...editData, { question: "", options: ["", "", "", ""], correct_answer: "" }]);
    };
    const handleClose = () => {
        setOpen(false);
        setEditData([]);
    };

    return (
        <Box className="flex flex-col" sx={{ background: (theme) => theme.palette.secondary.main, minHeight: '100vh' }}>
            <Toaster />
            <NavBar />
            <Container maxWidth="md" className="flex flex-col items-center flex-1 mt-5">
                <Typography variant="h4" color="primary" align="center" gutterBottom>
                    {/* Quiz Generator */}
                    Create a New Quiz
                </Typography>
                {/* <Paper elevation={3} className="w-full mt-4">
                    <Tabs
                        value={activeTab}
                        onChange={handleChange}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="fullWidth"
                    >
                        <Tab label="Create Quiz" />
                        <Tab label="Your Quizzes" />
                    </Tabs>
                </Paper> */}

                <Box className="mt-2 p-4 w-full text-center">
                    {activeTab === 0 && (
                        <Box className="flex flex-col gap-4 p-4 w-full max-w-md mx-auto">
                            <Typography variant="body1" className="text-center text-gray-600">
                                Please select a file
                            </Typography>

                            <Box className="flex flex-col items-center gap-2">
                                <Input
                                    type="file"
                                    accept=".pdf,.ppt,.pptx"
                                    className="w-full border p-2 rounded cursor-pointer bg-gray-100"
                                    onChange={handleFileChange}
                                />
                                <FormControl fullWidth >
                                    <InputLabel id="question-select-label">Number of Questions</InputLabel>
                                    <Select
                                        labelId="question-select-label"
                                        value={number || ''}
                                        onChange={(e) => setNumber(e.target.value)}
                                        label="Number of Questions"
                                        sx={{
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'rgba(0, 0, 0, 0.23)' // Default border color
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'rgba(0, 0, 0, 0.87)' // Darker on hover
                                            }
                                        }}
                                    >
                                        <MenuItem value="" disabled>Select</MenuItem>
                                        <MenuItem value={5}>5 Questions</MenuItem>
                                        <MenuItem value={10}>10 Questions</MenuItem>
                                    </Select>
                                </FormControl>
                                <Typography variant="caption" className="text-gray-500">
                                    Only PDF, PPT, and PPTX files are allowed.
                                </Typography>
                                <Button variant="contained" onClick={handleUpload}>Submit</Button>
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mt-2"></div>
                                        <p>Generating questions...</p>
                                    </div>

                                ) : (

                                    data?.questions?.map((question, qIndex) => (
                                        <Paper key={qIndex} elevation={2} sx={{
                                            p: 3, mb: 3, borderRadius: 2,
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "space-between"
                                        }}>
                                            <Typography variant="h6" sx={{ mb: 2 }}>
                                                {qIndex + 1}. {question.question}
                                            </Typography>

                                            {question.options.map((option, oIndex) => (
                                                <Box
                                                    key={oIndex}
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: 'flex-start',
                                                        width: '100%',
                                                        textAlign: 'left',
                                                        pl: 2
                                                    }}
                                                >
                                                    <Typography>
                                                        {oIndex + 1}: {option}
                                                    </Typography>

                                                </Box>

                                            ))}
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                mt: 2,
                                                p: 1,
                                                backgroundColor: '#e8f5e9',
                                                borderRadius: 1
                                            }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Correct Answer: {question.correct_answer}
                                                </Typography>
                                            </Box>
                                        </Paper>
                                    ))

                                )}
                                <div className="flex gap-2">
                                    {formLink ? null : (
                                        !linkLoading && (

                                            <>

                                                {data?.questions?.length > 1 && (
                                                    <Button variant="contained" color="success" sx={{ mt: 1 }} onClick={handleEdit}>
                                                        Edit
                                                    </Button>
                                                )}
                                                {data?.questions?.length > 1 && (
                                                    <Button variant="contained" color="primary" sx={{ mt: 1 }} onClick={handleGenerateQuiz}>
                                                        Generate Quiz Link
                                                    </Button>
                                                )}
                                            </>
                                        )
                                    )}
                                    {linkLoading ? (
                                        <div className="flex items-center gap-2 justify-center flex-col">
                                            <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mt-2"></div>
                                            <div className="font-bold">Generating link...</div>
                                        </div>
                                    ) : (

                                        formLink && (

                                            <>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    href={formLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Form Link
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    href={editUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    View Responses
                                                </Button>
                                            </>
                                        )
                                    )}
                                </div>

                            </Box>
                        </Box>

                    )}

                    {/* {activeTab === 1 && (
                        <Typography variant="h6">
                            View your saved quizzes here.
                        </Typography>
                    )} */}
                </Box>
            </Container>

            <Modal open={open} onClose={handleClose} >
                <Box sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    // width: 500,
                    bgcolor: "background.paper",
                    width: { xs: "90vw", sm: "80vw", md: "70vw", lg: "40vw" },
                    p: 4,
                    borderRadius: 2,
                    maxHeight: "80vh", // Restrict height
                    overflowY: "auto", // Enable vertical scrolling

                }}>
                    <Typography variant="h6" gutterBottom>Edit Questions</Typography>

                    {editData.map((question, qIndex) => (
                        <>
                            <div className="flex justify-center items-center mb-3">

                                <Typography variant="h6" fontWeight="bold" color="primary" key={qIndex}>Question {qIndex + 1}</Typography>
                                <IconButton color="error" onClick={() => setEditData(editData.filter((_, i) => i !== qIndex))}>
                                    <DeleteIcon />
                                </IconButton>
                            </div>
                            <Box key={qIndex} sx={{ mb: 3 }}>
                                <TextField
                                    label={`Question ${qIndex + 1}`}
                                    fullWidth
                                    value={question.question}
                                    onChange={(e) => handleChange(qIndex, "question", e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                                {question.options.map((option, oIndex) => (
                                    <TextField
                                        key={oIndex}
                                        label={`Option ${oIndex + 1}`}
                                        fullWidth
                                        value={option}
                                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                        sx={{ mb: 1 }}
                                    />
                                ))}
                                <TextField
                                    label="Correct Answer"
                                    fullWidth
                                    value={question.correct_answer}
                                    onChange={(e) => handleChange(qIndex, "correct_answer", e.target.value)}
                                    sx={{
                                        mt: 1,
                                        border: question.options.includes(question.correct_answer)
                                            ? "none"
                                            : "2px solid red",
                                        borderRadius: 1,
                                        "& .MuiInputBase-input": {
                                            color: question.options.includes(question.correct_answer) ? "inherit" : "darkred" // Change font color to red if invalid
                                        }
                                    }}
                                />

                            </Box>

                        </>
                    ))}
                    <Box sx={{ display: 'flex', gap: 3, justifyContent: 'space-between' }}>
                        <Button startIcon={<AddCircleIcon />} onClick={addQuestion}>
                            Add Question
                        </Button>
                        <div className="flex gap-2">

                            <Button variant="contained" color="secondary" onClick={handleClose}>Close</Button>
                            <Button variant="contained" color="success" onClick={handleSave}>Save</Button>

                        </div>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
}
