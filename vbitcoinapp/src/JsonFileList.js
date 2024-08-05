import React, { useEffect, useState } from 'react';

const JsonFileList = () => {
    const [jsonFiles, setJsonFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [outputData, setOutputData] = useState('');
    const [dropdownVisible, setDropdownVisible] = useState({});

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
        setSelectedFiles((prevSelectedFiles) => {
            if (prevSelectedFiles.includes(fileName)) {
                return prevSelectedFiles.filter((file) => file !== fileName);
            } else {
                return [...prevSelectedFiles, fileName];
            }
        });
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

    const toggleDropdown = (fileName) => {
        setDropdownVisible((prev) => ({
            ...prev,
            [fileName]: !prev[fileName],
        }));
    };

    if (loading) {
        return <div className="text-center mt-20">Loading...</div>;
    }

    if (error) {
        return <div className="text-center mt-20 text-red-600">Error: {error}</div>;
    }

    return (
        <div className="bg-black text-white min-h-screen p-5">
            <h2 className="text-6xl font-extrabold text-yellow-500 text-center mb-10 relative">
                <span className="relative inline-block">
                    <span className="absolute inset-0 bg-gradient-to-r from-red-500 to-purple-800 rounded-lg transform -skew-y-2"></span>
                    <span className="relative text-shadow-lg">BITCOIN MINING SIMULATOR</span>
                </span>
            </h2>

            {selectedFiles.length > 0 && (
                <div className="mt-5 p-4 bg-gray-800 border border-yellow-500 rounded-lg animate-fade-in">
                    <h3 className="text-2xl font-semibold mb-3">Selected Files</h3>
                    <ul className="list-disc ml-5 space-y-1">
                        {selectedFiles.map((file, index) => (
                            <li key={index} className={`text-yellow-400 animate-slide-in ${index % 2 === 0 ? 'bg-gray-700' : 'bg-gray-600'} p-2 rounded`}>
                                {file}
                            </li>
                        ))}
                    </ul>
                    <button
                        className="mt-4 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition duration-300"
                        onClick={sendSelectedFiles}
                    >
                        Send to Server
                    </button>
                </div>
            )}

            <div className="mt-10">
                <h1 className="text-2xl font-semibold mb-3">Output from output.txt</h1>
                <button
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition duration-300"
                    onClick={fetchOutputData}
                >
                    Fetch Output Data
                </button>
                {loading && <p className="text-center mt-2">Loading...</p>}
                {error && <p className="text-red-600 mt-2">{error}</p>}
                <pre className="bg-gray-900 border border-yellow-500 rounded-lg p-4 mt-2 whitespace-pre-wrap">{outputData}</pre>
            </div>

            <ul className="list-none p-0 mt-10">
                {jsonFiles.length > 0 ? (
                    jsonFiles.map(({ fileName, content }, index) => (
                        <li key={index} className="bg-gray-800 border border-yellow-500 rounded-lg p-5 w-full mb-4 flex flex-col transition duration-300 hover:bg-gray-700 animate-slide-in">
                            <div className="flex items-center">
                                <button
                                    className="mr-2 flex items-center text-yellow-500 hover:text-yellow-300 px-4 py-2 border border-yellow-500 rounded-lg transition duration-300"
                                    onClick={() => toggleDropdown(fileName)}
                                >
                                    <span className={`inline-block w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent ${dropdownVisible[fileName] ? 'border-b-4 border-b-yellow-500' : 'border-t-4 border-t-yellow-500'}`}></span>
                                </button>
                                <span className="flex-grow break-words">{fileName}</span>
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-5 w-5 text-yellow-400 ml-4"
                                    checked={selectedFiles.includes(fileName)}
                                    onChange={() => handleSelectFile(fileName)}
                                />
                            </div>
                            {dropdownVisible[fileName] && (
                                <div className="mt-2 p-2 border border-yellow-400 rounded bg-gray-700">
                                    <pre>{content}</pre>
                                </div>
                            )}
                        </li>
                    ))
                ) : (
                    <li className="bg-gray-800 border border-yellow-500 rounded-lg p-5 w-full text-center animate-fade-in">No JSON files found.</li>
                )}
            </ul>
        </div>
    );
}

export default JsonFileList;