import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './FutureViewingsList.css';

import { API_URL } from './config';

// Añade este hook al inicio del componente


const FutureViewingsList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = parseInt(searchParams.get('page') || 1);
    const [futureViewings, setFutureViewings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const pageSize = 9;

    useEffect(() => {
        const fetchFutureViewings = async () => {
            setLoading(true);
            setError(null);

            const query = `
                query GetFutureViewings($page: Int!, $pageSize: Int!) {
                    futureViewings(page: $page, pageSize: $pageSize) {
                        id
                        name
                        createdAt
                        age
                        imageUrl
                        content
                        status
                    }
                }
            `;

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query,
                        variables: { page, pageSize },
                    }),
                });

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const data = await response.json();

                if (data.errors) {
                    setError(data.errors[0].message);
                } else {
                    // Filtrar solo los COMPLETED y ordenar por fecha
                    const completedViewings = data.data.futureViewings
                        .filter(viewing => viewing.status === 'COMPLETED')
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                    setFutureViewings(completedViewings);
                }
            } catch (e) {
                setError(e.message);
                console.error('Fetch error:', e);
            } finally {
                setLoading(false);
            }
        };

        fetchFutureViewings();
    }, [page, pageSize]);

    const handlePreviousPage = () => {
        if (page > 1) {
            setSearchParams({ page: page - 1 });
        }
    };

    const handleNextPage = () => {
        setSearchParams({ page: page + 1 });
    };

    if (loading) return <p>Loading future viewings...</p>;
    if (error) return <p>Error loading future viewings: {error}</p>;

    return (
        <div className="viewings-container">
            <h2>Imagenes Generadas</h2>

            {futureViewings.length > 0 ? (
                <div className="viewings-grid">
                    {futureViewings.map(viewing => (
                        <div key={viewing.id} className="viewing-card">
                            <div className="user-info">
                                <h3>{viewing.name}</h3>
                                <p>Edad: {viewing.age}</p>
                                <p>Creado el: {new Date(viewing.createdAt).toLocaleDateString()}</p>
                            </div>

                            <div className="content-section">
                                <p><strong>Prompt:</strong> {viewing.content}</p>
                            </div>

                            {viewing.imageUrl && (
                                <div className="image-container">
                                    <img
                                        src={viewing.imageUrl}
                                        alt={`Generated content: ${viewing.content}`}
                                        className="generated-image"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p>No completed viewings found.</p>
            )}

            <div className="pagination-controls">
                <button onClick={handlePreviousPage} disabled={page === 1}>
                    Anterior
                </button>
                <span>Page: {page}</span>
                <button onClick={handleNextPage}>Siguiente</button>
            </div>
        </div>
    );
};

export default FutureViewingsList;