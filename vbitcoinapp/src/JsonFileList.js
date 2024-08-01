import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
    padding: 20px;
`;

const Title = styled.h2`
    text-align: center;
`;

const FileList = styled.ul`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    list-style-type: none;
    padding: 0;
`;

const FileItem = styled.li`
    background-color: #f0f0f0;
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 20px;
    width: calc(33.333% - 20px);
    box-sizing: border-box;
    text-align: center;
`;

const Button = styled.button`
    margin-top: 10px;
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
        background-color: #0056b3;
    }
`;

const Loading = styled.div`
    text-align: center;
    margin-top: 20px;
`;

const Error = styled.div`
    color: red;
    text-align: center;
    margin-top: 20px;
`;

const JsonFileList = () => {
    const [jsonFiles, setJsonFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [outputData, setOutputData] = useState('');
    useEffect(() => {
        const fetchJsonFiles = async () => {
            try {
                console.log("Fetching JSON files...");
                const response = await fetch('http://localhost:3001/api/json-files');
                console.log("Response status:", response.status);

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();

                console.log("Fetched data:", data);
                setJsonFiles(data);
            } catch (error) {
                console.error("Fetch error:", error.message);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchJsonFiles();
    }, []);

    const handleSelectFile = (fileName) => {
        setSelectedFiles((prevSelectedFiles) => [...prevSelectedFiles, fileName]);
    };


   

    const fetchOutputData = async () => {
        setLoading(true);
        setError('');
        
        try {
            const response = await fetch('http://localhost:3001/api/output');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.text();
            setOutputData(data);
        } catch (error) {
            console.error('Error fetching output data:', error);
            setError('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const sendSelectedFiles = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/selected-files', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ files: selectedFiles }),
            });
    
            console.log('Response status:', response.body);

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const result = await response.json();
            console.log('Server response:', result);
        } catch (error) {
            console.error('Error sending selected files:', error.message);
        }
    };

    if (loading) {
        return <Loading>Loading...</Loading>;
    }

    if (error) {
        return <Error>Error: {error}</Error>;
    }

    return (
        <Container>
            <Title>JSON Files in Checkpool</Title>
            <FileList>
                {jsonFiles.length > 0 ? (
                    jsonFiles.map((file, index) => (
                        <FileItem key={index}>
                            {file}
                            <Button onClick={() => handleSelectFile(file)}>Select</Button>
                        </FileItem>
                    ))
                ) : (
                    <FileItem>No JSON files found.</FileItem>
                )}
            </FileList>
            {selectedFiles.length > 0 && (
                <div>
                    <h3>Selected Files:</h3>
                    <ul>
                        {selectedFiles.map((file, index) => (
                            <li key={index}>{file}</li>
                        ))}
                    </ul>
                    <Button onClick={sendSelectedFiles}>Send to Server</Button>
                </div>
            )}

<div>
            <h1>Output from output.txt</h1>
            <button onClick={fetchOutputData}>Fetch Output Data</button>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <pre>{outputData}</pre> {/* Use <pre> for preformatted text */}
        </div>
        </Container>
    );
};

export default JsonFileList;