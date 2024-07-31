// src/JsonFileList.js
import React, { useEffect, useState } from 'react';

const JsonFileList = () => {
    const [jsonFiles, setJsonFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h2>JSON Files in Checkpool</h2>
            <ul>
                {jsonFiles.length > 0 ? (
                    jsonFiles.map((file, index) => (
                        <li key={index}>{file}</li>
                    ))
                ) : (
                    <li>No JSON files found.</li>
                )}
            </ul>
        </div>
    );
};

export default JsonFileList;